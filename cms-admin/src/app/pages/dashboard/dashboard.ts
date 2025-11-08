import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  DashboardService,
  DashboardStats,
} from '../../services/dashboard.service';
import { Post } from '../../models/post.model';
import { User } from '../../models/user.model';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private router = inject(Router);

  // Signals
  loading = signal(false);
  error = signal<string | null>(null);
  stats = signal<DashboardStats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalUsers: 0,
    totalCategories: 0,
    totalPlacements: 0,
  });
  recentPosts = signal<Post[]>([]);
  recentUsers = signal<User[]>([]);
  topCategories = signal<Category[]>([]);

  // Computed
  user = computed(() => {
    let currentUser: any = null;
    this.authService.currentUser$.subscribe((u) => (currentUser = u));
    return currentUser;
  });

  currentDate = new Date();

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading.set(true);
    this.error.set(null);

    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.stats.set(data.stats);
        this.recentPosts.set(data.recentPosts);
        this.recentUsers.set(data.recentUsers);
        this.topCategories.set(data.topCategories);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.error.set('Failed to load dashboard data. Please try again.');
        this.loading.set(false);
      },
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'published':
        return 'badge-success';
      case 'draft':
        return 'badge-warning';
      case 'archived':
        return 'badge-secondary';
      case 'expired':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  getRoleBadgeClass(role: string): string {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'badge-danger';
      case 'editor':
        return 'badge-primary';
      case 'author':
        return 'badge-info';
      case 'viewer':
        return 'badge-secondary';
      default:
        return 'badge-secondary';
    }
  }
}
