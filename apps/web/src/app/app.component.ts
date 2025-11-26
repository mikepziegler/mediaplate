import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    imports: [RouterModule],
    selector: 'app-root',
    template: `
        <h1>Hallo</h1>
        <router-outlet></router-outlet>
    `,
})
export class AppComponent {
}
