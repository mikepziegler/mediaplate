import { Component, Input } from '@angular/core';
import { FileNode } from '@mediaplate/common';


@Component({
    selector: 'ui-filetree-element',
    template: `

    `
})
export class FiletreeElementComponent {
    @Input() node!: FileNode;
}
