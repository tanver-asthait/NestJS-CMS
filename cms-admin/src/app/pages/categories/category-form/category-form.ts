import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Categories } from '../../../services/categories';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../../../models/category.model';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './category-form.html',
  styleUrl: './category-form.scss',
})
export class CategoryForm implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private categoriesService = inject(Categories);

  // Signals for reactive state management
  isEditing = signal(false);
  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  currentCategory = signal<Category | null>(null);

  categoryForm: FormGroup;

  constructor() {
    this.categoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]]
    });

    // Auto-generate slug from name
    this.categoryForm.get('name')?.valueChanges.subscribe(name => {
      if (name && !this.isEditing()) {
        const slug = this.generateSlug(name);
        this.categoryForm.patchValue({ slug }, { emitEvent: false });
      }
    });
  }

  ngOnInit() {
    const categoryId = this.route.snapshot.paramMap.get('id');
    if (categoryId) {
      this.isEditing.set(true);
      this.loadCategory(categoryId);
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private async loadCategory(id: string) {
    this.loading.set(true);
    this.error.set(null);

    try {
      const category = await this.categoriesService.getCategory(id).toPromise();
      if (category) {
        this.currentCategory.set(category);
        this.categoryForm.patchValue({
          name: category.name,
          description: category.description || '',
          slug: category.slug
        });
      }
    } catch (error) {
      this.error.set('Failed to load category');
      console.error('Error loading category:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async onSubmit() {
    if (this.categoryForm.valid && !this.saving()) {
      this.saving.set(true);
      this.error.set(null);

      try {
        const formValue = this.categoryForm.value;
        
        if (this.isEditing()) {
          const updateData: UpdateCategoryDto = {
            name: formValue.name,
            description: formValue.description || undefined,
            slug: formValue.slug
          };
          
          await this.categoriesService.updateCategory(this.currentCategory()!._id, updateData).toPromise();
        } else {
          const createData: CreateCategoryDto = {
            name: formValue.name,
            description: formValue.description || undefined,
            slug: formValue.slug
          };
          
          await this.categoriesService.createCategory(createData).toPromise();
        }

        this.router.navigate(['/categories']);
      } catch (error: any) {
        this.error.set(error?.error?.message || 'Failed to save category');
        console.error('Error saving category:', error);
      } finally {
        this.saving.set(false);
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.categoryForm.controls).forEach(key => {
        this.categoryForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel() {
    this.router.navigate(['/categories']);
  }

  getFieldError(fieldName: string): string | null {
    const field = this.categoryForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength']) return `${fieldName} must be no more than ${field.errors['maxlength'].requiredLength} characters`;
      if (field.errors['pattern']) return 'Slug must contain only lowercase letters, numbers, and hyphens';
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.categoryForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }
}
