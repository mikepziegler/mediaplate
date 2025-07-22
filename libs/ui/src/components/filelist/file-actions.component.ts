import { Component, Input } from '@angular/core';
import { FileNode } from '@mediaplate/common';


@Component({
    selector: 'ui-file-actions',
    template: `
        <div class="relative flex gap-2 items-center">
            <button (click)="onOpen(node)" class="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded">Open</button>
            @if (node.type === 'file') {
                <button (click)="onDownload(node)" class="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded">Download</button>
            }

            <button (click)="onRename(node)" class="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded">Rename</button>

            <button (click)="toggleMoreOptions()" class="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded">⋯</button>

            @if (showMore) {
                <div
                    class="absolute top-full left-0 mt-2 bg-white border rounded shadow-md z-50 p-2 w-48">
                    <button (click)="onDelete(node)" class="text-left px-4 py-2 text-sm hover:bg-gray-100">🗑 Delete</button>
                    <button (click)="onMove(node)" class="text-left px-4 py-2 text-sm hover:bg-gray-100">📁 Move</button>
                    <button (click)="onCopy(node)" class="text-left px-4 py-2 text-sm hover:bg-gray-100">📄 Copy</button>
                    <button (click)="onShare(node)" class="text-left px-4 py-2 text-sm hover:bg-gray-100">🔗 Share</button>
                    <button (click)="onPreview(node)" class="text-left px-4 py-2 text-sm hover:bg-gray-100">ℹ️ Properties</button>

                    @if (node.type === 'file') {
                        <button (click)="onProperties(node)" class="text-left px-4 py-2 text-sm hover:bg-gray-100">👁 Preview</button>
                    }

                    @if (node.type === 'folder') {
                        <button (click)="onZip(node)" class="text-left px-4 py-2 text-sm hover:bg-gray-100">🗜 Zip</button>
                    }

                    @if (node.name.endsWith('.zip')) {
                        <button (click)="onUnzip(node)" class="text-left px-4 py-2 text-sm hover:bg-gray-100">📦 Unzip</button>
                    }
                </div>
            }
        </div>
    `,
})
export class FileActionsComponent {
    @Input() node!: FileNode;

    @Input() onOpen!: (node: FileNode) => void;
    @Input() onDownload!: (node: FileNode) => void;
    @Input() onRename!: (node: FileNode) => void;
    @Input() onDelete!: (node: FileNode) => void;
    @Input() onMove!: (node: FileNode) => void;
    @Input() onCopy!: (node: FileNode) => void;
    @Input() onShare!: (node: FileNode) => void;
    @Input() onPreview!: (node: FileNode) => void;
    @Input() onProperties!: (node: FileNode) => void;
    @Input() onZip!: (node: FileNode) => void;
    @Input() onUnzip!: (node: FileNode) => void;

    showMore = false;

    toggleMoreOptions() {
        this.showMore = !this.showMore;
    }
}
