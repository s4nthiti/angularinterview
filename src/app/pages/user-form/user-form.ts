import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
  AbstractControl
} from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { UserCreateRequest } from '../../models/user.model';

const OTHER = '__OTHER__';

function birthDayValidator(control: AbstractControl): ValidationErrors | null {
  const v: string = control.value ?? '';
  if (!v) return null;
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
  if (!m) return { birthDayFormat: true };
  const day = +m[1], month = +m[2], year = +m[3];
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    return { birthDayInvalid: true };
  }
  if (d > new Date()) return { birthDayFuture: true };
  return null;
}

@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule],
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss'
})
export class UserForm {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly toast = inject(ToastService);

  readonly OTHER = OTHER;
  readonly occupations = [
    'Software Engineer',
    'Designer',
    'Product Manager',
    'Data Analyst',
    'Student',
    OTHER
  ];

  readonly profilePreview = signal<string | null>(null);
  readonly profileFileName = signal<string | null>(null);
  readonly submitting = signal(false);

  readonly form: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName:  ['', [Validators.required, Validators.maxLength(100)]],
    email:     ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    phone:     ['', [Validators.required, Validators.pattern(/^0\d{9}$/)]],
    profileBase64: ['', [Validators.required]],
    birthDay:  ['', [Validators.required, birthDayValidator]],
    occupationSelect: ['', [Validators.required]],
    occupationOther:  [''],
    gender:    ['', [Validators.required]]
  });

  constructor() {
    this.form.get('occupationSelect')!.valueChanges.subscribe(val => {
      const otherCtrl = this.form.get('occupationOther')!;
      if (val === OTHER) {
        otherCtrl.setValidators([Validators.required, Validators.maxLength(100)]);
      } else {
        otherCtrl.clearValidators();
        otherCtrl.setValue('');
      }
      otherCtrl.updateValueAndValidity();
    });
  }

  isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.dirty || c.touched);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.toast.error('Profile must be an image file');
      input.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      this.toast.error('Profile image must be 2 MB or smaller');
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.profilePreview.set(result);
      this.profileFileName.set(file.name);
      this.form.patchValue({ profileBase64: result });
      this.form.get('profileBase64')!.markAsDirty();
    };
    reader.onerror = () => this.toast.error('Could not read selected file');
    reader.readAsDataURL(file);
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Please fill all required fields correctly');
      return;
    }
    const v = this.form.value;
    const occupation = v.occupationSelect === OTHER ? (v.occupationOther ?? '').trim() : v.occupationSelect;
    const payload: UserCreateRequest = {
      firstName: (v.firstName ?? '').trim(),
      lastName:  (v.lastName ?? '').trim(),
      email:     (v.email ?? '').trim(),
      phone:     (v.phone ?? '').trim(),
      profileBase64: v.profileBase64,
      birthDay:  v.birthDay,
      occupation,
      gender:    v.gender
    };

    this.submitting.set(true);
    this.userService.create(payload).subscribe({
      next: res => {
        this.submitting.set(false);
        this.toast.success(`Save Data Success ID: ${res.id}`);
        this.onClear();
      },
      error: err => {
        this.submitting.set(false);
        const msg = err?.error?.title ?? err?.message ?? 'Save failed';
        this.toast.error(msg);
      }
    });
  }

  onClear(): void {
    this.form.reset({
      firstName: '', lastName: '', email: '', phone: '',
      profileBase64: '', birthDay: '',
      occupationSelect: '', occupationOther: '', gender: ''
    });
    this.profilePreview.set(null);
    this.profileFileName.set(null);
    const fileInput = document.getElementById('profileFile') as HTMLInputElement | null;
    if (fileInput) fileInput.value = '';
  }
}
