import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FileNode, FileNodeType } from '@mediaplate/common';
import { FolderIcon } from '@mediaplate/icons';

@Component({
    selector: 'ui-file-tree',
    template: `
        <div class="flex flex-col divide-y">
            <div class="flex flex-col divide-y gap-2">
                @for (node of filterFolders(nodes); let i = $index; track i) {
                <div
                    class="h-16 w-full flex p-4 gap-4"
                    [class.bg-blue-300]="node === dragOverNode"
                    [class.border-2]="node === dragOverNode"
                    [class.border-blue-400]="node === dragOverNode"
                    (dragenter)="onFolderDragEnter($event, node)"
                    (dragover)="onFolderDragOver($event, node)"
                    (dragleave)="onFolderDragLeave($event, node)"
                    (drop)="onFolderDrop($event, node)"
                >
                    <div class="flex justify-center items-center flex-0">
                        <icon-folder />
                    </div>
                    <div class="flex justify-center items-center flex-0">
                        <span>{{ node.name }}</span>
                    </div>
                    <div class="flex justify-center items-center flex-1"></div>
                    <div class="flex justify-center items-center flex-0"></div>
                </div>
                }
            </div>

            <div
                class="flex flex-col divide-y"
                [class.bg-blue-300]="isDraggingFiles"
                [class.border-blue-400]="isDraggingFiles"
                (dragenter)="onFileDragEnter($event)"
                (dragleave)="onFileDragLeave($event)"
                (drop)="onFileDrop($event)"
            >
                @for (node of filterFiles(nodes); let i = $index; track i) {
                <div class="h-16 w-full flex p-4">
                    <div class="flex justify-center items-center flex-0">
                        <span>{{ node.name }}</span>
                    </div>
                    <div class="flex justify-center items-center flex-1"></div>
                    <div class="flex justify-center items-center flex-0"></div>
                </div>
                }
            </div>
        </div>
    `,
    imports: [FolderIcon],
})
export class FileTreeComponent {
    @Input() accept = '';
    @Input() nodes: FileNode[] = [];
    @Input() disabled = false;

    @Output() fileDropped = new EventEmitter<File[]>();

    dragOverNode: FileNode | null = null;
    isDraggingFiles = false;

    isDragging = false;

    filterFolders(nodes: FileNode[]) {
        return nodes.filter((node) => node.type === FileNodeType.Folder);
    }

    filterFiles(nodes: FileNode[]) {
        return nodes.filter((node) => node.type === FileNodeType.File);
    }

    onFolderDragEnter(event: DragEvent, node: FileNode) {
        console.log('dragEnter', event, node);
        this.dragOverNode = node;
    }

    onFolderDragOver(event: DragEvent, node: FileNode) {
        console.log('dragEnter', event, node);
        this.dragOverNode = node;
    }

    onFolderDragLeave(event: DragEvent, node: FileNode) {
        console.log('dragLeave', event, node);

        if (this.dragOverNode === node) {
            this.dragOverNode = null;
        }
    }

    onFolderDrop(event: DragEvent, node: FileNode) {
        console.log('drop', event, node);

        event.preventDefault();
        if (!event.dataTransfer) return;

        this.dragOverNode = null;
        // const files = event.dataTransfer.files;
    }

    onFileDragEnter(event: DragEvent) {
        console.log('dragEnter', event);
        this.isDraggingFiles = true;
    }

    onFileDragLeave(event: DragEvent) {
        console.log('dragLeave', event);
        this.isDraggingFiles = false;
    }

    async onFileDrop(event: DragEvent) {
        console.log('drop', event);

        await this.handleDrop(event);
    }

    private async handleDrop(event: DragEvent) {
        if (this.disabled) return;
        event.preventDefault();
        this.isDragging = false;

        const items = event.dataTransfer?.items;
        if (!items) return;

        const files: File[] = [];
        const promises: Promise<void>[] = [];

        for (let i = 0; i < items.length; i++) {
            const entry = items[i].webkitGetAsEntry?.();
            if (entry) {
                promises.push(this.traverseFileTree(entry, '', files));
            }
        }

        await Promise.all(promises);

        const acceptedFiles =
            this.accept.length > 0
                ? files.filter((file) => this.accept.includes(file.type))
                : files;

        if (acceptedFiles.length > 0) {
            this.fileDropped.emit(acceptedFiles);
        }
    }

    private traverseFileTree(
        entry: any,
        path: string,
        files: File[]
    ): Promise<void> {
        return new Promise((resolve) => {
            if (entry.isFile) {
                entry.file((file: File) => {
                    (file as any).relativePath = path + file.name;
                    files.push(file);
                    resolve();
                });
            } else if (entry.isDirectory) {
                const dirReader = entry.createReader();
                dirReader.readEntries((entries: any[]) => {
                    const subPromises = entries.map((e) =>
                        this.traverseFileTree(e, path + entry.name + '/', files)
                    );
                    Promise.all(subPromises).then(() => resolve());
                });
            } else {
                resolve();
            }
        });
    }
}
