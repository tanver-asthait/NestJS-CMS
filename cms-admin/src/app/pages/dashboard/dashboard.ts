import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  user: any = null;
  currentDate = new Date();

  // Dashboard stats (mock data for now)
  stats = {
    totalPosts: 25,
    totalUsers: 12,
    totalCategories: 8,
    totalViews: 1250
  };

  // Recent activities (mock data)
  recentActivities = [
    { action: 'New post created', details: 'Getting Started with Angular', time: '2 minutes ago' },
    { action: 'User registered', details: 'john.doe@example.com', time: '15 minutes ago' },
    { action: 'Post published', details: 'NestJS Best Practices', time: '1 hour ago' },
    { action: 'Category created', details: 'Technology', time: '2 hours ago' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get current user information
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  navigateTo(route: string): void {
    // Navigate to the specified route
    this.router.navigate([route]);
  }
}
