import { Component } from '@angular/core';

@Component({
  selector: 'ui-app-layout',
  template: `
    <div class="flex h-screen bg-gray-100">
      <!-- Sidebar -->
      <aside class="w-64 bg-white border-r shadow-md md:block hidden">
        <div class="p-4 font-bold text-xl border-b h-16">App Name</div>
        <nav class="p-4 space-y-2">
          <a href="#" class="block px-4 py-2 rounded hover:bg-gray-100"
            >Dashboard</a
          >
          <a href="#" class="block px-4 py-2 rounded hover:bg-gray-100"
            >Settings</a
          >
          <a href="#" class="block px-4 py-2 rounded hover:bg-gray-100"
            >Profile</a
          >
        </nav>
      </aside>

      <!-- Main Content Area -->
      <div class="flex-1 flex flex-col">
        <!-- Topbar -->
        <header
          class="w-full h-16 bg-white border-b flex items-center justify-between px-4 shadow-sm"
        >
          <button class="md:hidden" (click)="toggleSidebar()">
            <!-- Icon or text -->
            ☰
          </button>
          <div class="text-lg font-semibold">Page Title</div>
          <div class="flex items-center space-x-4">
            <span>User</span>
            <img
              src="https://i.pravatar.cc/32"
              class="rounded-full h-8 w-8"
              alt="User avatar"
            />
          </div>
        </header>

        <!-- Page content -->
        <main class="flex-1 overflow-y-auto">
          <ng-content></ng-content>
        </main>

        <!-- Footer -->
        <footer
          class="h-12 bg-white border-t flex items-center justify-center text-sm text-gray-600"
        >
          © 2025 Your Company
        </footer>
      </div>
    </div>
  `,
})
export class AppLayoutComponent {
  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
