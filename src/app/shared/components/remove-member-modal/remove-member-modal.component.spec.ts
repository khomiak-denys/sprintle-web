import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RemoveMemberModalComponent } from './remove-member-modal.component';
import { WorkspaceMemberResult } from '../../../core/models/workspace.models';

describe('RemoveMemberModalComponent', () => {
  let component: RemoveMemberModalComponent;
  let fixture: ComponentFixture<RemoveMemberModalComponent>;

  const mockMember: WorkspaceMemberResult = {
    id: 'm-1',
    userId: 'u-1',
    userName: 'alex_dev',
    fullName: 'Alex Developer',
    email: 'alex@example.com',
    isOwner: false,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RemoveMemberModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RemoveMemberModalComponent);
    component = fixture.componentInstance;
  });

  it('Init_Should_CreateComponent', () => {
    expect(component).toBeTruthy();
  });

  it('Template_Should_NotRender_When_IsOpenIsFalse', () => {
    component.isOpen = false;
    component.member = mockMember;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#remove-member-modal')).toBeNull();
  });

  it('Template_Should_Render_When_IsOpenIsTrueAndMemberProvided', () => {
    component.isOpen = true;
    component.member = mockMember;
    component.workspaceName = 'Core Platform';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#remove-member-modal')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#remove-member-title').textContent).toContain(
      'Remove Member',
    );
    expect(fixture.nativeElement.textContent).toContain('Alex Developer');
    expect(fixture.nativeElement.textContent).toContain('Core Platform');
  });

  it('isConfirmEnabled_Should_ReturnTrueOnlyWhenUsernameMatches', () => {
    component.isOpen = true;
    component.member = mockMember;
    fixture.detectChanges();

    expect(component['isConfirmEnabled']()).toBeFalse();

    component['onConfirmInputChange']('alex');
    expect(component['isConfirmEnabled']()).toBeFalse();

    component['onConfirmInputChange']('alex_dev');
    expect(component['isConfirmEnabled']()).toBeTrue();

    component['onConfirmInputChange']('  alex_dev  ');
    expect(component['isConfirmEnabled']()).toBeTrue();
  });

  it('onConfirm_Should_EmitMember_When_Enabled', () => {
    spyOn(component.confirm, 'emit');
    component.isOpen = true;
    component.member = mockMember;
    component['onConfirmInputChange']('alex_dev');
    fixture.detectChanges();

    component['onConfirm']();

    expect(component.confirm.emit).toHaveBeenCalledWith(mockMember);
  });

  it('onClose_Should_EmitClose_When_InvokedAndNotRemoving', () => {
    spyOn(component.close, 'emit');
    component.isOpen = true;
    component.member = mockMember;
    fixture.detectChanges();

    const closeBtn = fixture.nativeElement.querySelector('#btn-close-remove-member');
    closeBtn.click();

    expect(component.close.emit).toHaveBeenCalled();
  });

  it('onClose_Should_NotEmit_When_IsRemovingIsTrue', () => {
    spyOn(component.close, 'emit');
    component.isOpen = true;
    component.member = mockMember;
    component.isRemoving = true;
    fixture.detectChanges();

    component['onClose']();

    expect(component.close.emit).not.toHaveBeenCalled();
  });
});
