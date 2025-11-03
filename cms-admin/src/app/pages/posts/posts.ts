import { Component, OnInit, signal, Signal } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Posts, PostQueryParams } from '../../services/posts';
import { Post, PostStatus } from '../../models/post.model';
import { AuthService } from '../../services/auth.service';
import { User, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-posts',
  imports: [JsonPipe, CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './posts.html',
  styleUrl: './posts.scss',
})
export class PostsComponent implements OnInit {
  posts = signal<Post[]>([]);
  loading = false;
  error = '';
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalPosts = 0;
  pageSize = 10;
  
  // Filters
  filterForm: FormGroup;
  statusOptions: Array<{ value: PostStatus | ''; label: string }> = [];
  
  // Current user
  currentUser: User | null = null;
  
  // Status enum for template
  PostStatus = PostStatus;
  UserRole = UserRole;

  constructor(
    private postsService: Posts,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      status: [''],
      author: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.initializeStatusOptions();
    this.loadPosts();
    
    // Subscribe to filter changes
    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadPosts();
    });
  }

  initializeStatusOptions(): void {
    this.statusOptions = [
      { value: '', label: 'All Status' },
      { value: PostStatus.DRAFT, label: 'Draft' },
      { value: PostStatus.PUBLISHED, label: 'Published' },
      { value: PostStatus.ARCHIVED, label: 'Archived' }
    ];
  }

  loadPosts(): void {
    // this.loading = true;
    this.error = '';

    const filters = this.filterForm.value;
    const params: PostQueryParams = {
      page: this.currentPage,
      limit: this.pageSize
    };

    if (filters.search?.trim()) {
      params.search = filters.search.trim();
    }

    if (filters.status) {
      params.status = filters.status;
    }

    if (filters.author?.trim()) {
      params.author = filters.author.trim();
    }

    this.postsService.getPosts(params).subscribe({
      next: (response) => {
        this.posts.set(response.posts);
        console.log('Posts loaded:', this.posts());
        this.currentPage = response.page;
        this.totalPages = response.totalPages;
        this.totalPosts = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.error = 'Failed to load posts. Please try again.';
        // this.loading = false;
      }
    });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPosts();
    }
  }

  onCreatePost(): void {
    this.router.navigate(['/posts/create']);
  }

  onEditPost(post: Post): void {
    this.router.navigate(['/posts/edit', post._id]);
  }

  onDeletePost(post: Post): void {
    if (confirm(`Are you sure you want to delete "${post.title}"?`)) {
      this.postsService.deletePost(post._id).subscribe({
        next: () => {
          this.loadPosts(); // Reload the list
        },
        error: (error) => {
          console.error('Error deleting post:', error);
          alert('Failed to delete post. Please try again.');
        }
      });
    }
  }

  onViewPost(post: Post): void {
    // For now, navigate to edit page. Later can be a separate view page
    this.router.navigate(['/posts/view', post._id]);
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadPosts();
  }

  getStatusBadgeClass(status: PostStatus): string {
    const statusClasses = {
      [PostStatus.DRAFT]: 'badge-warning',
      [PostStatus.PUBLISHED]: 'badge-success',
      [PostStatus.ARCHIVED]: 'badge-secondary'
    };
    return statusClasses[status] || 'badge-secondary';
  }

  getAuthorName(author: string | User): string {
    if (typeof author === 'string') {
      return 'Unknown Author';
    }
    return `${author.firstName} ${author.lastName}`;
  }

  canEditPost(post: Post): boolean {
    if (!this.currentUser) return false;
    
    // Admin can edit any post
    if (this.currentUser.role === UserRole.ADMIN) return true;
    
    // Editors can edit any post
    if (this.currentUser.role === UserRole.EDITOR) return true;
    
    // Authors can edit their own posts
    if (this.currentUser.role === UserRole.AUTHOR) {
      const authorId = typeof post.author === 'string' ? post.author : post.author._id;
      return authorId === this.currentUser._id;
    }
    
    return false;
  }

  canDeletePost(post: Post): boolean {
    if (!this.currentUser) return false;
    
    // Only Admin and Editor can delete posts
    return this.currentUser.role === UserRole.ADMIN || this.currentUser.role === UserRole.EDITOR;
  }

  canCreatePost(): boolean {
    if (!this.currentUser) return false;
    
    // Admin, Editor, and Author can create posts
    return [UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR].includes(this.currentUser.role);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getPaginationNumbers(): number[] {
    const delta = 2; // Number of pages to show on each side of current page
    const range: number[] = [];
    const rangeWithDots: number[] = [];

    for (let i = Math.max(2, this.currentPage - delta); 
         i <= Math.min(this.totalPages - 1, this.currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (this.currentPage - delta > 2) {
      rangeWithDots.push(1, -1); // -1 represents dots
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (this.currentPage + delta < this.totalPages - 1) {
      rangeWithDots.push(-1, this.totalPages); // -1 represents dots
    } else {
      rangeWithDots.push(this.totalPages);
    }

    return rangeWithDots;
  }

  getMaxPage(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalPosts);
  }
}