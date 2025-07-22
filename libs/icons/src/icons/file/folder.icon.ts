import { Component } from '@angular/core';

@Component({
    selector: 'icon-folder',
    template: `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
            class="w-6 h-6 text-yellow-500"
        >
            <path
                d="M2 4a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4z"
            />
        </svg>
    `
})
export class FolderIcon {}
