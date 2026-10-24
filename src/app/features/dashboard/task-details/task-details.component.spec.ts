import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskDetailsComponent } from './task-details.component';
import { TaskDetailsResult, UserResult } from '../../../core/models/task.models';

describe('TaskDetailsComponent', () => {
  let component: TaskDetailsComponent;
  let fixture: ComponentFixture<TaskDetailsComponent>;

  const mockCurrentUser: UserResult = {
    id: 'user-current',
    userName: 'alex_dev',
    fullName: 'Alex Developer',
    email: 'alex@example.com',
  };

  const mockDetails: TaskDetailsResult = {
    id: 'task-101',
    workspaceId: 'ws-arch-core',
    number: 'DMS-101',
    title: 'Migrate to Azure DevOps Board',
    description: 'Break tasks into kanban columns and add status workflow',
    status: 'InProgress',
    priority: 'Critical',
    deadline: '2026-10-15T00:00:00Z',
    tags: ['DevOps', 'Frontend'],
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: null,
    createdBy: {
      id: 'creator-1',
      email: 'creator@example.com',
      userName: 'john_doe',
      fullName: 'John Doe',
    },
    assignee: {
      id: 'user-1',
      email: 'alex@example.com',
      userName: 'alex_dev',
      fullName: 'Alex Developer',
    },
    timeLogs: [
      {
        id: 'log-1',
        userId: 'user-1',
        minutesSpent: 90,
        description: 'Initial kanban board layout',
        loggedDate: '2026-10-01',
        createdAt: '2026-10-01T12:00:00Z',
      },
    ],
    availableTransitions: [
      { action: 'assign', targetStatus: 'InProgress', isAllowed: true },
      { action: 'submit-for-review', targetStatus: 'InReview', isAllowed: true },
      { action: 'approve', targetStatus: 'Done', isAllowed: true },
      { action: 'close', targetStatus: 'Closed', isAllowed: true },
      { action: 'cancel', targetStatus: 'Cancelled', isAllowed: true },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetailsComponent);
    component = fixture.componentInstance;
    component.task = mockDetails;
    component.currentUser = mockCurrentUser;
    component.isOpen = true;
    fixture.detectChanges();
  });

  it('Init_Should_CreateComponentAndDisplayTask_When_Provided', () => {
    expect(component).toBeTruthy();
    expect(component.task?.title).toBe('Migrate to Azure DevOps Board');
  });

  it('onClose_Should_EmitCloseBlade_When_Invoked', () => {
    spyOn(component.closeBlade, 'emit');
    component['onClose']();
    expect(component.closeBlade.emit).toHaveBeenCalled();
  });

  it('onAssign_Should_EmitAssign_When_Invoked', () => {
    spyOn(component.assign, 'emit');
    component['onAssign']();
    expect(component.assign.emit).toHaveBeenCalled();
  });

  it('onSubmitForReview_Should_EmitSubmitForReview_When_Invoked', () => {
    spyOn(component.submitForReview, 'emit');
    component['onSubmitForReview']();
    expect(component.submitForReview.emit).toHaveBeenCalled();
  });

  it('onApprove_Should_EmitApprove_When_Invoked', () => {
    spyOn(component.approve, 'emit');
    component['onApprove']();
    expect(component.approve.emit).toHaveBeenCalled();
  });

  it('onCloseTask_Should_EmitClose_When_Invoked', () => {
    spyOn(component.close, 'emit');
    component['onCloseTask']();
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('onCancel_Should_EmitCancel_When_Invoked', () => {
    spyOn(component.cancel, 'emit');
    component['onCancel']();
    expect(component.cancel.emit).toHaveBeenCalled();
  });

  it('Helpers_Should_ReturnCorrectNamesAndInitials_When_DataPresent', () => {
    expect(component['getAssigneeName']()).toBe('Alex Developer');
    expect(component['getAssigneeInitial']()).toBe('A');
    expect(component['getCreatorName']()).toBe('John Doe');
    expect(component['getCreatorInitial']()).toBe('J');
    expect(component['getTotalLoggedMinutes']()).toBe(90);
  });

  it('Helpers_Should_HandleNullValuesGracefully_When_NoAssigneeOrLogs', () => {
    component.task = {
      ...mockDetails,
      assignee: null,
      timeLogs: [],
    };
    fixture.detectChanges();

    expect(component['getAssigneeName']()).toBe('Unassigned');
    expect(component['getAssigneeInitial']()).toBe('?');
    expect(component['getTotalLoggedMinutes']()).toBe(0);
  });

  it('Comments_Should_DefaultToEmpty_When_TaskHasNoPredefinedComments', () => {
    expect(component['comments'].length).toBe(0);
  });

  it('Comments_Should_UseProvidedComments_When_TaskHasComments', () => {
    const customComments = [
      {
        id: 'c-custom-1',
        taskId: 'task-custom',
        author: {
          id: 'user-c',
          userName: 'custom_user',
          fullName: 'Custom User',
          email: 'custom@example.com',
        },
        content: 'Custom comment from test',
        createdAt: '2026-10-01T14:00:00Z',
      },
    ];

    component.task = {
      ...mockDetails,
      id: 'task-custom',
      comments: customComments,
    };
    fixture.detectChanges();

    expect(component['comments'].length).toBe(1);
    expect(component['comments'][0].content).toBe('Custom comment from test');
  });

  it('onCommentInput_Should_UpdateNewCommentText_When_UserTypes', () => {
    component['onCommentInput']('Reviewing task now');
    expect(component['newCommentText']).toBe('Reviewing task now');
  });

  it('onAddComment_Should_AppendCommentAndClearInput_When_ValidTextProvided', () => {
    const initialCount = component['comments'].length;
    component['onCommentInput']('Adding a test comment');
    component['onAddComment']();

    expect(component['comments'].length).toBe(initialCount + 1);
    const added = component['comments'][component['comments'].length - 1];
    expect(added.content).toBe('Adding a test comment');
    expect(added.author?.fullName).toBe('Alex Developer');
    expect(component['newCommentText']).toBe('');
  });

  it('onDeleteComment_Should_EmitDeleteCommentAndRemoveLocal_When_Called', () => {
    spyOn(component.deleteComment, 'emit');
    component['onCommentInput']('Comment to delete');
    component['onAddComment']();
    const commentId = component['comments'][component['comments'].length - 1].id;

    component['onDeleteComment'](commentId);

    expect(component.deleteComment.emit).toHaveBeenCalledWith(commentId);
    expect(component['comments'].some((c) => c.id === commentId)).toBeFalse();
  });

  it('onAddComment_Should_DoNothing_When_TextIsWhitespaceOrEmpty', () => {
    const initialCount = component['comments'].length;
    component['onCommentInput']('   ');
    component['onAddComment']();

    expect(component['comments'].length).toBe(initialCount);
  });

  it('taskCommentsMap_Should_RetainCommentsAcrossBladeReopen_When_SameTaskIdProvided', () => {
    component['onCommentInput']('Persistent comment test');
    component['onAddComment']();
    const countWithNewComment = component['comments'].length;

    // Simulate switching away and switching back to task-101
    component.task = null;
    fixture.detectChanges();
    expect(component['comments'].length).toBe(0);

    component.task = mockDetails;
    fixture.detectChanges();
    expect(component['comments'].length).toBe(countWithNewComment);
    expect(component['comments'].some((c) => c.content === 'Persistent comment test')).toBeTrue();
  });

  it('getAuthorInitial_Should_ReturnQuestionMark_When_AuthorIsNull', () => {
    expect(component['getAuthorInitial'](null)).toBe('?');
  });

  it('canChangePriority_Should_ReturnTrue_When_UserIsAdmin', () => {
    component.isAdmin = true;
    component.currentUser = {
      id: 'other-user',
      userName: 'other',
      fullName: 'Other',
      email: 'o@test.com',
    };
    expect(component['canChangePriority']).toBeTrue();
  });

  it('canChangePriority_Should_ReturnTrue_When_UserIsCreator', () => {
    component.isAdmin = false;
    component.currentUser = {
      id: 'creator-1',
      userName: 'creator',
      fullName: 'Creator',
      email: 'c@test.com',
    };
    expect(component['canChangePriority']).toBeTrue();
  });

  it('canChangePriority_Should_ReturnFalse_When_UserIsNotCreatorAndNotAdmin', () => {
    component.isAdmin = false;
    component.currentUser = {
      id: 'other-user',
      userName: 'other',
      fullName: 'Other',
      email: 'o@test.com',
    };
    expect(component['canChangePriority']).toBeFalse();
  });

  it('togglePriorityDropdown_Should_ToggleOpenState_When_UserCanChangePriority', () => {
    component.isAdmin = true;
    expect(component['isPriorityDropdownOpen']).toBeFalse();

    component['togglePriorityDropdown']();
    expect(component['isPriorityDropdownOpen']).toBeTrue();

    component['togglePriorityDropdown']();
    expect(component['isPriorityDropdownOpen']).toBeFalse();
  });

  it('togglePriorityDropdown_Should_NotOpen_When_UserCannotChangePriority', () => {
    component.isAdmin = false;
    component.currentUser = {
      id: 'other-user',
      userName: 'other',
      fullName: 'Other',
      email: 'o@test.com',
    };
    component['togglePriorityDropdown']();
    expect(component['isPriorityDropdownOpen']).toBeFalse();
  });

  it('selectPriority_Should_EmitChangePriorityAndCloseDropdown_When_DifferentPrioritySelected', () => {
    spyOn(component.changePriority, 'emit');
    component.isAdmin = true;
    component['isPriorityDropdownOpen'] = true;

    component['selectPriority']('Low');

    expect(component['isPriorityDropdownOpen']).toBeFalse();
    expect(component.changePriority.emit).toHaveBeenCalledWith('Low');
  });

  it('selectPriority_Should_NotEmit_When_SamePrioritySelected', () => {
    spyOn(component.changePriority, 'emit');
    component.isAdmin = true;
    component['isPriorityDropdownOpen'] = true;

    // mockDetails priority is 'Critical'
    component['selectPriority']('Critical');

    expect(component['isPriorityDropdownOpen']).toBeFalse();
    expect(component.changePriority.emit).not.toHaveBeenCalled();
  });

  it('canChangePriority_Should_ReturnFalse_When_CurrentUserIsNullAndNotAdmin', () => {
    component.isAdmin = false;
    component.currentUser = null;
    expect(component['canChangePriority']).toBeFalse();
  });

  it('canDeleteComment_Should_ReturnTrue_When_UserIsAdmin', () => {
    component.isAdmin = true;
    component.currentUser = {
      id: 'other-user',
      userName: 'other',
      fullName: 'Other',
      email: 'o@test.com',
    };
    const comment = {
      id: 'c-1',
      authorId: 'creator-1',
      author: null,
      content: 'hello',
      createdAt: '2026-10-01T00:00:00Z',
    };
    expect(component['canDeleteComment'](comment)).toBeTrue();
  });

  it('canDeleteComment_Should_ReturnTrue_When_UserIsCommentAuthor', () => {
    component.isAdmin = false;
    component.currentUser = {
      id: 'creator-1',
      userName: 'creator',
      fullName: 'Creator',
      email: 'c@test.com',
    };
    const comment = {
      id: 'c-1',
      authorId: 'creator-1',
      author: null,
      content: 'hello',
      createdAt: '2026-10-01T00:00:00Z',
    };
    expect(component['canDeleteComment'](comment)).toBeTrue();
  });

  it('canDeleteComment_Should_ReturnFalse_When_UserIsNotAuthorAndNotAdmin', () => {
    component.isAdmin = false;
    component.currentUser = {
      id: 'other-user',
      userName: 'other',
      fullName: 'Other',
      email: 'o@test.com',
    };
    const comment = {
      id: 'c-1',
      authorId: 'creator-1',
      author: null,
      content: 'hello',
      createdAt: '2026-10-01T00:00:00Z',
    };
    expect(component['canDeleteComment'](comment)).toBeFalse();
  });

  it('canDeleteComment_Should_ReturnFalse_When_CurrentUserIsNullAndNotAdmin', () => {
    component.isAdmin = false;
    component.currentUser = null;
    const comment = {
      id: 'c-1',
      authorId: 'creator-1',
      author: null,
      content: 'hello',
      createdAt: '2026-10-01T00:00:00Z',
    };
    expect(component['canDeleteComment'](comment)).toBeFalse();
  });
});
