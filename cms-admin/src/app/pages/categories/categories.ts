import { Component, OnInit, signal, computed, inject } from '@angular/core';
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
  // Injected services
  private categoriesService = inject(Categories);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // Signals for reactive state
  categories = signal<Category[]>([]);
  loading = signal(false);
  error = signal('');
  
  // Pagination signals
  currentPage = signal(1);
  totalPages = signal(1);
  totalCategories = signal(0);
  pageSize = signal(10);
  
  // Current user signal
  currentUser = signal<User | null>(null);
  
  // Form signal
  filterForm: FormGroup;
  
  // Enums for template
  UserRole = UserRole;

  // Computed values
  canCreateCategory = computed(() => {
    const user = this.currentUser();
    if (!user) return false;
    return [UserRole.ADMIN, UserRole.EDITOR].includes(user.role);
  });

  canEditCategory = computed(() => {
    const user = this.currentUser();
    if (!user) return false;
    return [UserRole.ADMIN, UserRole.EDITOR].includes(user.role);
  });

  canDeleteCategory = computed(() => {
    const user = this.currentUser();
    if (!user) return false;
    return user.role === UserRole.ADMIN;
  });

  maxPage = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalCategories());
  });

  paginationNumbers = computed(() => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: number[] = [];
    const currentPage = this.currentPage();
    const totalPages = this.totalPages();

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, -1);
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push(-1, totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  });

  constructor() {
    this.filterForm = this.fb.group({
      search: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser.set(this.authService.getCurrentUser());
    this.loadCategories();
    
    // Subscribe to filter changes
    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage.set(1);
      this.loadCategories();
    });
  }

  loadCategories(): void {
    this.loading.set(true);
    this.error.set('');

    const filters = this.filterForm.value;
    const params: CategoryQueryParams = {
      page: this.currentPage(),
      limit: this.pageSize()
    };

    if (filters.search?.trim()) {
      params.search = filters.search.trim();
    }

    this.categoriesService.getCategories(params).subscribe({
      next: (response) => {
        this.categories.set(response);
        // this.currentPage.set(response.page);
        // this.totalPages.set(response.totalPages);
        // this.totalCategories.set(response.total);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.error.set('Failed to load categories. Please try again.');
        this.loading.set(false);
      }
    });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
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
    this.currentPage.set(1);
    this.loadCategories();
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}