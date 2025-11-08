import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm: FormGroup;
  loading = false;
  error = '';
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';

    if (this.loginForm.valid) {
      this.loading = true;

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.loading = false;
          console.log('Login successful:', response);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loading = false;
          console.error('Login error:', error);
          
          // Handle different types of errors
          if (error.status === 401) {
            this.error = 'Invalid email or password. Please try again.';
          } else if (error.status === 0) {
            this.error = 'Unable to connect to server. Please check your connection.';
          } else if (error.error?.message) {
            this.error = error.error.message;
          } else {
            this.error = 'Login failed. Please try again later.';
          }
        }
      });
    } else {
      this.error = 'Please fill in all required fields correctly.';
    }
  }

  // Helper method to check if field has error and should show message
  hasError(fieldName: string, errorType: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.hasError(errorType) && (field.touched || this.submitted));
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
