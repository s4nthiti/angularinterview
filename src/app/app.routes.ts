import { Routes } from '@angular/router';
import { UserForm } from './pages/user-form/user-form';

export const routes: Routes = [
  { path: '', component: UserForm },
  { path: '**', redirectTo: '' }
];
