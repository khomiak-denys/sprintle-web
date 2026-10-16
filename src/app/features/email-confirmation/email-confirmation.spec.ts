import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { EmailConfirmationComponent } from './email-confirmation';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

describe('EmailConfirmationComponent', () => {
  let component: EmailConfirmationComponent;
  let fixture: ComponentFixture<EmailConfirmationComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let queryParamsSubject: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  beforeEach(async () => {
    queryParamsSubject = new BehaviorSubject(
      convertToParamMap({
        token: 'test-token',
        userId: 'user-123',
        email: 'user@example.com',
      }),
    );

    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'finishEmailConfirmation',
      'confirmEmail',
      'isAuthenticated',
      'currentUser',
    ]);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'success',
      'error',
      'warning',
      'info',
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    authServiceSpy.finishEmailConfirmation.and.returnValue(of(undefined as void));
    authServiceSpy.confirmEmail.and.returnValue(of(undefined as void));
    authServiceSpy.isAuthenticated.and.returnValue(false);
    authServiceSpy.currentUser.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [EmailConfirmationComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: queryParamsSubject.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailConfirmationComponent);
    component = fixture.componentInstance;
  });

  it('ngOnInit_Should_VerifyEmailAndSetSuccess_When_TokenProvidedInQueryParams', () => {
    fixture.detectChanges();

    expect(authServiceSpy.finishEmailConfirmation).toHaveBeenCalledWith(
      'test-token',
      'user-123',
      'user@example.com',
    );

    let stateResult: any;
    component.state$.subscribe((s) => (stateResult = s));

    expect(stateResult.status).toBe('success');
    expect(stateResult.token).toBe('test-token');
    expect(stateResult.countdown).toBe(5);
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Email confirmed successfully!');

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('#auto-close-info')?.textContent).toContain(
      'You can close this page.',
    );
    expect(element.querySelector('#btn-go-dashboard')).toBeNull();
  });

  it('startAutoCloseTimer_Should_CloseWindow_When_CountdownReachesZero', fakeAsync(() => {
    spyOn(component, 'closeWindow');
    component.startAutoCloseTimer();

    tick(1000);
    let stateResult: any;
    component.state$.subscribe((s) => (stateResult = s));
    expect(stateResult.countdown).toBe(4);

    tick(4000);
    expect(component.closeWindow).toHaveBeenCalled();
  }));

  it('closeWindow_Should_CallWindowClose_When_Invoked', () => {
    const windowSpy = spyOn(window, 'close');
    component.closeWindow();
    expect(windowSpy).toHaveBeenCalled();
  });

  it('ngOnInit_Should_SetMissingTokenStatus_When_NoTokenInQueryParams', () => {
    queryParamsSubject.next(convertToParamMap({}));
    fixture.detectChanges();

    expect(authServiceSpy.finishEmailConfirmation).not.toHaveBeenCalled();

    let stateResult: any;
    component.state$.subscribe((s) => (stateResult = s));

    expect(stateResult.status).toBe('missing-token');
    expect(stateResult.message).toContain('No confirmation token found');
  });

  it('ngOnInit_Should_SetErrorStatus_When_FinishEmailConfirmationFails', () => {
    authServiceSpy.finishEmailConfirmation.and.returnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            error: { detail: 'Token has expired' },
            status: 400,
          }),
      ),
    );

    fixture.detectChanges();

    let stateResult: any;
    component.state$.subscribe((s) => (stateResult = s));

    expect(stateResult.status).toBe('error');
    expect(stateResult.message).toBe('Token has expired');
    expect(notificationServiceSpy.error).toHaveBeenCalledWith('Token has expired');
  });

  it('resendConfirmationEmail_Should_CallAuthServiceConfirmEmail_When_EmailAvailable', () => {
    fixture.detectChanges();

    component.resendConfirmationEmail();

    expect(authServiceSpy.confirmEmail).toHaveBeenCalledWith('user@example.com');

    let stateResult: any;
    component.state$.subscribe((s) => (stateResult = s));

    expect(stateResult.resendSuccess).toBeTrue();
    expect(stateResult.resending).toBeFalse();
    expect(notificationServiceSpy.success).toHaveBeenCalledWith(
      'A new confirmation email has been sent. Please check your inbox.',
    );
  });

  it('resendConfirmationEmail_Should_HandleError_When_ConfirmEmailFails', () => {
    authServiceSpy.confirmEmail.and.returnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            error: { message: 'Too many requests' },
            status: 429,
          }),
      ),
    );

    fixture.detectChanges();
    component.resendConfirmationEmail();

    let stateResult: any;
    component.state$.subscribe((s) => (stateResult = s));

    expect(stateResult.resending).toBeFalse();
    expect(notificationServiceSpy.error).toHaveBeenCalledWith('Too many requests');
  });

  it('resendConfirmationEmail_Should_ShowWarning_When_NoEmailAvailable', () => {
    queryParamsSubject.next(convertToParamMap({ token: 'test-token' }));
    fixture.detectChanges();

    component.resendConfirmationEmail();

    expect(authServiceSpy.confirmEmail).not.toHaveBeenCalled();
    expect(notificationServiceSpy.warning).toHaveBeenCalledWith(
      'No email address available to resend verification.',
    );
  });

  it('retry_Should_ReinvokeVerification_When_TokenInState', () => {
    fixture.detectChanges();

    authServiceSpy.finishEmailConfirmation.calls.reset();
    component.retry();

    expect(authServiceSpy.finishEmailConfirmation).toHaveBeenCalledWith(
      'test-token',
      'user-123',
      'user@example.com',
    );
  });

  it('navigateToSignIn_Should_NavigateToAuth', () => {
    component.navigateToSignIn();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth']);
  });
});
