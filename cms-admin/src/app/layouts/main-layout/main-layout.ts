import { Component, signal, inject } from '@angular/core';
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

  // Static menu for sidebar — use signals so templates can react in a zoneless app
  menuItems = signal([
    { label: 'Dashboard', link: '/dashboard', icon: 'bi bi-speedometer2' },
    { label: 'Posts', link: '/posts', icon: 'bi bi-file-earmark-text' },
    { label: 'Categories', link: '/categories', icon: 'bi bi-tags' },
    { label: 'Placements', link: '/placements', icon: 'bi bi-layout-text-window-reverse' },
    { label: 'Users', link: '/users', icon: 'bi bi-people' },
    { label: 'Media', link: '/media', icon: 'bi bi-image' },
    { label: 'Settings', link: '/settings', icon: 'bi bi-gear' },
  ] as Array<{ label: string; link: string; icon: string }>);

  toggleSidebar() {
    this.sidebarCollapsed.update(v => !v);
  }

  logout() {
    this.authService.logout();
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }
}