import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserMenuComponent } from './user-menu';

describe('UserMenuComponent', () => {
  let component: UserMenuComponent;
  let fixture: ComponentFixture<UserMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display userInitial in avatar button', () => {
    fixture.componentRef.setInput('userInitial', 'D');
    fixture.detectChanges();

    const avatar = fixture.nativeElement.querySelector('#user-avatar-btn');
    expect(avatar.textContent.trim()).toBe('D');
  });

  it('should emit toggle on avatar button click', () => {
    spyOn(component.toggle, 'emit');
    const avatar = fixture.nativeElement.querySelector('#user-avatar-btn');
    avatar.click();
    expect(component.toggle.emit).toHaveBeenCalled();
  });

  it('should render dropdown menu when isOpen is true', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    const dropdown = fixture.nativeElement.querySelector('#user-dropdown-menu');
    expect(dropdown).toBeTruthy();
  });

  it('should not render dropdown menu when isOpen is false', () => {
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();

    const dropdown = fixture.nativeElement.querySelector('#user-dropdown-menu');
    expect(dropdown).toBeNull();
  });

  it('should emit profile, admin, logout events when items are clicked', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('isAdmin', true);
    fixture.componentRef.setInput('showAdminOption', true);
    fixture.detectChanges();

    spyOn(component.profile, 'emit');
    spyOn(component.admin, 'emit');
    spyOn(component.logout, 'emit');

    const profileBtn = fixture.nativeElement.querySelector('#menu-item-profile');
    const adminBtn = fixture.nativeElement.querySelector('#menu-item-admin');
    const logoutBtn = fixture.nativeElement.querySelector('#menu-item-logout');

    profileBtn.click();
    expect(component.profile.emit).toHaveBeenCalled();

    adminBtn.click();
    expect(component.admin.emit).toHaveBeenCalled();

    logoutBtn.click();
    expect(component.logout.emit).toHaveBeenCalled();
  });

  it('should hide admin button if isAdmin is false', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.componentRef.setInput('isAdmin', false);
    fixture.componentRef.setInput('showAdminOption', true);
    fixture.detectChanges();

    const adminBtn = fixture.nativeElement.querySelector('#menu-item-admin');
    expect(adminBtn).toBeNull();
  });

  it('should emit close when clicked outside', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();

    spyOn(component.close, 'emit');

    const outsideElement = document.createElement('div');
    document.body.appendChild(outsideElement);
    const mouseEvent = new MouseEvent('click', { bubbles: true });
    outsideElement.dispatchEvent(mouseEvent);

    expect(component.close.emit).toHaveBeenCalled();
    document.body.removeChild(outsideElement);
  });
});
