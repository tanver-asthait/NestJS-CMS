import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Posts } from '../../../services/posts';
import { Categories } from '../../../services/categories';
import { Placements } from '../../../services/placements';
import {
  Post,
  CreatePostDto,
  UpdatePostDto,
  PostStatus,
} from '../../../models/post.model';
import { Category } from '../../../models/category.model';
import { User } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-post-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './post-form.html',
  styleUrl: './post-form.scss',
})
export class PostFormComponent implements OnInit {
  postForm: FormGroup;

  // Signals for reactive state
  loading = signal(false);
  saving = signal(false);
  error = signal('');
  success = signal('');

  // Form mode
  isEditMode = signal(false);
  postId = signal<string | null>(null);

  // Current user
  currentUser = signal<User | null>(null);

  // Options for dropdowns - using signals
  statusOptions = signal<Array<{ value: PostStatus; label: string }>>([]);
  categories = signal<Category[]>([]);
  placements = signal<
    Array<{ _id: string; name: string; slug?: string; subCategory?: string }>
  >([]);

  // Computed properties
  activeCategories = computed(() =>
    this.categories().filter((cat) => cat.isActive === true),
  );

  // Enums for template
  PostStatus = PostStatus;

  constructor(
    private fb: FormBuilder,
    private postsService: Posts,
    private categoriesService: Categories,
    private placementsService: Placements,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.postForm = this.fb.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(200),
        ],
      ],
      slug: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-z0-9-]+$/),
          Validators.maxLength(200),
        ],
      ],
      excerpt: ['', [Validators.maxLength(500)]],
      content: [''],
      status: [PostStatus.DRAFT, [Validators.required]],
      category: ['', [Validators.required]],
      placement: ['', [Validators.required]],
      image: ['', [this.urlValidator]],
      orderNo: [1, [Validators.required, Validators.min(1)]],
      publishedAt: [''],
      expiredAt: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.currentUser.set(this.authService.getCurrentUser());
    this.initializeFormOptions();

    // Check if we're in edit mode
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.postId.set(params['id']);
        this.loadPost();
      } else {
        // nothing to set for author from frontend; backend uses token
      }
    });

    // Auto-generate slug from title
    this.postForm.get('title')?.valueChanges.subscribe((title) => {
      if (title && !this.isEditMode()) {
        const slug = this.postsService.generateSlug(title);
        this.postForm.patchValue({ slug }, { emitEvent: false });
      }
    });
  }

  initializeFormOptions(): void {
    this.statusOptions.set(this.postsService.getStatusOptions());
    this.loadCategories();
    this.loadPlacements();
  }

  loadCategories(): void {
    this.categoriesService.getAllCategories().subscribe({
      next: (categories) => {
        console.log('Categories loaded:', categories);
        this.categories.set(categories);
        console.log('Active categories:', this.activeCategories());
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      },
    });
  }

  loadPlacements(): void {
    this.placementsService.getAllPlacements().subscribe({
      next: (placements: any) => {
        this.placements.set(placements);
      },
      error: (error: any) => {
        console.error('Error loading placements:', error);
      },
    });
  }

  loadPost(): void {
    const postId = this.postId();
    if (!postId) return;

    this.loading.set(true);
    this.postsService.getPost(postId).subscribe({
      next: (post) => {
        this.populateForm(post);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading post:', error);
        this.error.set('Failed to load post. Please try again.');
        this.loading.set(false);
      },
    });
  }

  populateForm(post: Post): void {
    const categoryId =
      typeof post.category === 'string'
        ? post.category
        : (post.category as any)?._id;
    const placementId =
      typeof post.placement === 'string'
        ? post.placement
        : (post.placement as any)?._id;

    this.postForm.patchValue({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      status: post.status,
      category: categoryId || '',
      placement: placementId || '',
      image: (post as any).image || '',
      orderNo: post.orderNo || 1,
      publishedAt: post.publishedAt
        ? this.formatDateForInput(post.publishedAt)
        : '',
      expiredAt: post.expiredAt ? this.formatDateForInput(post.expiredAt) : '',
    });
  }

  onSubmit(): void {
    if (this.postForm.invalid) {
      this.markFormGroupTouched();
      this.error.set('Please fill in all required fields correctly.');
      return;
    }

    this.saving.set(true);
    this.error.set('');
    this.success.set('');

    const formData = this.prepareFormData();

    if (this.isEditMode() && this.postId()) {
      this.updatePost(formData);
    } else {
      this.createPost(formData);
    }
  }

  prepareFormData(): any {
    const rawFormData = this.postForm.value;

    // Prepare the data according to DTO requirements
    const formData: any = {
      title: rawFormData.title,
      slug: rawFormData.slug,
      excerpt: rawFormData.excerpt || undefined,
      content: rawFormData.content || undefined,
      status: rawFormData.status,
      category: rawFormData.category,
      placement: rawFormData.placement,
      image: rawFormData.image || undefined,
      orderNo: rawFormData.orderNo || 1,
      expiredAt: rawFormData.expiredAt
        ? new Date(rawFormData.expiredAt)
        : new Date(),
    };

    // Add publishedAt only if it's set
    if (rawFormData.publishedAt) {
      formData.publishedAt = new Date(rawFormData.publishedAt);
    }

    // For published posts, set publishedAt to now if not already set
    if (rawFormData.status === PostStatus.PUBLISHED && !formData.publishedAt) {
      formData.publishedAt = new Date();
    }

    return formData;
  }

  createPost(formData: any): void {
    this.postsService.createPost(formData).subscribe({
      next: (post) => {
        this.saving.set(false);
        this.success.set('Post created successfully!');
        setTimeout(() => {
          this.router.navigate(['/posts']);
        }, 1500);
      },
      error: (error) => {
        this.saving.set(false);
        console.error('Error creating post:', error);
        this.error.set(
          error.error?.message || 'Failed to create post. Please try again.',
        );
      },
    });
  }

  updatePost(formData: any): void {
    const postId = this.postId();
    if (!postId) return;

    this.postsService.updatePost(postId, formData).subscribe({
      next: (post) => {
        this.saving.set(false);
        this.success.set('Post updated successfully!');
        setTimeout(() => {
          this.router.navigate(['/posts']);
        }, 1500);
      },
      error: (error) => {
        this.saving.set(false);
        console.error('Error updating post:', error);
        this.error.set(
          error.error?.message || 'Failed to update post. Please try again.',
        );
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/posts']);
  }

  onSlugChange(): void {
    const slug = this.postForm.get('slug')?.value;
    if (slug) {
      const cleanSlug = this.postsService.generateSlug(slug);
      this.postForm.patchValue({ slug: cleanSlug }, { emitEvent: false });
    }
  }

  markFormGroupTouched(): void {
    Object.keys(this.postForm.controls).forEach((key) => {
      const control = this.postForm.get(key);
      control?.markAsTouched();
    });
  }

  hasError(fieldName: string, errorType: string): boolean {
    const field = this.postForm.get(fieldName);
    return !!(field && field.hasError(errorType) && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.postForm.get(fieldName);
    if (field?.touched && field?.errors) {
      const errors = field.errors;
      if (errors['required'])
        return `${this.getFieldLabel(fieldName)} is required`;
      if (errors['minlength'])
        return `${this.getFieldLabel(fieldName)} must be at least ${errors['minlength'].requiredLength} characters`;
      if (errors['pattern'])
        return `${this.getFieldLabel(fieldName)} contains invalid characters`;
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      title: 'Title',
      slug: 'Slug',
      content: 'Content',
      status: 'Status',
      category: 'Category',
      placement: 'Placement',
      orderNo: 'Order Number',
      publishedAt: 'Published At',
      expiredAt: 'Expires At',
    };
    return labels[fieldName] || fieldName;
  }

  formatDateForInput(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
  }

  getCurrentDateTimeString(): string {
    return this.formatDateForInput(new Date());
  }

  // URL validation helper
  urlValidator(control: any) {
    if (!control.value) return null;
    const urlPattern =
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return urlPattern.test(control.value) ? null : { invalidUrl: true };
  }

  // Getter methods for template
  get title() {
    return this.postForm.get('title');
  }
  get slug() {
    return this.postForm.get('slug');
  }
  get excerpt() {
    return this.postForm.get('excerpt');
  }
  get content() {
    return this.postForm.get('content');
  }
  get status() {
    return this.postForm.get('status');
  }
  get category() {
    return this.postForm.get('category');
  }
  get placement() {
    return this.postForm.get('placement');
  }
  get image() {
    return this.postForm.get('image');
  }
  get orderNo() {
    return this.postForm.get('orderNo');
  }
  get publishedAt() {
    return this.postForm.get('publishedAt');
  }
  get expiredAt() {
    return this.postForm.get('expiredAt');
  }
}
