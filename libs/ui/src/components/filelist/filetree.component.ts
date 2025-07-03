import { Component, Input } from '@angular/core';
import { FileNode, FileNodeType } from '@mediaplate/common';

@Component({
  selector: 'ui-file-tree',
  template: `
    <ul class="divide-y">
      @for (node of nodes; let i = $index; track i) {
        <li class="mb-1 list-none py-2">
          @if (node.type === fileNodeType.Folder) {
            <div (click)="toggle(node)" class="cursor-pointer">
              <span>{{ node.expanded ? '📂' : '📁' }}</span>
              {{ node.name }}
            </div>
          }

          @if (node.type === fileNodeType.File) {
            <div>
              📄 {{ node.name }}
            </div>
          }

          @if (node.expanded && node.children) {
            <div class="ml-8 my-4">
              <ui-file-tree [nodes]="node.children" />
            </div>
          }

        </li>
      }

    </ul>
  `
})
export class FileTreeComponent {
  @Input() nodes: FileNode[] = [];
  fileNodeType = FileNodeType;

  toggle(node: FileNode | undefined): void {
    if (!node) return;
    node.expanded = !node.expanded;
  }
}
