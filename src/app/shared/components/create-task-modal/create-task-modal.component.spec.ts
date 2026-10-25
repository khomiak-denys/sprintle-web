import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateTaskModalComponent } from './create-task-modal.component';
import { AssignableMember } from '../assign-user-dialog/assign-user-dialog';

describe('CreateTaskModalComponent', () => {
  let component: CreateTaskModalComponent;
  let fixture: ComponentFixture<CreateTaskModalComponent>;

  const mockAssignee: AssignableMember = {
    id: 'user-1',
    userName: 'alex_dev',
    fullName: 'Alex Developer',
    email: 'alex@example.com',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTaskModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateTaskModalComponent);
    component = fixture.componentInstance;
  });

  it('Init_Should_CreateComponent', () => {
    expect(component).toBeTruthy();
  });

  it('Template_Should_NotRender_When_IsOpenIsFalse', () => {
    component.isOpen = false;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.azure-modal')).toBeNull();
  });

  it('Template_Should_Render_When_IsOpenIsTrue', () => {
    component.isOpen = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.azure-modal')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#modal-create-title').textContent).toContain(
      'Create New Work Item',
    );
    expect(fixture.nativeElement.querySelector('#create-title')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#create-priority')).toBeTruthy();
  });

  it('Assignee_Should_RenderBadge_When_SelectedAssigneeProvided', () => {
    component.isOpen = true;
    component.selectedAssignee = mockAssignee;
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.assignee-selected-badge');
    expect(badge).toBeTruthy();
    expect(badge.textContent).toContain('Alex Developer');
  });

  it('Assignee_Should_EmitOpenAssigneeDialog_When_AssigneeButtonIsClicked', () => {
    spyOn(component.openAssigneeDialog, 'emit');
    component.isOpen = true;
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('#btn-create-assignee');
    btn.click();

    expect(component.openAssigneeDialog.emit).toHaveBeenCalled();
  });

  it('Assignee_Should_EmitClearAssignee_When_ClearButtonIsClicked', () => {
    spyOn(component.clearAssignee, 'emit');
    component.isOpen = true;
    component.selectedAssignee = mockAssignee;
    fixture.detectChanges();

    const clearBtn = fixture.nativeElement.querySelector('#btn-clear-create-assignee');
    clearBtn.click();

    expect(component.clearAssignee.emit).toHaveBeenCalled();
  });

  it('Tags_Should_AddAndRemoveTagsCorrectly', () => {
    component.isOpen = true;
    fixture.detectChanges();

    component['addCreatedTag']('Security');
    expect(component['createdTags']).toEqual(['Security']);

    component['addCreatedTag']('Frontend');
    expect(component['createdTags']).toEqual(['Security', 'Frontend']);

    // Duplicate case-insensitive tag should not be added
    component['addCreatedTag']('security');
    expect(component['createdTags'].length).toBe(2);

    component['removeCreatedTag']('Security');
    expect(component['createdTags']).toEqual(['Frontend']);
  });

  it('onSubmit_Should_EmitSubmitTask_When_FormIsValid', () => {
    spyOn(component.submitTask, 'emit');
    component.isOpen = true;
    fixture.detectChanges();

    component['createTaskForm'].patchValue({
      title: 'Implement Auth Flow',
      priority: 'High',
      deadline: '2026-11-01',
      description: 'Implement JWT auth',
    });
    component['addCreatedTag']('Auth');

    component['onSubmit']();

    expect(component.submitTask.emit).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: 'Implement Auth Flow',
        priority: 'High',
        description: 'Implement JWT auth',
        tags: ['Auth'],
      }),
    );
  });

  it('onSubmit_Should_NotEmit_When_TitleIsTooShort', () => {
    spyOn(component.submitTask, 'emit');
    component.isOpen = true;
    fixture.detectChanges();

    component['createTaskForm'].patchValue({
      title: 'ab',
    });

    component['onSubmit']();

    expect(component.submitTask.emit).not.toHaveBeenCalled();
    expect(component['createTaskForm'].get('title')?.touched).toBeTrue();
  });

  it('onClose_Should_EmitClose_When_Invoked', () => {
    spyOn(component.close, 'emit');
    component.isOpen = true;
    fixture.detectChanges();

    const closeBtn = fixture.nativeElement.querySelector('.modal-close-btn');
    closeBtn.click();

    expect(component.close.emit).toHaveBeenCalled();
  });
});
