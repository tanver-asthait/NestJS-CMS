import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { MainLayout } from './layouts/main-layout/main-layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { PostsComponent } from './pages/posts/posts';
import { PostFormComponent } from './pages/posts/post-form/post-form';
import { CategoriesComponent } from './pages/categories/categories';
import { CategoryForm } from './pages/categories/category-form/category-form';
import { UsersComponent } from './pages/users/users';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Public routes (no layout)
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  
  // Protected routes with layout
  {
    path: '',
    component: MainLayout,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'posts', component: PostsComponent },
      { path: 'posts/create', component: PostFormComponent },
      { path: 'posts/edit/:id', component: PostFormComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'categories/create', component: CategoryForm },
      { path: 'categories/edit/:id', component: CategoryForm },
      { path: 'users', component: UsersComponent },
    ]
  },
  
  // Fallback
  { path: '**', redirectTo: '/login' }
];
