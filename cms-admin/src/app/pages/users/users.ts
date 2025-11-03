import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Users, UserQueryParams } from '../../services/users';
import { User, UserRole } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-users',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = false;
  error = '';
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalUsers = 0;
  pageSize = 10;
  
  // Filters
  filterForm: FormGroup;
  roleOptions: Array<{ value: UserRole | ''; label: string }> = [];
  
  // Current user
  currentUser: User | null = null;
  
  // Enums for template
  UserRole = UserRole;

  constructor(
    private usersService: Users,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      role: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.initializeRoleOptions();
    this.loadUsers();
    
    // Subscribe to filter changes
    this.filterForm.valueChanges.subscribe(() => {
      this.currentPage = 1;
      this.loadUsers();
    });
  }

  initializeRoleOptions(): void {
    this.roleOptions = [
      { value: '', label: 'All Roles' },
      { value: UserRole.ADMIN, label: 'Administrator' },
      { value: UserRole.EDITOR, label: 'Editor' },
      { value: UserRole.AUTHOR, label: 'Author' },
      { value: UserRole.VIEWER, label: 'Viewer' }
    ];
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';

    const filters = this.filterForm.value;
    const params: UserQueryParams = {
      page: this.currentPage,
      limit: this.pageSize
    };

    if (filters.search?.trim()) {
      params.search = filters.search.trim();
    }

    if (filters.role) {
      params.role = filters.role;
    }

    this.usersService.getUsers(params).subscribe({
      next: (response) => {
        this.users = response.users;
        this.currentPage = response.page;
        this.totalPages = response.totalPages;
        this.totalUsers = response.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.error = 'Failed to load users. Please try again.';
        this.loading = false;
      }
    });
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  onCreateUser(): void {
    this.router.navigate(['/users/create']);
  }

  onEditUser(user: User): void {
    this.router.navigate(['/users/edit', user._id]);
  }

  onDeleteUser(user: User): void {
    if (user._id === this.currentUser?._id) {
      alert('You cannot delete your own account.');
      return;
    }

    if (confirm(`Are you sure you want to delete "${user.firstName} ${user.lastName}"?`)) {
      this.usersService.deleteUser(user._id).subscribe({
        next: () => {
          this.loadUsers(); // Reload the list
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          alert('Failed to delete user. Please try again.');
        }
      });
    }
  }

  onViewUser(user: User): void {
    // For now, navigate to edit page. Later can be a separate view page
    this.router.navigate(['/users/view', user._id]);
  }

  onChangeUserRole(user: User, newRole: UserRole): void {
    if (user._id === this.currentUser?._id) {
      alert('You cannot change your own role.');
      return;
    }

    if (confirm(`Are you sure you want to change ${user.firstName} ${user.lastName}'s role to ${this.usersService.getRoleDisplayName(newRole)}?`)) {
      this.usersService.updateUserRole(user._id, newRole).subscribe({
        next: (updatedUser) => {
          // Update the user in the local array
          const index = this.users.findIndex(u => u._id === user._id);
          if (index !== -1) {
            this.users[index] = updatedUser;
          }
        },
        error: (error) => {
          console.error('Error updating user role:', error);
          alert('Failed to update user role. Please try again.');
        }
      });
    }
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.currentPage = 1;
    this.loadUsers();
  }

  canEditUser(user: User): boolean {
    return this.usersService.canEditUser(user._id);
  }

  canDeleteUser(user: User): boolean {
    // Cannot delete own account
    if (user._id === this.currentUser?._id) return false;
    
    return this.usersService.canDeleteUser();
  }

  canCreateUser(): boolean {
    return this.usersService.canCreateUser();
  }

  canUpdateUserRole(user: User): boolean {
    // Cannot change own role
    if (user._id === this.currentUser?._id) return false;
    
    return this.usersService.canUpdateUserRole();
  }

  getRoleDisplayName(role: UserRole): string {
    return this.usersService.getRoleDisplayName(role);
  }

  getRoleColor(role: UserRole): string {
    return this.usersService.getRoleColor(role);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatLastLogin(lastLogin: Date | string | null): string {
    if (!lastLogin) return 'Never';
    
    return new Date(lastLogin).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getMaxPage(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalUsers);
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