import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Placements } from '../../services/placements';
import { Placement, SubCategory } from '../../models/placement.model';
import { AuthService } from '../../services/auth.service';
import { User, UserRole } from '../../models/user.model';

@Component({
  selector: 'app-placements',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './placements.html',
  styleUrl: './placements.scss',
})
export class PlacementsComponent implements OnInit {
  placements = signal<Placement[]>([]);
  loading = false;
  error = '';
  
  // Filters
  filterForm: FormGroup;
  
  // Current user
  currentUser: User | null = null;
  
  // Enums for template
  UserRole = UserRole;
  SubCategory = SubCategory;

  constructor(
    private placementsService: Placements,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      subCategory: [''],
      status: ['all'] // all, active, inactive
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadPlacements();
    
    // Watch filter changes
    this.filterForm.valueChanges.subscribe(() => {
      this.loadPlacements();
    });
  }

  loadPlacements(): void {
    this.loading = true;
    this.error = '';
    
    const filterValues = this.filterForm.value;
    
    this.placementsService.getAllPlacements().subscribe({
      next: (placements) => {
        this.placements.set(placements);
        console.log('Loaded placements:', placements);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading placements:', error);
        this.error = 'Failed to load placements. Please try again.';
        this.loading = false;
      }
    });
  }

  filterPlacements(placements: Placement[], filters: any): Placement[] {
    let filtered = [...placements];
    
    if (filters.subCategory) {
      filtered = filtered.filter(p => p.subCategory === filters.subCategory);
    }
    
    if (filters.status === 'active') {
      filtered = filtered.filter(p => p.isActive !== false);
    } else if (filters.status === 'inactive') {
      filtered = filtered.filter(p => p.isActive === false);
    }
    
    return filtered.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  onCreatePlacement(): void {
    this.router.navigate(['/placements/create']);
  }

  onEditPlacement(placement: Placement): void {
    this.router.navigate(['/placements/edit', placement._id]);
  }

  onDeletePlacement(placement: Placement): void {
    if (confirm(`Are you sure you want to delete the placement "${placement.name}"?`)) {
      this.placementsService.deletePlacement(placement._id).subscribe({
        next: () => {
          this.loadPlacements(); // Reload the list
        },
        error: (error) => {
          console.error('Error deleting placement:', error);
          alert('Failed to delete placement. Please try again.');
        }
      });
    }
  }

  onClearFilters(): void {
    this.filterForm.reset({
      subCategory: '',
      status: 'all'
    });
  }

  canCreatePlacement(): boolean {
    if (!this.currentUser) return false;
    return [UserRole.ADMIN, UserRole.EDITOR].includes(this.currentUser.role);
  }

  canEditPlacement(): boolean {
    if (!this.currentUser) return false;
    return [UserRole.ADMIN, UserRole.EDITOR].includes(this.currentUser.role);
  }

  canDeletePlacement(): boolean {
    if (!this.currentUser) return false;
    return [UserRole.ADMIN].includes(this.currentUser.role);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getSubCategoryDisplayName(subCategory: string): string {
    const names: { [key: string]: string } = {
      'topnav': 'Top Navigation',
      'rightsidebar': 'Right Sidebar',
      'leftsidebar': 'Left Sidebar',
      'bottom': 'Bottom Section',
      'featured': 'Featured Content',
      'sidebar': 'Sidebar',
      'header': 'Header Banner',
      'footer': 'Footer Area'
    };
    return names[subCategory] || subCategory;
  }

  getSubCategoryOptions(): { value: string; label: string }[] {
    return Object.values(SubCategory).map(value => ({
      value,
      label: this.getSubCategoryDisplayName(value)
    }));
  }
}