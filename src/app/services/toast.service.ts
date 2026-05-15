import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  type: ToastType;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();
  private nextId = 1;

  show(text: string, type: ToastType = 'success', durationMs = 3500): void {
    const toast: ToastMessage = { id: this.nextId++, type, text };
    this._toasts.update(list => [...list, toast]);
    setTimeout(() => this.dismiss(toast.id), durationMs);
  }

  success(text: string, durationMs?: number): void { this.show(text, 'success', durationMs); }
  error(text: string, durationMs?: number): void { this.show(text, 'error', durationMs); }
  info(text: string, durationMs?: number): void { this.show(text, 'info', durationMs); }

  dismiss(id: number): void {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }
}
