import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Categories, CategoryQueryParams } from '../../services/categories';
import { Category } from '../../models/category.model';
import { AuthService } from '../../services/auth.service';
import { User, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  loading = false;
  error = '';
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalCategories = 0;
  pageSize = 10;
  
  // Filters
  filterForm: FormGroup;
  
  // Current user
  currentUser: User | null = null;
  
  // Enums for template
  UserRole = UserRole;

  constructor(
    private categoriesService: Categories,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadCategories();
    
    // Subscribe to filter changes
    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadCategories();
    });
  }

  loadCategories(): void {
    this.loading = true;
    this.error = '';

    const filters = this.filterForm.value;
    const params: CategoryQueryParams = {
      page: this.currentPage,
      limit: this.pageSize
    };

    if (filters.search?.trim()) {
      params.search = filters.search.trim();
    }

    this.categoriesService.getCategories(params).subscribe({
      next: (response) => {
        this.categories = response.categories;
        this.currentPage = response.page;
        this.totalPages = response.totalPages;
        this.totalCategories = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.error = 'Failed to load categories. Please try again.';
        this.loading = false;
      }
    });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadCategories();
    }
  }

  onCreateCategory(): void {
    this.router.navigate(['/categories/create']);
  }

  onEditCategory(category: Category): void {
    this.router.navigate(['/categories/edit', category._id]);
  }

  onDeleteCategory(category: Category): void {
    if (confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
      this.categoriesService.deleteCategory(category._id).subscribe({
        next: () => {
          this.loadCategories(); // Reload the list
        },
        error: (error) => {
          console.error('Error deleting category:', error);
          alert('Failed to delete category. Please try again.');
        }
      });
    }
  }

  onViewCategory(category: Category): void {
    // For now, navigate to edit page. Later can be a separate view page
    this.router.navigate(['/categories/view', category._id]);
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadCategories();
  }

  canEditCategory(): boolean {
    if (!this.currentUser) return false;
    
    // Admin and Editor can edit categories
    return [UserRole.ADMIN, UserRole.EDITOR].includes(this.currentUser.role);
  }

  canDeleteCategory(): boolean {
    if (!this.currentUser) return false;
    
    // Only Admin can delete categories
    return this.currentUser.role === UserRole.ADMIN;
  }

  canCreateCategory(): boolean {
    if (!this.currentUser) return false;
    
    // Admin and Editor can create categories
    return [UserRole.ADMIN, UserRole.EDITOR].includes(this.currentUser.role);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getMaxPage(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalCategories);
  }

  getPaginationNumbers(): number[] {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: number[] = [];

    for (let i = Math.max(2, this.currentPage - delta); 
         i <= Math.min(this.totalPages - 1, this.currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (this.currentPage - delta > 2) {
      rangeWithDots.push(1, -1);
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (this.currentPage + delta < this.totalPages - 1) {
      rangeWithDots.push(-1, this.totalPages);
    } else {
      rangeWithDots.push(this.totalPages);
    }

    return rangeWithDots;
  }
}