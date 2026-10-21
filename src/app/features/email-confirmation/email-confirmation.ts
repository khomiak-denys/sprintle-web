import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, distinctUntilChanged, map, take, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

export type EmailConfirmationStatus = 'verifying' | 'success' | 'error' | 'missing-token';

export interface EmailConfirmationState {
  readonly status: EmailConfirmationStatus;
  readonly message: string | null;
  readonly email: string | null;
  readonly userId: string | null;
  readonly token: string | null;
  readonly resending: boolean;
  readonly resendSuccess: boolean;
  readonly countdown: number | null;
}

const initialState: EmailConfirmationState = {
  status: 'verifying',
  message: null,
  email: null,
  userId: null,
  token: null,
  resending: false,
  resendSuccess: false,
  countdown: null,
};

@Component({
  selector: 'app-email-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email-confirmation.html',
  styleUrl: './email-confirmation.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmailConfirmationComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  private readonly stateSubject = new BehaviorSubject<EmailConfirmationState>(initialState);
  readonly state$: Observable<EmailConfirmationState> = this.stateSubject.asObservable();

  readonly status$: Observable<EmailConfirmationStatus> = this.state$.pipe(
    map((s) => s.status),
    distinctUntilChanged(),
  );

  readonly message$: Observable<string | null> = this.state$.pipe(
    map((s) => s.message),
    distinctUntilChanged(),
  );

  readonly resending$: Observable<boolean> = this.state$.pipe(
    map((s) => s.resending),
    distinctUntilChanged(),
  );

  readonly resendSuccess$: Observable<boolean> = this.state$.pipe(
    map((s) => s.resendSuccess),
    distinctUntilChanged(),
  );

  readonly countdown$: Observable<number | null> = this.state$.pipe(
    map((s) => s.countdown),
    distinctUntilChanged(),
  );

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const token = params.get('token');
      const userId = params.get('userId') || params.get('id');
      const email = params.get('email');

      if (!token) {
        this.updateState({
          status: 'missing-token',
          message:
            'No confirmation token found. Please check your verification link or request a new one.',
          email,
          userId,
          token: null,
        });
        return;
      }

      this.updateState({
        status: 'verifying',
        token,
        userId,
        email,
        message: null,
      });

      this.verifyEmail(token, userId, email);
    });
  }

  verifyEmail(token: string, userId: string | null, email: string | null): void {
    this.updateState({ status: 'verifying', message: null });

    this.authService
      .finishEmailConfirmation(token, userId ?? undefined, email ?? undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.updateState({
            status: 'success',
            message:
              'Your email address has been successfully verified! You now have full access to Sprintle.',
            countdown: 5,
          });
          this.notificationService.success('Email confirmed successfully!');
          this.startAutoCloseTimer();
        },
        error: (err: HttpErrorResponse) => {
          let errorMsg =
            'Failed to confirm email. The verification link may be invalid or expired.';
          if (err.error?.detail || err.error?.message) {
            errorMsg = err.error?.detail ?? err.error?.message;
          }
          this.updateState({
            status: 'error',
            message: errorMsg,
          });
          this.notificationService.error(errorMsg);
        },
      });
  }

  startAutoCloseTimer(): void {
    timer(0, 1000)
      .pipe(take(6), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (elapsed) => {
          const remaining = 5 - elapsed;
          this.updateState({ countdown: remaining });
          if (remaining <= 0) {
            this.closeWindow();
          }
        },
      });
  }

  closeWindow(): void {
    window.close();
  }

  resendConfirmationEmail(): void {
    const currentState = this.stateSubject.value;
    const email = currentState.email || this.authService.currentUser()?.email;

    if (!email) {
      this.notificationService.warning('No email address available to resend verification.');
      return;
    }

    this.updateState({ resending: true, resendSuccess: false });

    this.authService
      .confirmEmail(email)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.updateState({
            resending: false,
            resendSuccess: true,
          });
          this.notificationService.success(
            'A new confirmation email has been sent. Please check your inbox.',
          );
        },
        error: (err: HttpErrorResponse) => {
          let errorMsg = 'Failed to resend confirmation email. Please try again.';
          if (err.error?.detail || err.error?.message) {
            errorMsg = err.error?.detail ?? err.error?.message;
          }
          this.updateState({
            resending: false,
          });
          this.notificationService.error(errorMsg);
        },
      });
  }

  retry(): void {
    const currentState = this.stateSubject.value;
    if (currentState.token) {
      this.verifyEmail(currentState.token, currentState.userId, currentState.email);
    }
  }

  navigateToSignIn(): void {
    this.router.navigate(['/auth']);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/']);
  }

  private updateState(partial: Partial<EmailConfirmationState>): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      ...partial,
    });
  }
}
