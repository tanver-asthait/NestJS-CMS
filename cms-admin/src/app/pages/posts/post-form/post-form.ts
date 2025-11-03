import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Posts } from '../../../services/posts';
import { Categories } from '../../../services/categories';
import { Users } from '../../../services/users';
import { Post, CreatePostDto, UpdatePostDto, PostStatus } from '../../../models/post.model';
import { Category } from '../../../models/category.model';
import { User, UserRole } from '../../../models/user.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-post-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './post-form.html',
  styleUrl: './post-form.scss',
})
export class PostFormComponent implements OnInit {
  postForm: FormGroup;
  loading = false;
  saving = false;
  error = '';
  success = '';
  
  // Form mode
  isEditMode = false;
  postId: string | null = null;
  
  // Current user
  currentUser: User | null = null;
  
  // Options for dropdowns
  statusOptions: Array<{ value: PostStatus; label: string }> = [];
  categories: Category[] = [];
  authors: User[] = [];
  
  // Tag management
  tagInput = '';
  
  // Enums for template
  PostStatus = PostStatus;
  UserRole = UserRole;

  constructor(
    private fb: FormBuilder,
    private postsService: Posts,
    private categoriesService: Categories,
    private usersService: Users,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
      excerpt: [''],
      content: ['', [Validators.required, Validators.minLength(10)]],
      status: [PostStatus.DRAFT, [Validators.required]],
      author: ['', [Validators.required]],
      tags: [[]],
      featuredImage: [''],
      metaTitle: [''],
      metaDescription: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.initializeFormOptions();
    
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.postId = params['id'];
        this.loadPost();
      } else {
        this.setDefaultAuthor();
      }
    });
    
    // Auto-generate slug from title
    this.postForm.get('title')?.valueChanges.subscribe(title => {
      if (title && !this.isEditMode) {
        const slug = this.postsService.generateSlug(title);
        this.postForm.patchValue({ slug }, { emitEvent: false });
      }
    });
  }

  initializeFormOptions(): void {
    this.statusOptions = this.postsService.getStatusOptions();
    this.loadCategories();
    this.loadAuthors();
  }

  loadCategories(): void {
    this.categoriesService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadAuthors(): void {
    // Load users who can be authors (Admin, Editor, Author)
    this.usersService.getUsers({ limit: 100 }).subscribe({
      next: (response) => {
        this.authors = response.users.filter(user => 
          [UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR].includes(user.role)
        );
      },
      error: (error) => {
        console.error('Error loading authors:', error);
      }
    });
  }

  setDefaultAuthor(): void {
    if (this.currentUser && [UserRole.ADMIN, UserRole.EDITOR, UserRole.AUTHOR].includes(this.currentUser.role)) {
      this.postForm.patchValue({ author: this.currentUser._id });
    }
  }

  loadPost(): void {
    if (!this.postId) return;
    
    this.loading = true;
    this.postsService.getPost(this.postId).subscribe({
      next: (post) => {
        this.populateForm(post);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading post:', error);
        this.error = 'Failed to load post. Please try again.';
        this.loading = false;
      }
    });
  }

  populateForm(post: Post): void {
    const authorId = typeof post.author === 'string' ? post.author : post.author._id;
    
    this.postForm.patchValue({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      status: post.status,
      author: authorId,
      tags: post.tags || [],
      featuredImage: post.featuredImage || '',
      metaTitle: post.metaTitle || '',
      metaDescription: post.metaDescription || ''
    });
  }

  onSubmit(): void {
    if (this.postForm.invalid) {
      this.markFormGroupTouched();
      this.error = 'Please fill in all required fields correctly.';
      return;
    }

    this.saving = true;
    this.error = '';
    this.success = '';

    const formData = this.postForm.value;
    
    if (this.isEditMode && this.postId) {
      this.updatePost(formData);
    } else {
      this.createPost(formData);
    }
  }

  createPost(formData: CreatePostDto): void {
    this.postsService.createPost(formData).subscribe({
      next: (post) => {
        this.saving = false;
        this.success = 'Post created successfully!';
        setTimeout(() => {
          this.router.navigate(['/posts']);
        }, 1500);
      },
      error: (error) => {
        this.saving = false;
        console.error('Error creating post:', error);
        this.error = error.error?.message || 'Failed to create post. Please try again.';
      }
    });
  }

  updatePost(formData: UpdatePostDto): void {
    if (!this.postId) return;
    
    this.postsService.updatePost(this.postId, formData).subscribe({
      next: (post) => {
        this.saving = false;
        this.success = 'Post updated successfully!';
        setTimeout(() => {
          this.router.navigate(['/posts']);
        }, 1500);
      },
      error: (error) => {
        this.saving = false;
        console.error('Error updating post:', error);
        this.error = error.error?.message || 'Failed to update post. Please try again.';
      }
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

  addTag(): void {
    const tag = this.tagInput.trim();
    if (tag && !this.getCurrentTags().includes(tag)) {
      const currentTags = this.getCurrentTags();
      currentTags.push(tag);
      this.postForm.patchValue({ tags: currentTags });
      this.tagInput = '';
    }
  }

  removeTag(index: number): void {
    const currentTags = this.getCurrentTags();
    currentTags.splice(index, 1);
    this.postForm.patchValue({ tags: currentTags });
  }

  onTagInputKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTag();
    }
  }

  getCurrentTags(): string[] {
    return this.postForm.get('tags')?.value || [];
  }

  markFormGroupTouched(): void {
    Object.keys(this.postForm.controls).forEach(key => {
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
      if (errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
      if (errors['minlength']) return `${this.getFieldLabel(fieldName)} must be at least ${errors['minlength'].requiredLength} characters`;
      if (errors['pattern']) return `${this.getFieldLabel(fieldName)} contains invalid characters`;
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      title: 'Title',
      slug: 'Slug',
      content: 'Content',
      author: 'Author',
      status: 'Status'
    };
    return labels[fieldName] || fieldName;
  }

  canEditAuthor(): boolean {
    if (!this.currentUser) return false;
    // Only Admin and Editor can change the author
    return [UserRole.ADMIN, UserRole.EDITOR].includes(this.currentUser.role);
  }

  getAuthorName(authorId: string): string {
    const author = this.authors.find(a => a._id === authorId);
    return author ? `${author.firstName} ${author.lastName}` : 'Unknown Author';
  }

  // Getter methods for template
  get title() { return this.postForm.get('title'); }
  get slug() { return this.postForm.get('slug'); }
  get excerpt() { return this.postForm.get('excerpt'); }
  get content() { return this.postForm.get('content'); }
  get status() { return this.postForm.get('status'); }
  get author() { return this.postForm.get('author'); }
  get featuredImage() { return this.postForm.get('featuredImage'); }
  get metaTitle() { return this.postForm.get('metaTitle'); }
  get metaDescription() { return this.postForm.get('metaDescription'); }
}