import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ProfileComponent } from './profile';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { WorkspaceService } from '../../core/services/workspace.service';
import { NavigationHistoryService } from '../../core/services/navigation-history.service';
import { NotificationService } from '../../core/services/notification.service';
import { UserProfile } from '../../core/models/user.models';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let workspaceServiceSpy: jasmine.SpyObj<WorkspaceService>;
  let navHistoryServiceSpy: jasmine.SpyObj<NavigationHistoryService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  const mockProfile: UserProfile = {
    id: 'user-123',
    userName: 'john_doe',
    email: 'john@example.com',
    fullName: 'John Doe',
    roles: ['User'],
    emailConfirmed: true,
    twoFactorEnabled: false,
    lockoutEnd: null,
    lockoutEnabled: false,
    accessFailedCount: 0,
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'currentUserId',
      'currentUser',
      'logout',
      'isAdmin',
      'confirmEmail',
    ]);
    authServiceSpy.confirmEmail.and.returnValue(of(undefined as void));
    authServiceSpy.isAdmin.and.returnValue(false);
    authServiceSpy.currentUserId.and.returnValue('user-123');
    authServiceSpy.currentUser.and.returnValue({
      sub: 'user-123',
      email: 'john@example.com',
      unique_name: 'john_doe',
      role: 'User',
      exp: 9999999999,
      iat: 1000000000,
    });

    userServiceSpy = jasmine.createSpyObj('UserService', [
      'getProfile',
      'updateProfile',
      'changePassword',
    ]);
    userServiceSpy.getProfile.and.returnValue(of(mockProfile));

    notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'success',
      'error',
      'info',
    ]);

    workspaceServiceSpy = jasmine.createSpyObj('WorkspaceService', ['selectWorkspace'], {
      currentWorkspace: { id: 'ws-123', name: 'Dev Workspace' } as any,
    });

    navHistoryServiceSpy = jasmine.createSpyObj('NavigationHistoryService', [
      'getPreviousUrl',
      'setPreviousUrl',
    ]);
    navHistoryServiceSpy.getPreviousUrl.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: WorkspaceService, useValue: workspaceServiceSpy },
        { provide: NavigationHistoryService, useValue: navHistoryServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => null } },
            paramMap: of({ get: () => null }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Init_Should_LoadProfileAndPopulateForm_When_ComponentInitializes', () => {
    expect(component).toBeTruthy();
    expect(userServiceSpy.getProfile).toHaveBeenCalledWith('user-123');
    expect(component.snapshot.profile).toEqual(mockProfile);
    expect(component.snapshot.loading).toBeFalse();
    expect(component.snapshot.userInitial).toBe('J');
    expect(component.snapshot.isOwnProfile).toBeTrue();
  });

  it('onSaveProfile_Should_UpdateProfileAndNotify_When_ValidFormSubmitted', () => {
    userServiceSpy.updateProfile.and.returnValue(of(void 0));

    component['profileForm'].patchValue({
      fullName: 'Johnathan Doe',
      userName: 'john_doe',
    });

    component['onSaveProfile']();

    expect(userServiceSpy.updateProfile).toHaveBeenCalledWith('user-123', {
      fullName: 'Johnathan Doe',
      userName: 'john_doe',
    });
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Profile updated successfully.');
    expect(component.snapshot.savingProfile).toBeFalse();
    expect(component.snapshot.profileSuccessMessage).toBe('Profile updated successfully.');
  });

  it('onChangePassword_Should_ChangePasswordAndNotify_When_ValidFormSubmitted', () => {
    userServiceSpy.changePassword.and.returnValue(of(void 0));

    component['passwordForm'].setValue({
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
      confirmNewPassword: 'NewPassword123!',
    });

    component['onChangePassword']();

    expect(userServiceSpy.changePassword).toHaveBeenCalledWith('user-123', {
      currentPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
    });
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Password changed successfully.');
    expect(component.snapshot.changingPassword).toBeFalse();
    expect(component.snapshot.passwordSuccessMessage).toBe('Password changed successfully.');
  });

  it('toggleSection_Should_ToggleExpandedState_When_Invoked', () => {
    expect(component['isSectionExpanded']('personal')).toBeFalse();
    component['toggleSection']('personal');
    expect(component['isSectionExpanded']('personal')).toBeTrue();
    component['toggleSection']('personal');
    expect(component['isSectionExpanded']('personal')).toBeFalse();
  });

  it('expandSection_Should_SetSectionExpandedToTrue_When_Invoked', () => {
    expect(component['isSectionExpanded']('security')).toBeFalse();
    component['expandSection']('security');
    expect(component['isSectionExpanded']('security')).toBeTrue();
  });

  it('togglePasswords_Should_ToggleVisibilityFlags_When_Invoked', () => {
    expect(component.snapshot.showCurrentPassword).toBeFalse();
    component['toggleCurrentPassword']();
    expect(component.snapshot.showCurrentPassword).toBeTrue();

    expect(component.snapshot.showNewPassword).toBeFalse();
    component['toggleNewPassword']();
    expect(component.snapshot.showNewPassword).toBeTrue();

    expect(component.snapshot.showConfirmNewPassword).toBeFalse();
    component['toggleConfirmNewPassword']();
    expect(component.snapshot.showConfirmNewPassword).toBeTrue();
  });

  it('onDiscardProfile_Should_ResetFormToLoadedProfile_When_Invoked', () => {
    component['profileForm'].patchValue({ fullName: 'Unsaved Name' });
    component['onDiscardProfile']();

    expect(component['profileForm'].get('fullName')?.value).toBe('John Doe');
    expect(component['isSectionExpanded']('personal')).toBeFalse();
  });

  it('onDiscardPassword_Should_ResetPasswordForm_When_Invoked', () => {
    component['passwordForm'].patchValue({ currentPassword: 'SomePassword' });
    component['onDiscardPassword']();

    expect(component['passwordForm'].get('currentPassword')?.value).toBeNull();
    expect(component['isSectionExpanded']('security')).toBeFalse();
  });

  it('onLogout_Should_NotifyAndCallAuthLogout_When_Invoked', () => {
    component['onLogout']();

    expect(notificationServiceSpy.info).toHaveBeenCalledWith('You have been signed out.');
    expect(authServiceSpy.logout).toHaveBeenCalled();
  });

  it('loadProfile_Should_SetErrorMessage_When_GetProfileFailsWith403', () => {
    userServiceSpy.getProfile.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 403, error: { message: 'Access denied' } })),
    );

    component['loadProfile']();

    expect(component.snapshot.loading).toBeFalse();
    expect(component.snapshot.profileErrorMessage).toBe('Access denied');
  });

  it('onConfirmEmail_Should_CallAuthServiceAndNotify_When_Invoked', () => {
    authServiceSpy.confirmEmail.and.returnValue(of(undefined as void));

    component['onConfirmEmail']();

    expect(authServiceSpy.confirmEmail).toHaveBeenCalledWith('john@example.com');
    expect(component.snapshot.confirmingEmail).toBeFalse();
    expect(component.snapshot.profileSuccessMessage).toBe(
      'Confirmation email sent! Please check your inbox.',
    );
    expect(notificationServiceSpy.success).toHaveBeenCalledWith(
      'Confirmation email sent! Please check your inbox.',
    );
  });

  it('onConfirmEmail_Should_SetErrorMessage_When_ServiceFails', () => {
    authServiceSpy.confirmEmail.and.returnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { detail: 'Email is already confirmed' },
          }),
      ),
    );

    component['onConfirmEmail']();

    expect(component.snapshot.confirmingEmail).toBeFalse();
    expect(component.snapshot.profileErrorMessage).toBe('Email is already confirmed');
    expect(notificationServiceSpy.error).toHaveBeenCalledWith('Email is already confirmed');
  });

  it('backToDashboardRoute_Should_ReturnAdminDashboard_When_UserIsAdmin', () => {
    authServiceSpy.isAdmin.and.returnValue(true);
    expect(component.backToDashboardRoute).toBe('/admin');
    expect(component.backButtonLabel).toBe('Back to Admin Dashboard');
  });

  it('backToDashboardRoute_Should_ReturnRootDashboard_When_UserIsNotAdmin_And_HasWorkspace', () => {
    authServiceSpy.isAdmin.and.returnValue(false);
    component.navigatedFrom = null;
    expect(component.backToDashboardRoute).toBe('/');
    expect(component.backButtonLabel).toBe('Back to Dashboard');
  });

  it('backToDashboardRoute_Should_ReturnWorkspaces_When_UserNavigatedFromWorkspaces', () => {
    authServiceSpy.isAdmin.and.returnValue(false);
    component.navigatedFrom = '/workspaces';
    expect(component.backToDashboardRoute).toBe('/workspaces');
    expect(component.backButtonLabel).toBe('Back to Workspaces');
  });

  it('backToDashboardRoute_Should_ReturnWorkspaces_When_UserHasNoActiveWorkspace', () => {
    authServiceSpy.isAdmin.and.returnValue(false);
    component.navigatedFrom = null;
    (
      Object.getOwnPropertyDescriptor(workspaceServiceSpy, 'currentWorkspace')?.get as jasmine.Spy
    ).and.returnValue(null);
    expect(component.backToDashboardRoute).toBe('/workspaces');
    expect(component.backButtonLabel).toBe('Back to Workspaces');
  });

  it('loadProfile_Should_FetchProfileOnlyOnce_When_EmbeddedWithUserId', () => {
    const newFixture = TestBed.createComponent(ProfileComponent);
    const newComponent = newFixture.componentInstance;
    userServiceSpy.getProfile.calls.reset();

    newComponent.embedded = true;
    newComponent.userId = 'user-embedded-456';
    newFixture.detectChanges(); // triggers ngOnInit

    expect(userServiceSpy.getProfile).toHaveBeenCalledTimes(1);
    expect(userServiceSpy.getProfile).toHaveBeenCalledWith('user-embedded-456');
  });

  it('userId_Should_ReloadProfile_When_ChangedAfterInit', () => {
    userServiceSpy.getProfile.calls.reset();

    component.embedded = true;
    component.userId = 'user-second-789';

    expect(userServiceSpy.getProfile).toHaveBeenCalledTimes(1);
    expect(userServiceSpy.getProfile).toHaveBeenCalledWith('user-second-789');
  });
});
