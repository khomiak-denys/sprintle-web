import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateWorkspaceModalComponent } from './create-workspace-modal.component';

describe('CreateWorkspaceModalComponent', () => {
  let component: CreateWorkspaceModalComponent;
  let fixture: ComponentFixture<CreateWorkspaceModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateWorkspaceModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateWorkspaceModalComponent);
    component = fixture.componentInstance;
  });

  it('Init_Should_CreateComponent', () => {
    expect(component).toBeTruthy();
  });

  it('Template_Should_NotRenderModal_When_IsOpenIsFalse', () => {
    component.isOpen = false;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.azure-modal')).toBeNull();
  });

  it('Template_Should_RenderModalAndForm_When_IsOpenIsTrueAndCanCreateIsTrue', () => {
    component.isOpen = true;
    component.canCreate = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.azure-modal')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#ws-name-input')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#submit-create-workspace-btn')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#btn-contact-admin')).toBeNull();
  });

  it('Template_Should_RenderContactAdmin_When_CanCreateIsFalse', () => {
    component.isOpen = true;
    component.canCreate = false;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.azure-modal')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#ws-name-input')).toBeNull();
    expect(fixture.nativeElement.querySelector('#submit-create-workspace-btn')).toBeNull();
    const contactAdmin = fixture.nativeElement.querySelector('#btn-contact-admin');
    expect(contactAdmin).toBeTruthy();
    expect(contactAdmin.getAttribute('href')).toBe('mailto:admin@gmail.com');
  });

  it('onClose_Should_EmitCloseEvent_When_CloseButtonOrOverlayClicked', () => {
    spyOn(component.close, 'emit');
    component.isOpen = true;
    fixture.detectChanges();

    const closeBtn = fixture.nativeElement.querySelector('.modal-close-btn');
    closeBtn.click();
    expect(component.close.emit).toHaveBeenCalledTimes(1);

    const overlay = fixture.nativeElement.querySelector('.modal-overlay');
    overlay.click();
    expect(component.close.emit).toHaveBeenCalledTimes(2);
  });

  it('onSubmit_Should_EmitSubmitWorkspace_When_FormIsValid', () => {
    spyOn(component.submitWorkspace, 'emit');
    component.isOpen = true;
    component.canCreate = true;
    fixture.detectChanges();

    component['createForm'].patchValue({
      name: 'Analytics Platform',
      description: 'Analytics workspace',
    });
    fixture.detectChanges();

    component['onSubmit']();

    expect(component.submitWorkspace.emit).toHaveBeenCalledWith({
      name: 'Analytics Platform',
      description: 'Analytics workspace',
    });
  });

  it('onSubmit_Should_NotEmit_When_FormIsInvalid', () => {
    spyOn(component.submitWorkspace, 'emit');
    component.isOpen = true;
    component.canCreate = true;
    fixture.detectChanges();

    component['createForm'].patchValue({
      name: 'ab', // minlength is 3
    });
    component['onSubmit']();

    expect(component.submitWorkspace.emit).not.toHaveBeenCalled();
    expect(component['createForm'].get('name')?.touched).toBeTrue();
  });
});
