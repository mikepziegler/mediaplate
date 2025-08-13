import { Component, inject, OnInit } from '@angular/core';
import { FileService } from './file.service';
import { AppLayoutComponent, FileExplorerComponent } from '@mediaplate/ui';
import { FileNode, FileNodeType } from '@mediaplate/common';

@Component({
    selector: 'app-start',
    template: `
        <ui-app-layout>
            <div>
                <div class="p-6 flex flex-col gap-4">
                    <div>
                        <ui-file-explorer
                            [nodes]="nodes"
                            rootLabel="Project"
                            (pathChange)="onPathChange($event)"
                            (fileClick)="onFileClick($event)"
                        />
                    </div>
                </div>
            </div>
        </ui-app-layout>
    `,
    providers: [FileService],
    imports: [AppLayoutComponent, FileExplorerComponent],
})
export class StartComponent implements OnInit {
    tree: FileNode[] = [];
    private fileService = inject(FileService);

    ngOnInit() {
        /*
        this.fileService.getAllFiles().subscribe((tree) => {
            console.log(tree);

            this.tree = plainToInstance(FileNode, tree);
        });

         */
    }

    handleFiles(files: File[]) {
        if (!files) return; // TODO: Error handling

        console.log(files);

        /*
        this.fileService.uploadFile(files).subscribe({
            next: (res: any) => console.log('Upload successful:', res),
            error: (err: any) => console.error('Upload failed:', err),
            complete: () => {
                this.ngOnInit();
            }
        });

         */
    }

    nodes: FileNode[] = [
        new FileNode({
            name: 'folder1',
            type: FileNodeType.Folder,
            children: [
                new FileNode({ name: 'file4', type: FileNodeType.Folder }),
                new FileNode({ name: 'main.ts', type: FileNodeType.File }),
            ],
        }),
        new FileNode({
            name: 'folder2',
            type: FileNodeType.Folder,
            children: [
                new FileNode({ name: 'file5', type: FileNodeType.Folder }),
                new FileNode({ name: 'main.ts', type: FileNodeType.File }),
            ],
        }),
        new FileNode({ name: 'file1', type: FileNodeType.Folder }),
        new FileNode({ name: 'file2.md', type: FileNodeType.File }),
    ];

    onPathChange(path: FileNode[]) {
        // e.g., sync with router: /src/app
        const parts = path.map(p => p.name).join('/');
        console.log('Now in:', parts || '(root)');
    }

    onFileClick(file: FileNode) {
        console.log('Open file:', file.name);
    }
}
