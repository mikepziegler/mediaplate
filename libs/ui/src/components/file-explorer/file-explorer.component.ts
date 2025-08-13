import { Component, computed, EventEmitter, Output, signal, Input } from '@angular/core';
import { FileNode, FileNodeType } from '@mediaplate/common';
import {
    CdkDrag,
    CdkDragDrop,
    CdkDragEnter,
    CdkDragPreview,
    CdkDropList,
    CdkDropListGroup
} from '@angular/cdk/drag-drop';
import { NgClass } from '@angular/common';

@Component({
    selector: 'ui-file-explorer',
    imports: [NgClass, CdkDropListGroup, CdkDropList, CdkDrag, CdkDragPreview],
    templateUrl: 'file-explorer.component.html',
})
export class FileExplorerComponent {
    @Input({ required: true }) set nodes(value: FileNode[]) {
        this.root.set(value ?? []);
        this.path.set([]);
    }
    @Input() rootLabel = 'Root';

    @Output() pathChange = new EventEmitter<FileNode[]>();
    @Output() fileClick = new EventEmitter<FileNode>();
    @Output() moveFile = new EventEmitter<{ file: FileNode; to: FileNode | null }>();
    @Output() moveFileToPath = new EventEmitter<{ file: FileNode; path: string[] }>();

    root = signal<FileNode[]>([]);
    path = signal<FileNode[]>([]);
    draggingFile = signal<FileNode | null>(null);
    hoverFolder = signal<FileNode | null>(null);

    currentList = computed<FileNode[]>(() => {
        const p = this.path();
        if (!p.length) return this.root();
        return p[p.length - 1].children ?? [];
    });

    folders = computed(() =>
        this.currentList()
            .filter((n) => n.type === FileNodeType.Folder)
            .sort((a, b) => a.name.localeCompare(b.name))
    );
    files = computed(() =>
        this.currentList()
            .filter((n) => n.type === FileNodeType.File)
            .sort((a, b) => a.name.localeCompare(b.name))
    );

    // NAV
    openFolder(node: FileNode) {
        if (node.type !== FileNodeType.Folder) return;
        this.path.set([...this.path(), node]);
        this.pathChange.emit(this.path());
    }
    goUp() {
        const p = this.path();
        if (!p.length) return;
        this.path.set(p.slice(0, -1));
        this.pathChange.emit(this.path());
    }
    goToCrumb(i: number) {
        if (i < 0) this.path.set([]);
        else this.path.set(this.path().slice(0, i + 1));
        this.pathChange.emit(this.path());
    }

    // Only allow files to enter a folder drop area
    canEnterFolder = (drag: any, drop: any) => {
        const data = drag?.data as FileNode | undefined;
        return !!data && data.type === FileNodeType.File;
    };

    onFolderEnter(_ev: CdkDragEnter<FileNode>, folder: FileNode) {
        // highlight when a file is being dragged over
        if (this.draggingFile()) this.hoverFolder.set(folder);
    }
    onFolderExit() {
        this.hoverFolder.set(null);
    }

    onFolderDrop(
        ev: CdkDragDrop<FileNode, FileNode, FileNode>,
        targetFolder: FileNode
    ) {
        this.hoverFolder.set(null);
        const file = ev.item.data;
        if (!file || file.type !== FileNodeType.File) return;

        // Move the file in the tree
        const removed = this.removeFromTree(this.root(), file);
        if (!removed) return;

        if (!targetFolder.children) targetFolder.children = [];
        targetFolder.children.push(file);

        // Emit if parent needs to sync with a backend / state store
        this.moveFile.emit({ file, to: targetFolder });

        // Refresh signals to update the UI
        this.root.set([...this.root()]);
    }

    // Utility: remove a node from wherever it currently lives in the tree
    private removeFromTree(nodes: FileNode[], target: FileNode): boolean {
        const idx = nodes.indexOf(target);
        if (idx >= 0) {
            nodes.splice(idx, 1);
            return true;
        }
        for (const n of nodes) {
            if (n.children && this.removeFromTree(n.children, target))
                return true;
        }
        return false;
    }

    trackByKey = (_: number, item: FileNode) => `${item.type}:${item.name}`;

    areaHover = signal(false);

    canEnterArea = (drag: any) => {
        const data = drag?.data as FileNode | undefined;
        return !!data && data.type === FileNodeType.File;
    };

    onAreaEnter() {
        if (this.draggingFile()) this.areaHover.set(true);
    }
    onAreaExit() {
        this.areaHover.set(false);
    }

    private getCurrentContainer(): FileNode[] {
        const p = this.path();
        if (!p.length) return this.root();
        const leaf = p[p.length - 1];
        leaf.children ??= [];
        return leaf.children;
    }

    onAreaDrop(ev: CdkDragDrop<FileNode, FileNode, FileNode>) {
        this.areaHover.set(false);
        const file = ev.item.data;
        if (!file || file.type !== FileNodeType.File) return;

        // If the file already belongs to the current container, do nothing
        const container = this.getCurrentContainer();
        if (container.includes(file)) return;

        // Remove from wherever it currently is and add to current directory
        const removed = this.removeFromTree(this.root(), file);
        if (!removed) return;

        container.push(file);

        // refresh signals / notify parent
        this.root.set([...this.root()]);
        this.moveFile.emit({ file, to: this.path().slice(-1)[0] ?? null }); // null means dropped into root
    }

    crumbHover = signal<FileNode | null>(null);
    rootHover = signal(false);

    canEnterBreadcrumb = (drag: any) => {
        const data = drag?.data as FileNode | undefined;
        return !!data && data.type === FileNodeType.File;
    };

    onCrumbEnter(_ev: any, folder: FileNode | null) {
        if (!this.draggingFile()) return;
        if (folder === null) this.rootHover.set(true);
        else this.crumbHover.set(folder);
    }

    onCrumbExit() {
        this.rootHover.set(false);
        this.crumbHover.set(null);
    }

    private getContainerFor(target: FileNode | null): FileNode[] {
        if (!target) return this.root(); // Root level
        target.children ??= [];
        return target.children;
    }

    private navigateToCrumb(target: FileNode | null) {
        if (target === null) {
            this.path.set([]);
        } else {
            const p = this.path();
            const i = p.indexOf(target);
            if (i >= 0) this.path.set(p.slice(0, i + 1));
            // else: target not in current path (e.g. rare custom crumb) -> keep current path
        }
        this.pathChange.emit(this.path());
    }

    onCrumbDrop(ev: CdkDragDrop<FileNode, FileNode, FileNode>, target: FileNode | null) {
        // clear hover states
        this.rootHover?.set?.(false);
        this.crumbHover?.set?.(null);

        const file = ev.item.data;
        if (!file || file.type !== FileNodeType.File) return;

        // destination container: null target means Root
        const dest = target === null ? this.root() : (target.children ??= []);

        // If already in destination, just refresh to ensure UI sync and stop.
        if (dest.includes(file)) {
            this.root.set([...this.root()]);
            this.moveFile.emit({ file, to: target }); // 'to' can be null if you typed it that way
            return;
        }

        // Remove from current location
        const removed = this.removeFromTree(this.root(), file);
        if (!removed) return;


        // Add to destination
        dest.push(file);

        // 🔄 Refresh signals so the current list recomputes,
        // but DO NOT change this.path — no navigation.
        this.root.set([...this.root()]);

        console.log(this.root)

        this.moveFile.emit({ file, to: target });
        const newPath = target ? [...this.path().slice(0, this.path().indexOf(target) + 1)].map(n => n.name) : [];
        this.moveFileToPath.emit({ file, path: newPath }); // empty path = Root
    }

    hoverIsRoot() {
        return (this.crumbHover() as any).name === '__ROOT__'
    }
}
