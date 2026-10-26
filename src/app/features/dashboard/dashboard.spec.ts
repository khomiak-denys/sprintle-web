import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { TaskService } from '../../core/services/task.service';
import { TaskResult, TaskDetailsResult } from '../../core/models/task.models';
import { WorkspaceService } from '../../core/services/workspace.service';
import { Workspace, WorkspaceMemberResult } from '../../core/models/workspace.models';
import { CreateTaskPayload } from '../../shared/components/create-task-modal/create-task-modal.component';
import { LogTimePayload } from '../../shared/components/log-time-modal/log-time-modal.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;
  let workspaceService: WorkspaceService;
  const mockWorkspace: Workspace = {
    id: 'ws-arch-core',
    name: 'Architecture Lab Core',
    code: 'ARCH',
    description: 'Clean architecture microservices',
    role: 'Owner',
    memberCount: 8,
    taskCount: 6,
    color: '#0078D4',
    isDefault: true,
  };

  const mockTasks: TaskResult[] = [
    {
      id: 'task-1',
      workspaceId: 'ws-arch-core',
      number: 'DMS-1',
      title: 'Setup OTLP Tracing',
      description: 'Distributed tracing across services',
      status: 'InProgress',
      priority: 'High',
      deadline: '2026-10-10T00:00:00Z',
      assignee: {
        id: 'user-123',
        email: 'alex@example.com',
        userName: 'alex_dev',
        fullName: 'Alex Developer',
      },
      tags: ['DevOps', 'Telemetry'],
    },
    {
      id: 'task-2',
      workspaceId: 'ws-arch-core',
      number: 'DMS-2',
      title: 'Fix Navigation Header',
      description: 'Align Azure logo and menu',
      status: 'Todo',
      priority: 'Low',
      deadline: null,
      assignee: null,
      tags: ['UI'],
    },
  ];

  const mockDetails: TaskDetailsResult = {
    ...mockTasks[0],
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: null,
    createdBy: {
      id: 'user-123',
      email: 'test@example.com',
      userName: 'test_user',
      fullName: 'Test User',
    },
    assignee: {
      id: 'user-123',
      email: 'test@example.com',
      userName: 'test_user',
      fullName: 'Test User',
    },
    timeLogs: [
      {
        id: 'log-1',
        userId: 'user-123',
        minutesSpent: 45,
        description: 'Configured OTLP exporter',
        loggedDate: '2026-10-01',
        createdAt: '2026-10-01T10:00:00Z',
      },
    ],
  };

  beforeEach(async () => {
    localStorage.clear();
    authServiceSpy = jasmine.createSpyObj('AuthService', [
      'currentUser',
      'logout',
      'isAdmin',
      'currentUserId',
    ]);
    authServiceSpy.isAdmin.and.returnValue(false);
    authServiceSpy.currentUserId.and.returnValue('user-123');
    authServiceSpy.currentUser.and.returnValue({
      sub: 'user-123',
      email: 'test@example.com',
      unique_name: 'test_user',
      role: 'User',
      exp: 9999999999,
      iat: 1000000000,
    });

    notificationServiceSpy = jasmine.createSpyObj('NotificationService', [
      'info',
      'success',
      'error',
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    taskServiceSpy = jasmine.createSpyObj('TaskService', [
      'getMy',
      'getAll',
      'getById',
      'create',
      'update',
      'assign',
      'submitForReview',
      'approve',
      'close',
      'logTime',
      'complete',
      'cancel',
      'getComments',
      'addComment',
      'deleteComment',
      'changePriority',
    ]);

    taskServiceSpy.getMy.and.returnValue(
      of({ items: mockTasks, page: 1, pageSize: 10, totalCount: mockTasks.length }),
    );
    taskServiceSpy.getAll.and.returnValue(
      of({ items: mockTasks, page: 1, pageSize: 10, totalCount: mockTasks.length }),
    );
    taskServiceSpy.getById.and.returnValue(of(mockDetails));
    taskServiceSpy.create.and.returnValue(of('new-task-id'));
    taskServiceSpy.assign.and.returnValue(of(void 0));
    taskServiceSpy.changePriority.and.returnValue(of(void 0));
    taskServiceSpy.submitForReview.and.returnValue(of(void 0));
    taskServiceSpy.approve.and.returnValue(of(void 0));
    taskServiceSpy.close.and.returnValue(of(void 0));
    taskServiceSpy.complete.and.returnValue(of(void 0));
    taskServiceSpy.cancel.and.returnValue(of(void 0));
    taskServiceSpy.logTime.and.returnValue(of(void 0));
    taskServiceSpy.getComments.and.returnValue(
      of({ items: [], page: 1, pageSize: 50, totalCount: 0 }),
    );
    taskServiceSpy.addComment.and.returnValue(of('new-comment-id'));
    taskServiceSpy.deleteComment.and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
        { provide: TaskService, useValue: taskServiceSpy },
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    routerSpy = router as unknown as jasmine.SpyObj<Router>;

    const wsService = TestBed.inject(WorkspaceService);
    workspaceService = wsService;
    wsService.selectWorkspace(mockWorkspace);
    spyOn(wsService, 'loadWorkspaces').and.returnValue(of([mockWorkspace]));
    spyOn(wsService, 'getMembers').and.returnValue(
      of({ items: [], page: 1, pageSize: 50, totalCount: 0 }),
    );
    spyOn(wsService, 'getPotentialMembers').and.returnValue(
      of({ items: [], page: 1, pageSize: 10, totalCount: 0 }),
    );
    spyOn(wsService, 'addMember').and.returnValue(of(void 0));
    spyOn(wsService, 'removeMember').and.returnValue(of(void 0));
    spyOn(wsService, 'update').and.returnValue(of(void 0));

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('Init_Should_LoadTasksAndComputeUserInitial_When_Created', () => {
    expect(component).toBeTruthy();
    expect(component.snapshot.userInitial).toBe('T');
    expect(taskServiceSpy.getAll).toHaveBeenCalledWith(1, 10, 'ws-arch-core');
    expect(taskServiceSpy.getMy).not.toHaveBeenCalled();
    expect(component.snapshot.tasks.length).toBe(2);
  });

  it('toggleDropdown_Should_ToggleDropdownState_When_Invoked', () => {
    expect(component.snapshot.dropdownOpen).toBeFalse();

    component['toggleDropdown']();
    expect(component.snapshot.dropdownOpen).toBeTrue();

    component['toggleDropdown']();
    expect(component.snapshot.dropdownOpen).toBeFalse();
  });

  it('closeDropdown_Should_SetDropdownOpenToFalse_When_Invoked', () => {
    component['toggleDropdown']();
    expect(component.snapshot.dropdownOpen).toBeTrue();

    component['closeDropdown']();
    expect(component.snapshot.dropdownOpen).toBeFalse();
  });

  it('onProfile_Should_CloseDropdownAndNavigateToProfile_When_Invoked', () => {
    component['toggleDropdown']();
    component['onProfile']();

    expect(component.snapshot.dropdownOpen).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/profile']);
  });

  it('onAdmin_Should_CloseDropdownAndNavigateToAdmin_When_Invoked', () => {
    component['toggleDropdown']();
    component['onAdmin']();

    expect(component.snapshot.dropdownOpen).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('onLogout_Should_NotifyAndCallAuthLogout_When_Invoked', () => {
    component['onLogout']();

    expect(notificationServiceSpy.info).toHaveBeenCalledWith('You have been signed out.');
    expect(authServiceSpy.logout).toHaveBeenCalled();
  });

  it('onDocumentClick_Should_CloseDropdown_When_ClickedOutside', () => {
    component['toggleDropdown']();
    expect(component.snapshot.dropdownOpen).toBeTrue();

    const outsideElement = document.createElement('div');
    const mouseEvent = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(mouseEvent, 'target', { value: outsideElement });

    component['onDocumentClick'](mouseEvent);
    expect(component.snapshot.dropdownOpen).toBeFalse();
  });

  it('switchViewMode_Should_UpdateModeAndReloadTasks_When_Called', () => {
    component['switchViewMode']('my-tasks');

    expect(component.snapshot.viewMode).toBe('my-tasks');
    expect(taskServiceSpy.getMy).toHaveBeenCalledWith('all', 1, 10, 'ws-arch-core');
  });

  it('setActiveTab_Should_EnsureAllTasksCalledWithWorkspaceId_When_EnteringBoard', () => {
    component['switchViewMode']('my-tasks');
    taskServiceSpy.getAll.calls.reset();

    component['setActiveTab']('board');

    expect(component.snapshot.activeTab).toBe('board');
    expect(component.snapshot.viewMode).toBe('all-tasks');
    expect(taskServiceSpy.getAll).toHaveBeenCalledWith(1, 10, 'ws-arch-core');
  });

  it('setMyFilterType_Should_UpdateFilterAndReload_When_Called', () => {
    component['setMyFilterType']('assigned');

    expect(component.snapshot.myFilterType).toBe('assigned');
    expect(taskServiceSpy.getMy).toHaveBeenCalledWith('assigned', 1, 10, 'ws-arch-core');
  });

  it('filterTasks_Should_FilterTasksByQueryStatusAndPriority_When_FiltersChanged', (done) => {
    component['setStatusFilter']('InProgress');
    component['setPriorityFilter']('High');
    component['onSearchChange']('OTLP');

    component.filteredTasks$.subscribe((tasks) => {
      expect(tasks.length).toBe(1);
      expect(tasks[0].id).toBe('task-1');
      done();
    });
  });

  it('filterTasks_Should_FilterTasksByTaskNumber_When_NumberQueryProvided', (done) => {
    component['setStatusFilter']('ALL');
    component['setPriorityFilter']('ALL');
    component['onSearchChange']('DMS-2');

    component.filteredTasks$.subscribe((tasks) => {
      expect(tasks.length).toBe(1);
      expect(tasks[0].id).toBe('task-2');
      expect(tasks[0].number).toBe('DMS-2');
      done();
    });
  });

  it('filterTasks_Should_NotThrowAndMatchQuery_When_TaskNumberIsNumeric', (done) => {
    const numericTask = { ...mockTasks[0], number: 42 as unknown as string };
    component['updateState']({ tasks: [numericTask], searchQuery: '42' });

    component.filteredTasks$.subscribe((tasks) => {
      expect(tasks.length).toBe(1);
      expect(tasks[0].id).toBe('task-1');
      done();
    });
  });

  it('onSelectTask_Should_FetchDetailsAndOpenBlade_When_Invoked', () => {
    component['onSelectTask'](mockTasks[0]);

    expect(taskServiceSpy.getById).toHaveBeenCalledWith('task-1');
    expect(component.snapshot.isBladeOpen).toBeTrue();
    expect(component.snapshot.selectedTask?.id).toBe('task-1');
    expect(component.snapshot.selectedTask?.timeLogs.length).toBe(1);

    component['closeBlade']();
    expect(component.snapshot.isBladeOpen).toBeFalse();
    expect(component.snapshot.selectedTask).toBeNull();
  });

  it('openCreateModal_Should_OpenModal_When_Called', () => {
    component['openCreateModal']();

    expect(component.snapshot.isCreateModalOpen).toBeTrue();

    component['closeCreateModal']();
    expect(component.snapshot.isCreateModalOpen).toBeFalse();
  });

  it('EmptyColumnButton_Should_OpenCreateModal_When_Clicked', () => {
    const emptyBtn = fixture.nativeElement.querySelector('#btn-add-item-inreview');
    expect(emptyBtn).toBeTruthy();

    emptyBtn.click();
    fixture.detectChanges();

    expect(component.snapshot.isCreateModalOpen).toBeTrue();
  });

  it('onCreateTaskSubmit_Should_CreateTaskAndReload_When_PayloadIsValid', () => {
    component['openCreateModal']();
    const payload: CreateTaskPayload = {
      title: 'New Integration Test',
      description: 'Write integration test with WebApplicationFactory',
      priority: 'High',
      deadline: '2026-10-15',
      tags: ['Test', 'Backend'],
      assigneeId: null,
    };

    component['onCreateTaskSubmit'](payload);

    expect(taskServiceSpy.create).toHaveBeenCalledWith(
      jasmine.objectContaining({
        workspaceId: 'ws-arch-core',
        title: 'New Integration Test',
        tags: ['Test', 'Backend'],
      }),
    );
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Task created successfully.');
    expect(component.snapshot.isCreateModalOpen).toBeFalse();
  });

  it('onOpenCreateAssigneeDialog_Should_OpenDialogAndComputeAnchorPosition_When_TriggerClicked', () => {
    const wsService = TestBed.inject(WorkspaceService);
    component['openCreateModal']();
    const mockEvent = {
      stopPropagation: jasmine.createSpy('stopPropagation'),
      currentTarget: {
        getBoundingClientRect: () => ({
          top: 200,
          bottom: 232,
          left: 150,
          right: 300,
          width: 150,
          height: 32,
        }),
      },
    } as unknown as MouseEvent;

    component['onOpenCreateAssigneeDialog'](mockEvent);

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(component.snapshot.isAssignUserDialogOpen).toBeTrue();
    expect(component.snapshot.taskToAssign).toBeNull();
    expect(component.snapshot.assignDropdownPosition).toEqual({ top: 238, left: 150 });
    expect(wsService.getMembers).toHaveBeenCalledWith('ws-arch-core', '', 1, 3);
  });

  it('onClearCreateAssignee_Should_ResetAssignee_When_Invoked', () => {
    component['openCreateModal']();
    component['selectedCreateAssignee'] = {
      id: 'member-10',
      userName: 'john_doe',
      fullName: 'John Doe',
      email: 'john@test.com',
    };

    const mockEvent = {
      stopPropagation: jasmine.createSpy('stopPropagation'),
    } as unknown as MouseEvent;
    component['onClearCreateAssignee'](mockEvent);

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(component['selectedCreateAssignee']).toBeNull();
  });

  it('onUserSelectedForAssignment_Should_SetCreateAssigneeAndCloseDialog_When_CreateModalOpenAndNoTaskToAssign', () => {
    component['openCreateModal']();
    component['updateState']({ isAssignUserDialogOpen: true, taskToAssign: null });

    const member = {
      id: 'member-55',
      userName: 'sarah_connor',
      fullName: 'Sarah Connor',
      email: 'sarah@test.com',
    };

    component['onUserSelectedForAssignment'](member);

    expect(component['selectedCreateAssignee']).toEqual(member);
    expect(component.snapshot.isAssignUserDialogOpen).toBeFalse();
    expect(taskServiceSpy.assign).not.toHaveBeenCalled();
  });

  it('onCreateTaskSubmit_Should_IncludeAssigneeIdInRequest_When_AssigneeSelected', () => {
    component['openCreateModal']();
    component['selectedCreateAssignee'] = {
      id: 'user-77',
      userName: 'developer',
      fullName: 'Lead Developer',
      email: 'dev@test.com',
    };
    const payload: CreateTaskPayload = {
      title: 'Task with Assignee',
      description: 'Check assignee is forwarded',
      priority: 'High',
      deadline: '2026-11-01',
      tags: ['Assignment'],
      assigneeId: 'user-77',
    };

    component['onCreateTaskSubmit'](payload);

    expect(taskServiceSpy.create).toHaveBeenCalledWith(
      jasmine.objectContaining({
        workspaceId: 'ws-arch-core',
        title: 'Task with Assignee',
        assigneeId: 'user-77',
      }),
    );
    expect(component['selectedCreateAssignee']).toBeNull();
  });

  it('openCreateModal_Should_ResetSelectedCreateAssignee_When_Called', () => {
    component['selectedCreateAssignee'] = {
      id: 'user-99',
      userName: 'old_assignee',
      fullName: 'Old Assignee',
      email: 'old@test.com',
    };

    component['openCreateModal']();

    expect(component['selectedCreateAssignee']).toBeNull();
  });

  it('closeCreateModal_Should_ResetSelectedCreateAssigneeAndCloseAssignDialog_When_Called', () => {
    component['openCreateModal']();
    component['updateState']({ isAssignUserDialogOpen: true, taskToAssign: null });
    component['selectedCreateAssignee'] = {
      id: 'user-99',
      userName: 'assignee',
      fullName: 'Assignee',
      email: 'a@test.com',
    };

    component['closeCreateModal']();

    expect(component['selectedCreateAssignee']).toBeNull();
    expect(component.snapshot.isCreateModalOpen).toBeFalse();
    expect(component.snapshot.isAssignUserDialogOpen).toBeFalse();
  });

  it('onDetailsAssign_Should_OpenAssignUserDialogAndFetchMembers_When_Invoked', () => {
    const wsService = TestBed.inject(WorkspaceService);
    component['updateState']({
      selectedTask: {
        id: 'task-1',
        workspaceId: 'ws-arch-core',
        title: 'Task 1',
        status: 'Todo',
        priority: 'High',
      } as any,
    });
    component['onDetailsAssign']();

    expect(component.snapshot.isAssignUserDialogOpen).toBeTrue();
    expect(component.snapshot.assignUserSearch).toBe('');
    expect(component.snapshot.assignUserPage).toBe(1);
    expect(wsService.getMembers).toHaveBeenCalledWith('ws-arch-core', '', 1, 3);
  });

  it('onDetailsAssign_Should_ComputeAnchorPosition_When_EventPassed', () => {
    component['updateState']({
      selectedTask: {
        id: 'task-1',
        workspaceId: 'ws-arch-core',
        title: 'Task 1',
        status: 'Todo',
        priority: 'High',
      } as any,
    });
    const mockEvent = {
      currentTarget: {
        getBoundingClientRect: () => ({
          top: 50,
          bottom: 80,
          left: 400,
          right: 480,
          width: 80,
          height: 30,
        }),
      },
    } as unknown as MouseEvent;

    component['onDetailsAssign'](mockEvent);

    expect(component.snapshot.assignDropdownPosition).toEqual({ top: 86, left: 400 });
  });

  it('onBoardAssign_Should_OpenAssignUserDialogWithAnchorPosition_When_Invoked', () => {
    const wsService = TestBed.inject(WorkspaceService);
    const mockEvent = {
      stopPropagation: jasmine.createSpy('stopPropagation'),
      currentTarget: {
        getBoundingClientRect: () => ({
          top: 100,
          bottom: 130,
          left: 200,
          right: 230,
          width: 30,
          height: 30,
        }),
      },
    } as unknown as MouseEvent;

    component['onBoardAssign'](mockTasks[0], mockEvent);

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(component.snapshot.isAssignUserDialogOpen).toBeTrue();
    expect(component.snapshot.taskToAssign).toEqual(mockTasks[0]);
    expect(component.snapshot.assignDropdownPosition).toEqual({ top: 136, left: 200 });
    expect(wsService.getMembers).toHaveBeenCalledWith('ws-arch-core', '', 1, 3);
  });

  it('onAssignUserSearchChange_Should_UpdateSearchTermAndFetchMembers_When_Invoked', () => {
    const wsService = TestBed.inject(WorkspaceService);
    component['onAssignUserSearchChange']('developer');

    expect(component.snapshot.assignUserSearch).toBe('developer');
    expect(component.snapshot.assignUserPage).toBe(1);
    expect(wsService.getMembers).toHaveBeenCalledWith('ws-arch-core', 'developer', 1, 3);
  });

  it('onAssignUserPageChange_Should_UpdatePageAndFetchMembers_When_Invoked', () => {
    const wsService = TestBed.inject(WorkspaceService);
    (wsService.getMembers as jasmine.Spy).and.returnValue(
      of({ items: [], page: 2, pageSize: 3, totalCount: 5 }),
    );
    component['updateState']({ assignUserSearch: 'developer' });
    component['onAssignUserPageChange'](2);

    expect(component.snapshot.assignUserPage).toBe(2);
    expect(wsService.getMembers).toHaveBeenCalledWith('ws-arch-core', 'developer', 2, 3);
  });

  it('onCloseAssignUserDialog_Should_CloseDialogAndResetSearch_When_Invoked', () => {
    component['updateState']({
      isAssignUserDialogOpen: true,
      assignUserSearch: 'abc',
      assignUserPage: 2,
      assignUserTotalCount: 5,
    });
    component['onCloseAssignUserDialog']();

    expect(component.snapshot.isAssignUserDialogOpen).toBeFalse();
    expect(component.snapshot.assignUserSearch).toBe('');
    expect(component.snapshot.assignUserPage).toBe(1);
    expect(component.snapshot.assignUserTotalCount).toBe(0);
  });

  it('loadAssignableMembers_Should_PopulateAssignableUsers_When_ServiceReturnsMembers', () => {
    const wsService = TestBed.inject(WorkspaceService);
    const mockMember = {
      id: 'user-99',
      userId: 'user-99',
      userName: 'dev_user',
      fullName: 'Dev User',
      email: 'dev@test.com',
      isOwner: false,
    };
    (wsService.getMembers as jasmine.Spy).and.returnValue(
      of({ items: [mockMember], page: 1, pageSize: 3, totalCount: 1 }),
    );

    component['loadAssignableMembers'](1, 'dev');

    expect(component.snapshot.assignableUsers).toEqual([mockMember]);
    expect(component.snapshot.assignUserPage).toBe(1);
    expect(component.snapshot.assignUserTotalCount).toBe(1);
    expect(component.snapshot.isAssignUsersLoading).toBeFalse();
  });

  it('onUserSelectedForAssignment_Should_CallTaskServiceAssign_When_UserSelected', () => {
    component['onSelectTask'](mockTasks[0]);
    component['onUserSelectedForAssignment']({
      id: 'user-2',
      userName: 'alice',
      fullName: 'Alice Smith',
      email: 'alice@test.com',
    });

    expect(taskServiceSpy.assign).toHaveBeenCalledWith('task-1', 'user-2');
    expect(notificationServiceSpy.success).toHaveBeenCalledWith(
      'Assigned to Alice Smith and moved to In Progress.',
    );
    expect(component.snapshot.isAssignUserDialogOpen).toBeFalse();
  });

  it('onCompleteTask_Should_CallTaskServiceComplete_When_Called', () => {
    component['onSelectTask'](mockTasks[0]);
    component['onCompleteTask'](mockTasks[0]);

    expect(taskServiceSpy.complete).toHaveBeenCalledWith('task-1');
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Task completed successfully.');
    const updated = component.snapshot.tasks.find((t) => t.id === 'task-1');
    expect(updated?.status).toBe('Done');
    expect(component.snapshot.selectedTask).toBeNull();
    expect(component.snapshot.isBladeOpen).toBeFalse();
  });

  it('onCompleteTask_Should_NotUpdateStatusOrNotifySuccess_When_ApiFails', () => {
    taskServiceSpy.complete.and.returnValue(throwError(() => new Error('API failure')));
    component['onSelectTask'](mockTasks[0]);
    component['onCompleteTask'](mockTasks[0]);

    expect(taskServiceSpy.complete).toHaveBeenCalledWith('task-1');
    expect(notificationServiceSpy.success).not.toHaveBeenCalled();
    const updated = component.snapshot.tasks.find((t) => t.id === 'task-1');
    expect(updated?.status).toBe('InProgress');
    expect(component.snapshot.selectedTask?.status).toBe('InProgress');
    expect(component.snapshot.isBladeOpen).toBeTrue();
  });

  it('onCancelTask_Should_CallTaskServiceCancel_When_Called', () => {
    component['onSelectTask'](mockTasks[0]);
    component['onCancelTask'](mockTasks[0]);

    expect(taskServiceSpy.cancel).toHaveBeenCalledWith('task-1');
    expect(notificationServiceSpy.info).toHaveBeenCalledWith('Task cancelled.');
    const updated = component.snapshot.tasks.find((t) => t.id === 'task-1');
    expect(updated?.status).toBe('Cancelled');
    expect(component.snapshot.selectedTask).toBeNull();
    expect(component.snapshot.isBladeOpen).toBeFalse();
  });

  it('onCancelTask_Should_NotUpdateStatusOrNotifyInfo_When_ApiFails', () => {
    taskServiceSpy.cancel.and.returnValue(throwError(() => new Error('API failure')));
    component['onSelectTask'](mockTasks[0]);
    component['onCancelTask'](mockTasks[0]);

    expect(taskServiceSpy.cancel).toHaveBeenCalledWith('task-1');
    expect(notificationServiceSpy.info).not.toHaveBeenCalled();
    const updated = component.snapshot.tasks.find((t) => t.id === 'task-1');
    expect(updated?.status).toBe('InProgress');
    expect(component.snapshot.selectedTask?.status).toBe('InProgress');
    expect(component.snapshot.isBladeOpen).toBeTrue();
  });

  it('onLogTimeSubmit_Should_LogTimeAndCloseModal_When_Valid', () => {
    component['onSelectTask'](mockTasks[0]);
    component['openLogTimeModal'](mockTasks[0]);
    expect(component.snapshot.isLogTimeModalOpen).toBeTrue();
    expect(component.snapshot.taskForTimeLog?.id).toBe('task-1');

    const payload: LogTimePayload = {
      minutesSpent: 90,
      description: 'Wrote unit tests',
      loggedDate: '2026-10-01',
    };

    component['onLogTimeSubmit'](payload);

    expect(taskServiceSpy.logTime).toHaveBeenCalledWith('task-1', {
      minutesSpent: 90,
      description: 'Wrote unit tests',
      loggedDate: '2026-10-01',
    });
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Logged 90 minutes.');
    expect(component.snapshot.isLogTimeModalOpen).toBeFalse();
    expect(taskServiceSpy.getById).toHaveBeenCalledWith('task-1');
  });

  it('onLogTimeSubmit_Should_NotCloseModalOrNotifySuccess_When_ApiFails', () => {
    taskServiceSpy.logTime.and.returnValue(throwError(() => new Error('API failure')));
    component['openLogTimeModal'](mockTasks[0]);
    expect(component.snapshot.isLogTimeModalOpen).toBeTrue();

    const payload: LogTimePayload = {
      minutesSpent: 90,
      description: 'Wrote unit tests',
      loggedDate: '2026-10-01',
    };

    component['onLogTimeSubmit'](payload);

    expect(taskServiceSpy.logTime).toHaveBeenCalledWith('task-1', {
      minutesSpent: 90,
      description: 'Wrote unit tests',
      loggedDate: '2026-10-01',
    });
    expect(notificationServiceSpy.success).not.toHaveBeenCalled();
    expect(component.snapshot.isLogTimeModalOpen).toBeTrue();
  });

  it('onEscape_Should_CloseOpenModalsOrBladePriorToDropdown_When_Invoked', () => {
    // 1. Create Modal
    component['openCreateModal']();
    expect(component.snapshot.isCreateModalOpen).toBeTrue();
    component['onEscape']();
    expect(component.snapshot.isCreateModalOpen).toBeFalse();

    // 2. Log Time Modal
    component['openLogTimeModal'](mockTasks[0]);
    expect(component.snapshot.isLogTimeModalOpen).toBeTrue();
    component['onEscape']();
    expect(component.snapshot.isLogTimeModalOpen).toBeFalse();

    // 3. Blade
    component['onSelectTask'](mockTasks[0]);
    expect(component.snapshot.isBladeOpen).toBeTrue();
    component['onEscape']();
    expect(component.snapshot.isBladeOpen).toBeFalse();

    // 4. Dropdown
    component['toggleDropdown']();
    expect(component.snapshot.dropdownOpen).toBeTrue();
    component['onEscape']();
    expect(component.snapshot.dropdownOpen).toBeFalse();
  });

  it('loadTasks_Should_HandleError_When_TaskServiceFails', () => {
    taskServiceSpy.getAll.and.returnValue(throwError(() => new Error('Service down')));

    component['loadTasks']();

    expect(component.snapshot.tasks).toEqual([]);
    expect(component.snapshot.loading).toBeFalse();
  });

  it('loadTasks_Should_NotMakeHttpCall_When_NoWorkspaceSelected', () => {
    taskServiceSpy.getMy.calls.reset();
    taskServiceSpy.getAll.calls.reset();

    component['updateState']({ selectedWorkspace: null });
    const wsService = TestBed.inject(WorkspaceService);
    spyOnProperty(wsService, 'currentWorkspace', 'get').and.returnValue(null);

    component['loadTasks']();

    expect(taskServiceSpy.getMy).not.toHaveBeenCalled();
    expect(taskServiceSpy.getAll).not.toHaveBeenCalled();
    expect(component.snapshot.loading).toBeFalse();
    expect(component.snapshot.tasks).toEqual([]);
  });

  it('setLayoutMode_Should_UpdateLayoutMode_When_Invoked', () => {
    expect(component.snapshot.layoutMode).toBe('board');
    component['setLayoutMode']('list');
    expect(component.snapshot.layoutMode).toBe('list');
    component['setLayoutMode']('board');
    expect(component.snapshot.layoutMode).toBe('board');
  });

  it('columns$_Should_GroupTasksByStatus_When_Subscribed', (done) => {
    component.columns$.subscribe((columns) => {
      expect(columns.length).toBe(5);
      const todoCol = columns.find((c) => c.status === 'Todo');
      const inProgressCol = columns.find((c) => c.status === 'InProgress');
      expect(todoCol?.count).toBe(1);
      expect(inProgressCol?.count).toBe(1);
      done();
    });
  });

  it('onDetailsSubmitForReview_Should_CallTaskServiceSubmitForReview_When_SelectedTaskPresent', () => {
    component['onSelectTask'](mockTasks[0]);
    component['onDetailsSubmitForReview']();

    expect(taskServiceSpy.submitForReview).toHaveBeenCalledWith('task-1');
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Task submitted for review.');
  });

  it('openLogTimeForSelected_Should_OpenModal_When_SelectedTaskPresent', () => {
    component['onSelectTask'](mockTasks[0]);
    component['openLogTimeForSelected']();

    expect(component.snapshot.isLogTimeModalOpen).toBeTrue();
    expect(component.snapshot.taskForTimeLog?.id).toBe('task-1');
  });

  it('onDetailsApprove_Should_CallTaskServiceApprove_When_SelectedTaskPresent', () => {
    component['onSelectTask'](mockTasks[0]);
    component['onDetailsApprove']();

    expect(taskServiceSpy.approve).toHaveBeenCalledWith('task-1');
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Task approved and completed.');
  });

  it('onDetailsClose_Should_CallTaskServiceClose_When_SelectedTaskPresent', () => {
    component['onSelectTask'](mockTasks[0]);
    component['onDetailsClose']();

    expect(taskServiceSpy.close).toHaveBeenCalledWith('task-1');
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Task closed.');
  });

  it('onDetailsCancel_Should_CancelSelectedTask_When_Invoked', () => {
    component['onSelectTask'](mockTasks[0]);
    component['onDetailsCancel']();

    expect(taskServiceSpy.cancel).toHaveBeenCalledWith('task-1');
    expect(component.snapshot.isBladeOpen).toBeFalse();
    expect(component.snapshot.selectedTask).toBeNull();
  });

  it('onDetailsChangePriority_Should_CallTaskServiceChangePriority_When_SelectedTaskPresent', () => {
    component['onSelectTask'](mockTasks[0]);
    component['onDetailsChangePriority']('High');

    expect(taskServiceSpy.changePriority).toHaveBeenCalledWith('task-1', 'High');
    expect(notificationServiceSpy.success).toHaveBeenCalledWith('Priority updated to High.');
  });

  it('setActiveTab_Should_UpdateActiveTabAndLayoutMode_When_Invoked', () => {
    expect(component.snapshot.activeTab).toBe('board');
    expect(component.snapshot.layoutMode).toBe('board');

    component['setActiveTab']('list');
    expect(component.snapshot.activeTab).toBe('list');
    expect(component.snapshot.layoutMode).toBe('list');

    component['setActiveTab']('statistics');
    expect(component.snapshot.activeTab).toBe('statistics');

    component['setActiveTab']('settings');
    expect(component.snapshot.activeTab).toBe('settings');

    component['setActiveTab']('board');
    expect(component.snapshot.activeTab).toBe('board');
    expect(component.snapshot.layoutMode).toBe('board');
  });

  it('setActiveTab_Should_PopulateFormAndLoadMembers_When_SettingsTabSelected', () => {
    (workspaceService.getMembers as jasmine.Spy).calls.reset();
    component['setActiveTab']('settings');

    expect(component.snapshot.activeTab).toBe('settings');
    expect(component['workspaceSettingsForm'].value).toEqual({
      name: 'Architecture Lab Core',
      description: 'Clean architecture microservices',
    });
    expect(workspaceService.getMembers).toHaveBeenCalledWith('ws-arch-core', '', 1, 5);
  });

  it('SettingsTab_Should_RenderSettingsLayoutInDOM_When_ActiveTabIsSettings', () => {
    component['setActiveTab']('settings');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const settingsBtn = compiled.querySelector('#tab-settings');
    expect(settingsBtn).toBeTruthy();
    expect(settingsBtn?.classList.contains('active')).toBeTrue();

    const settingsContainer = compiled.querySelector('#workspace-settings-view');
    expect(settingsContainer).toBeTruthy();

    const nameInput = compiled.querySelector('#settings-workspace-name') as HTMLInputElement;
    expect(nameInput).toBeTruthy();
    expect(nameInput.value).toBe('Architecture Lab Core');

    const descInput = compiled.querySelector(
      '#settings-workspace-description',
    ) as HTMLTextAreaElement;
    expect(descInput).toBeTruthy();
    expect(descInput.value).toBe('Clean architecture microservices');

    const saveBtn = compiled.querySelector('#btn-save-workspace-settings');
    expect(saveBtn).toBeTruthy();

    const discardBtn = compiled.querySelector('#btn-discard-workspace-settings');
    expect(discardBtn).toBeTruthy();
  });

  it('onSaveWorkspaceSettings_Should_CallUpdateServiceAndShowSuccess_When_FormIsValid', () => {
    component['setActiveTab']('settings');
    component['workspaceSettingsForm'].setValue({
      name: 'Updated Workspace Name',
      description: 'Updated Workspace Description',
    });

    component['onSaveWorkspaceSettings']();

    expect(workspaceService.update).toHaveBeenCalledWith('ws-arch-core', {
      name: 'Updated Workspace Name',
      description: 'Updated Workspace Description',
    });
    expect(notificationServiceSpy.success).toHaveBeenCalledWith(
      'Workspace settings updated successfully.',
    );
    expect(component.snapshot.savingSettings).toBeFalse();
    expect(component.snapshot.selectedWorkspace?.name).toBe('Updated Workspace Name');
    expect(component.snapshot.selectedWorkspace?.description).toBe('Updated Workspace Description');
    expect(component.snapshot.selectedWorkspace?.code).toBe('UPDA');
  });

  it('onSaveWorkspaceSettings_Should_SetSavingFalseAndShowError_When_UpdateFails', () => {
    (workspaceService.update as jasmine.Spy).and.returnValue(
      throwError(() => ({ error: { message: 'Unauthorized modification' } })),
    );

    component['setActiveTab']('settings');
    component['workspaceSettingsForm'].setValue({
      name: 'Forbidden Update',
      description: 'Forbidden Desc',
    });

    component['onSaveWorkspaceSettings']();

    expect(component.snapshot.savingSettings).toBeFalse();
    expect(notificationServiceSpy.error).toHaveBeenCalledWith('Unauthorized modification');
  });

  it('onDiscardWorkspaceSettings_Should_ResetFormToOriginalValues_When_DiscardClicked', () => {
    component['setActiveTab']('settings');
    component['workspaceSettingsForm'].setValue({
      name: 'Temporary Unsaved Name',
      description: 'Temporary Unsaved Description',
    });

    component['onDiscardWorkspaceSettings']();

    expect(component['workspaceSettingsForm'].value).toEqual({
      name: 'Architecture Lab Core',
      description: 'Clean architecture microservices',
    });
  });

  it('toggleSettingsSection_Should_ToggleAccordionSections_When_Called', () => {
    expect(component['isSettingsSectionExpanded']('general')).toBeTrue();
    component['toggleSettingsSection']('general');
    expect(component['isSettingsSectionExpanded']('general')).toBeFalse();
    component['toggleSettingsSection']('general');
    expect(component['isSettingsSectionExpanded']('general')).toBeTrue();

    expect(component['isSettingsSectionExpanded']('members')).toBeTrue();
    component['toggleSettingsSection']('members');
    expect(component['isSettingsSectionExpanded']('members')).toBeFalse();
  });

  it('onSettingsMembersPageChange_Should_UpdatePageAndCallGetMembers_When_PageChanged', () => {
    (workspaceService.getMembers as jasmine.Spy).calls.reset();
    component['onSettingsMembersPageChange'](2);

    expect(component.snapshot.settingsMembersPage).toBe(2);
    expect(workspaceService.getMembers).toHaveBeenCalledWith('ws-arch-core', '', 2, 5);
  });

  it('resetFilters_Should_ResetAllFiltersToDefault_When_Invoked', () => {
    component['setStatusFilter']('InProgress');
    component['setPriorityFilter']('High');
    component['onSearchChange']('OTLP');

    expect(component.snapshot.statusFilter).toBe('InProgress');
    expect(component.snapshot.priorityFilter).toBe('High');
    expect(component.snapshot.searchQuery).toBe('OTLP');

    component['resetFilters']();

    expect(component.snapshot.statusFilter).toBe('ALL');
    expect(component.snapshot.priorityFilter).toBe('ALL');
    expect(component.snapshot.searchQuery).toBe('');
  });

  it('stats$_Should_ComputeAccurateAggregationsAndCompletionRate_When_Subscribed', (done) => {
    component.stats$.subscribe((stats) => {
      expect(stats.totalScope).toBe(2);
      expect(stats.total).toBe(2);
      expect(stats.todo).toBe(1);
      expect(stats.inProgress).toBe(1);
      expect(stats.inReview).toBe(0);
      expect(stats.done).toBe(0);
      expect(stats.cancelled).toBe(0);
      expect(stats.high).toBe(1);
      expect(stats.low).toBe(1);
      expect(stats.completionRate).toBe(0);
      done();
    });
  });

  it('onWorkspaceChange_Should_SelectWorkspaceViaService_When_Triggered', () => {
    const workspaceService = TestBed.inject(WorkspaceService);
    const selectSpy = spyOn(workspaceService, 'selectWorkspace').and.callThrough();

    const targetWs: Workspace = {
      ...mockWorkspace,
      id: 'ws-frontend-web',
      name: 'Frontend Web Portal',
    };
    component['onWorkspaceChange'](targetWs);

    expect(selectSpy).toHaveBeenCalledWith(targetWs);
    expect(notificationServiceSpy.info).toHaveBeenCalledWith(
      `Switched active workspace to: ${targetWs.name}`,
    );
  });

  it('onWorkspaces_Should_CloseDropdownAndNavigateToWorkspaces', () => {
    component['onWorkspaces']();

    expect(component.snapshot.dropdownOpen).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/workspaces']);
  });

  it('onWorkspaces_Should_CloseDropdownAndNavigateToAdmin_When_UserIsAdmin', () => {
    authServiceSpy.isAdmin.and.returnValue(true);
    component['onWorkspaces']();

    expect(component.snapshot.dropdownOpen).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin']);
  });

  it('workspaceBreadcrumbRoute_Should_ReturnAdmin_When_UserIsAdmin', () => {
    authServiceSpy.isAdmin.and.returnValue(true);
    expect(component.workspaceBreadcrumbRoute).toBe('/admin');
  });

  it('workspaceBreadcrumbRoute_Should_ReturnWorkspaces_When_UserIsNotAdmin', () => {
    authServiceSpy.isAdmin.and.returnValue(false);
    expect(component.workspaceBreadcrumbRoute).toBe('/workspaces');
  });

  it('Loading_Should_DisplaySkeletonTaskCards_When_LoadingIsTrueAndBoardTabActive', () => {
    component['updateState']({ loading: true, activeTab: 'board' });
    fixture.detectChanges();

    const skeletonCards = fixture.nativeElement.querySelectorAll('.skeleton-task-card');
    expect(skeletonCards.length).toBeGreaterThan(0);
  });

  it('Loading_Should_DisplaySkeletonTableRows_When_LoadingIsTrueAndListTabActive', () => {
    component['updateState']({ loading: true, activeTab: 'list' });
    fixture.detectChanges();

    const skeletonRows = fixture.nativeElement.querySelectorAll('.skeleton-table-row');
    expect(skeletonRows.length).toBe(5);
  });

  describe('Assignee Avatar & Tooltip', () => {
    it('isTaskAssigned_Should_ReturnTrue_When_TaskHasAssigneeOrAssigneeId', () => {
      expect(component.isTaskAssigned(mockTasks[0])).toBeTrue();
    });

    it('isTaskAssigned_Should_ReturnFalse_When_TaskHasNoAssignee', () => {
      expect(component.isTaskAssigned(mockTasks[1])).toBeFalse();
    });

    it('getAssigneeTooltip_Should_ReturnUsername_When_TaskIsAssigned', () => {
      expect(component.getAssigneeTooltip(mockTasks[0])).toBe('alex_dev');
    });

    it('getAssigneeTooltip_Should_ReturnUnassigned_When_TaskIsNotAssigned', () => {
      expect(component.getAssigneeTooltip(mockTasks[1])).toBe('Unassigned');
    });

    it('getAssigneeInitial_Should_ReturnFirstLetterUppercase_When_TaskIsAssigned', () => {
      expect(component.getAssigneeInitial(mockTasks[0])).toBe('A');
    });

    it('getAssigneeInitial_Should_ReturnFallback_When_NoUsernameFound', () => {
      const taskWithoutUser: TaskResult = {
        ...mockTasks[1],
        assignee: null,
      };
      expect(component.getAssigneeInitial(taskWithoutUser)).toBe('?');
    });

    it('DOM_Should_RenderAssigneeAvatarWithInitialAndTooltip_When_TaskIsAssigned', () => {
      component['updateState']({ loading: false, tasks: [mockTasks[0]], activeTab: 'board' });
      fixture.detectChanges();

      const avatarEl = fixture.nativeElement.querySelector('.card-assignee-avatar');
      expect(avatarEl).toBeTruthy();
      expect(avatarEl.classList.contains('unassigned')).toBeFalse();
      expect(avatarEl.textContent.trim()).toBe('A');

      const tooltipEl = fixture.nativeElement.querySelector('app-tooltip');
      expect(tooltipEl).toBeTruthy();
      expect(avatarEl.getAttribute('aria-label')).toBe('alex_dev');
    });

    it('DOM_Should_RenderHumanIconWithUnassignedTooltip_When_TaskIsUnassigned', () => {
      component['updateState']({ loading: false, tasks: [mockTasks[1]], activeTab: 'board' });
      fixture.detectChanges();

      const avatarEl = fixture.nativeElement.querySelector('.card-assignee-avatar');
      expect(avatarEl).toBeTruthy();
      expect(avatarEl.classList.contains('unassigned')).toBeTrue();

      const humanIcon = avatarEl.querySelector('.avatar-human-icon');
      expect(humanIcon).toBeTruthy();

      const tooltipEl = fixture.nativeElement.querySelector('app-tooltip');
      expect(tooltipEl).toBeTruthy();
      expect(avatarEl.getAttribute('aria-label')).toBe('Unassigned');
    });
  });

  describe('Add Workspace Member Flow', () => {
    it('canManageWorkspaceMembers_Should_ReturnTrueForOwnerAndAdmin_AndFalseForContributor', () => {
      component['updateState']({
        selectedWorkspace: mockWorkspace,
      });
      expect(component.canManageWorkspaceMembers).toBeTrue();

      component['updateState']({
        selectedWorkspace: { ...mockWorkspace, role: 'Contributor', ownerId: 'other-user' },
      });
      expect(component.canManageWorkspaceMembers).toBeFalse();

      authServiceSpy.isAdmin.and.returnValue(true);
      expect(component.canManageWorkspaceMembers).toBeTrue();
    });

    it('onOpenAddMemberDialog_Should_OpenDialogAndFetchPotentialMembers_When_Invoked', () => {
      const mockEvent = {
        currentTarget: {
          getBoundingClientRect: () => ({ bottom: 100, left: 200, top: 70, right: 300 }),
        },
      } as unknown as MouseEvent;

      component['onOpenAddMemberDialog'](mockEvent);

      expect(component.snapshot.isAddMemberDialogOpen).toBeTrue();
      expect(component.snapshot.potentialMembersSearch).toBe('');
      expect(component.snapshot.potentialMembersPage).toBe(1);
      expect(workspaceService.getPotentialMembers).toHaveBeenCalledWith('ws-arch-core', '', 1, 10);
    });

    it('onCloseAddMemberDialog_Should_CloseDialogAndResetState_When_Invoked', () => {
      component['updateState']({
        isAddMemberDialogOpen: true,
        potentialMembersSearch: 'user',
        potentialMembersPage: 3,
        potentialMembersTotalCount: 15,
      });

      component['onCloseAddMemberDialog']();

      expect(component.snapshot.isAddMemberDialogOpen).toBeFalse();
      expect(component.snapshot.potentialMembersSearch).toBe('');
      expect(component.snapshot.potentialMembersPage).toBe(1);
      expect(component.snapshot.potentialMembersTotalCount).toBe(0);
    });

    it('onAddMemberSearchChange_Should_UpdateSearchAndTriggerPotentialMembersLoad', () => {
      component['onAddMemberSearchChange']('carol');

      expect(component.snapshot.potentialMembersSearch).toBe('carol');
      expect(component.snapshot.potentialMembersPage).toBe(1);
      expect(workspaceService.getPotentialMembers).toHaveBeenCalledWith(
        'ws-arch-core',
        'carol',
        1,
        10,
      );
    });

    it('onAddMemberPageChange_Should_UpdatePageAndTriggerPotentialMembersLoad', () => {
      (workspaceService.getPotentialMembers as jasmine.Spy).and.returnValue(
        of({ items: [], page: 2, pageSize: 10, totalCount: 20 }),
      );
      component['updateState']({ potentialMembersSearch: 'dave' });
      component['onAddMemberPageChange'](2);

      expect(component.snapshot.potentialMembersPage).toBe(2);
      expect(workspaceService.getPotentialMembers).toHaveBeenCalledWith(
        'ws-arch-core',
        'dave',
        2,
        10,
      );
    });

    it('loadPotentialMembers_Should_PopulatePotentialMembers_When_ServiceReturnsData', () => {
      const potentialUser = {
        id: 'usr-potential-1',
        email: 'carol@test.com',
        userName: 'carol',
        fullName: 'Carol Danvers',
      };
      (workspaceService.getPotentialMembers as jasmine.Spy).and.returnValue(
        of({ items: [potentialUser], page: 1, pageSize: 10, totalCount: 1 }),
      );

      component['loadPotentialMembers'](1, 'carol');

      expect(component.snapshot.potentialMembers).toEqual([potentialUser]);
      expect(component.snapshot.potentialMembersTotalCount).toBe(1);
      expect(component.snapshot.isPotentialMembersLoading).toBeFalse();
    });

    it('onAddMemberUserSelected_Should_CallAddMemberAndReloadMembers_When_UserSelected', () => {
      const potentialUser = {
        id: 'usr-potential-2',
        email: 'dave@test.com',
        userName: 'dave',
        fullName: 'Dave Bowman',
      };

      component['onAddMemberUserSelected'](potentialUser);

      expect(workspaceService.addMember).toHaveBeenCalledWith('ws-arch-core', {
        userId: 'usr-potential-2',
      });
      expect(notificationServiceSpy.success).toHaveBeenCalledWith(
        'Added Dave Bowman to workspace.',
      );
      expect(component.snapshot.isAddMemberDialogOpen).toBeFalse();
      expect(workspaceService.getMembers).toHaveBeenCalled();
    });

    it('DOM_Should_RenderAddMemberButton_When_UserCanManageMembers', () => {
      component['updateState']({
        activeTab: 'settings',
        expandedSettingsSections: { general: true, members: true },
      });
      fixture.detectChanges();

      const addBtn = fixture.nativeElement.querySelector(
        '#btn-add-workspace-member',
      ) as HTMLButtonElement;
      expect(addBtn).toBeTruthy();
      expect(addBtn.textContent).toContain('Add Member');
    });
  });

  describe('Remove Member Confirmation Modal', () => {
    const mockMember: WorkspaceMemberResult = {
      id: 'member-123',
      userId: 'usr-123',
      email: 'bob@example.com',
      userName: 'bob_builder',
      fullName: 'Bob Builder',
      isOwner: false,
    };

    it('openRemoveMemberModal_Should_SetMemberAndOpenModal_When_Invoked', () => {
      component['openRemoveMemberModal'](mockMember);

      expect(component.snapshot.isRemoveMemberModalOpen).toBeTrue();
      expect(component.snapshot.memberToRemove).toEqual(mockMember);
      expect(component.snapshot.isRemovingMember).toBeFalse();
    });

    it('closeRemoveMemberModal_Should_ResetStateAndCloseModal_When_NotRemoving', () => {
      component['openRemoveMemberModal'](mockMember);

      component['closeRemoveMemberModal']();

      expect(component.snapshot.isRemoveMemberModalOpen).toBeFalse();
      expect(component.snapshot.memberToRemove).toBeNull();
      expect(component.snapshot.isRemovingMember).toBeFalse();
    });

    it('closeRemoveMemberModal_Should_DoNothing_When_IsRemovingMemberIsTrue', () => {
      component['openRemoveMemberModal'](mockMember);
      component['updateState']({ isRemovingMember: true });

      component['closeRemoveMemberModal']();

      expect(component.snapshot.isRemoveMemberModalOpen).toBeTrue();
    });

    it('confirmRemoveMember_Should_CallServiceAndNotifyAndReload_When_Valid', () => {
      component['updateState']({
        selectedWorkspace: mockWorkspace,
        settingsMembers: [mockMember],
        settingsMembersPage: 1,
      });
      component['openRemoveMemberModal'](mockMember);

      component['confirmRemoveMember'](mockMember);

      expect(workspaceService.removeMember).toHaveBeenCalledWith('ws-arch-core', 'usr-123');
      expect(notificationServiceSpy.success).toHaveBeenCalledWith(
        'Removed @bob_builder from workspace.',
      );
      expect(component.snapshot.isRemoveMemberModalOpen).toBeFalse();
      expect(workspaceService.getMembers).toHaveBeenCalled();
      expect(workspaceService.loadWorkspaces).toHaveBeenCalled();
    });

    it('confirmRemoveMember_Should_AdjustPage_When_LastItemOnPageGreaterThanOneRemoved', () => {
      component['updateState']({
        selectedWorkspace: mockWorkspace,
        settingsMembers: [mockMember],
        settingsMembersPage: 2,
      });
      component['openRemoveMemberModal'](mockMember);

      component['confirmRemoveMember'](mockMember);

      expect(component.snapshot.settingsMembersPage).toBe(1);
    });

    it('confirmRemoveMember_Should_HandleError_When_ServiceFails', () => {
      (workspaceService.removeMember as jasmine.Spy).and.returnValue(
        throwError(() => ({ error: { message: 'Cannot remove owner.' } })),
      );
      component['updateState']({ selectedWorkspace: mockWorkspace });
      component['openRemoveMemberModal'](mockMember);

      component['confirmRemoveMember'](mockMember);

      expect(notificationServiceSpy.error).toHaveBeenCalledWith('Cannot remove owner.');
      expect(component.snapshot.isRemovingMember).toBeFalse();
    });

    it('onEscape_Should_CloseRemoveMemberModal_When_ModalIsOpen', () => {
      component['openRemoveMemberModal'](mockMember);
      expect(component.snapshot.isRemoveMemberModalOpen).toBeTrue();

      component['onEscape']();
      expect(component.snapshot.isRemoveMemberModalOpen).toBeFalse();
    });

    it('DOM_Should_RenderRemoveButtonForNonOwner_And_EnforceConfirmationSpelling', () => {
      const ownerMember: WorkspaceMemberResult = {
        id: 'owner-id',
        userId: 'owner-id',
        email: 'owner@example.com',
        userName: 'owner_user',
        fullName: 'Owner User',
        isOwner: true,
      };
      const regularMember: WorkspaceMemberResult = {
        id: 'regular-id',
        userId: 'regular-id',
        email: 'reg@example.com',
        userName: 'regular_user',
        fullName: 'Regular User',
        isOwner: false,
      };

      component['updateState']({
        activeTab: 'settings',
        expandedSettingsSections: { general: true, members: true },
        settingsMembers: [ownerMember, regularMember],
        settingsMembersTotalCount: 2,
      });
      fixture.detectChanges();

      // Owner card should NOT have remove button
      const ownerRemoveBtn = fixture.nativeElement.querySelector('#btn-remove-member-owner-id');
      expect(ownerRemoveBtn).toBeNull();

      // Regular member card should have remove button
      const regRemoveBtn = fixture.nativeElement.querySelector(
        '#btn-remove-member-regular-id',
      ) as HTMLButtonElement;
      expect(regRemoveBtn).toBeTruthy();

      // Click remove button opens modal
      regRemoveBtn.click();
      fixture.detectChanges();

      const modal = fixture.nativeElement.querySelector('#remove-member-modal');
      expect(modal).toBeTruthy();

      const confirmBtn = fixture.nativeElement.querySelector(
        '#btn-confirm-remove-member',
      ) as HTMLButtonElement;
      expect(confirmBtn.disabled).toBeTrue();

      // Type wrong username
      const input = fixture.nativeElement.querySelector(
        '#input-confirm-member-username',
      ) as HTMLInputElement;
      input.value = 'wrong_name';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(confirmBtn.disabled).toBeTrue();

      // Type correct username
      input.value = 'regular_user';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(confirmBtn.disabled).toBeFalse();

      // Click confirm button
      confirmBtn.click();
      expect(workspaceService.removeMember).toHaveBeenCalledWith('ws-arch-core', 'regular-id');
    });
  });
});
