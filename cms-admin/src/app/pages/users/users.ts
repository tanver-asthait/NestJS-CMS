import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService, UsersQueryParams } from '../../services/user.service';
import {
  User,
  UserRole,
  CreateUserDto,
  UpdateUserDto,
} from '../../models/user.model';

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrls: ['./users.scss'],
})
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);

  // Expose Math for template
  readonly Math = Math;

  users = signal<User[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  currentPage = signal(1);
  totalPages = signal(1);
  totalUsers = signal(0);
  pageSize = signal(10);

  searchTerm = signal('');
  selectedRole = signal<string>('');
  sortBy = signal('createdAt');
  sortOrder = signal<'asc' | 'desc'>('desc');

  showModal = signal(false);
  modalMode = signal<'create' | 'edit'>('create');
  selectedUser = signal<User | null>(null);

  formData = signal<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: UserRole.VIEWER,
  });

  formErrors = signal<Record<string, string>>({});
  submitting = signal(false);

  showDeleteConfirm = signal(false);
  userToDelete = signal<User | null>(null);
  deleting = signal(false);

  readonly roles = Object.values(UserRole);
  readonly UserRole = UserRole;

  hasUsers = computed(() => {
    const users = this.users();
    return users && users.length > 0;
  });

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading.set(true);
    this.error.set(null);

    const params: UsersQueryParams = {
      page: this.currentPage(),
      limit: this.pageSize(),
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder(),
    };

    if (this.searchTerm()) {
      params.search = this.searchTerm();
    }

    if (this.selectedRole()) {
      params.role = this.selectedRole();
    }

    this.userService.getUsers(params).subscribe({
      next: (response) => {
        console.log('Users loaded:', response);
        this.users.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load users. Please try again.');
        this.loading.set(false);
        console.error('Error loading users:', err);
      },
    });
  }

  applyFilters() {
    this.currentPage.set(1);
    this.loadUsers();
  }

  clearFilters() {
    this.searchTerm.set('');
    this.selectedRole.set('');
    this.currentPage.set(1);
    this.loadUsers();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadUsers();
    }
  }

  openCreateModal() {
    this.modalMode.set('create');
    this.selectedUser.set(null);
    this.formData.set({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: UserRole.VIEWER,
    });
    this.formErrors.set({});
    this.showModal.set(true);
  }

  openEditModal(user: User) {
    this.modalMode.set('edit');
    this.selectedUser.set(user);
    this.formData.set({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      role: user.role,
    });
    this.formErrors.set({});
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedUser.set(null);
    this.formData.set({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: UserRole.VIEWER,
    });
    this.formErrors.set({});
  }

  validateForm(): boolean {
    const errors: Record<string, string> = {};
    const data = this.formData();

    if (!data.firstName.trim()) {
      errors['firstName'] = 'First name is required';
    }

    if (!data.lastName.trim()) {
      errors['lastName'] = 'Last name is required';
    }

    if (!data.email.trim()) {
      errors['email'] = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors['email'] = 'Invalid email format';
    }

    if (this.modalMode() === 'create' && !data.password) {
      errors['password'] = 'Password is required';
    }

    if (data.password && data.password.length < 6) {
      errors['password'] = 'Password must be at least 6 characters';
    }

    this.formErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  submitForm() {
    if (!this.validateForm()) {
      return;
    }

    this.submitting.set(true);
    const data = this.formData();

    if (this.modalMode() === 'create') {
      const createDto: CreateUserDto = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role,
      };

      this.userService.createUser(createDto).subscribe({
        next: () => {
          this.submitting.set(false);
          this.closeModal();
          this.loadUsers();
        },
        error: (err: any) => {
          this.submitting.set(false);
          this.error.set(err.error?.message || 'Failed to create user');
        },
      });
    } else {
      const updateDto: UpdateUserDto = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
      };

      if (data.password) {
        updateDto.password = data.password;
      }

      const userId = this.selectedUser()?._id;
      if (!userId) return;

      this.userService.updateUser(userId, updateDto).subscribe({
        next: () => {
          this.submitting.set(false);
          this.closeModal();
          this.loadUsers();
        },
        error: (err: any) => {
          this.submitting.set(false);
          this.error.set(err.error?.message || 'Failed to update user');
        },
      });
    }
  }

  updateFormData(field: keyof UserFormData, value: any) {
    this.formData.update((data) => ({
      ...data,
      [field]: value,
    }));
  }

  confirmDelete(user: User) {
    this.userToDelete.set(user);
    this.showDeleteConfirm.set(true);
  }

  cancelDelete() {
    this.userToDelete.set(null);
    this.showDeleteConfirm.set(false);
  }

  deleteUser() {
    const user = this.userToDelete();
    if (!user) return;

    this.deleting.set(true);

    this.userService.deleteUser(user._id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.cancelDelete();
        this.loadUsers();
      },
      error: (err: any) => {
        this.deleting.set(false);
        this.error.set(err.error?.message || 'Failed to delete user');
      },
    });
  }

  getRoleBadgeClass(role: UserRole): string {
    switch (role) {
      case UserRole.ADMIN:
        return 'badge-danger';
      case UserRole.EDITOR:
        return 'badge-primary';
      case UserRole.AUTHOR:
        return 'badge-info';
      case UserRole.VIEWER:
        return 'badge-secondary';
      default:
        return 'badge-secondary';
    }
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, -1, total);
      } else if (current >= total - 2) {
        pages.push(1, -1, total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, -1, current - 1, current, current + 1, -1, total);
      }
    }

    return pages;
  }
}
