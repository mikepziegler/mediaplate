import { Component, inject, OnInit } from '@angular/core';
import { FileService } from './file.service';
import { FileTreeComponent, AppLayoutComponent } from '@mediaplate/ui';
import { FileNode } from '@mediaplate/common';
import { plainToInstance } from 'class-transformer';

@Component({
    selector: 'app-start',
    template: `
        <ui-app-layout>
            <div>
                <div class="p-6 flex flex-col gap-4">
                    <div>
                        <h1>Files</h1>
                        <ui-file-tree
                            [nodes]="tree"
                            (fileDropped)="handleFiles($event)"
                        />
                    </div>
                </div>
            </div>
        </ui-app-layout>
    `,
    providers: [FileService],
    imports: [AppLayoutComponent, FileTreeComponent]
})
export class StartComponent implements OnInit {
    tree: FileNode[] = [];
    private fileService = inject(FileService);

    ngOnInit() {
        this.fileService.getAllFiles().subscribe((tree) => {

            console.log(tree);

            this.tree = plainToInstance(FileNode, tree);
        });
    }

    handleFiles(files: File[]) {
        if (!files) return; // TODO: Error handling

        console.log(files)

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
}
