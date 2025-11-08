import { Component, signal, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './main-layout.html',
  styleUrls: ['./main-layout.scss'],
})
export class MainLayout {
  private authService = inject(AuthService);

  // UI signals
  sidebarCollapsed = signal(false);
  private windowWidth = signal(window.innerWidth);

  // Static menu for sidebar — use signals so templates can react in a zoneless app
  menuItems = signal([
    { label: 'Dashboard', link: '/dashboard', icon: 'bi bi-speedometer2' },
    { label: 'Posts', link: '/posts', icon: 'bi bi-file-earmark-text' },
    { label: 'Categories', link: '/categories', icon: 'bi bi-tags' },
    {
      label: 'Placements',
      link: '/placements',
      icon: 'bi bi-layout-text-window-reverse',
    },
    { label: 'Users', link: '/users', icon: 'bi bi-people' },
    { label: 'Media', link: '/media', icon: 'bi bi-image' },
    { label: 'Settings', link: '/settings', icon: 'bi bi-gear' },
  ] as Array<{ label: string; link: string; icon: string }>);

  constructor() {
    // Initialize sidebar state based on screen size
    this.updateSidebarState();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    const target = event.target as Window;
    this.windowWidth.set(target.innerWidth);
    this.updateSidebarState();
  }

  private updateSidebarState() {
    // On mobile, sidebar starts collapsed
    if (this.isMobile()) {
      this.sidebarCollapsed.set(true);
    }
  }

  toggleSidebar() {
    this.sidebarCollapsed.update((v) => !v);
  }

  closeSidebar() {
    if (this.isMobile()) {
      this.sidebarCollapsed.set(true);
    }
  }

  onMenuClick() {
    // Close sidebar on mobile when menu item is clicked
    if (this.isMobile()) {
      this.sidebarCollapsed.set(true);
    }
  }

  isMobile(): boolean {
    return this.windowWidth() <= 768;
  }

  logout() {
    this.authService.logout();
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }
}
