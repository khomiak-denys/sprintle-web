import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BehaviorSubject, Observable, Subject, catchError, combineLatest, map, of } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { TaskService } from '../../core/services/task.service';
import { WorkspaceService } from '../../core/services/workspace.service';
import {
  TaskResult,
  TaskDetailsResult,
  TaskStatus,
  Priority,
  MyTasksFilterType,
  CreateTaskRequest,
  LogTimeRequest,
  UserResult,
  TaskComment,
} from '../../core/models/task.models';
import {
  Workspace,
  WorkspaceMemberResult,
  generateWorkspaceCode,
} from '../../core/models/workspace.models';
import { TaskDetailsComponent } from './task-details/task-details.component';
import {
  AssignUserDialogComponent,
  AssignableMember,
  DropdownPosition,
} from '../../shared/components/assign-user-dialog/assign-user-dialog';
import { SkeletonComponent } from '../../shared/components/skeleton/skeleton.component';
import { TooltipComponent } from '../../shared/components/tooltip/tooltip.component';

export type DashboardTab = 'board' | 'list' | 'statistics' | 'settings';

export interface StatisticsSummary {
  readonly total: number;
  readonly todo: number;
  readonly inProgress: number;
  readonly inReview: number;
  readonly done: number;
  readonly cancelled: number;
  readonly critical: number;
  readonly high: number;
  readonly medium: number;
  readonly low: number;
  readonly completionRate: number;
  readonly totalScope: number;
}

export interface BoardColumnData {
  readonly status: TaskStatus;
  readonly title: string;
  readonly colorClass: string;
  readonly count: number;
  readonly tasks: TaskResult[];
}

export const BOARD_COLUMNS: { status: TaskStatus; title: string; colorClass: string }[] = [
  { status: 'Todo', title: 'To Do', colorClass: 'col-todo' },
  { status: 'InProgress', title: 'In Progress', colorClass: 'col-in-progress' },
  { status: 'InReview', title: 'In Review', colorClass: 'col-in-review' },
  { status: 'Done', title: 'Done', colorClass: 'col-done' },
  { status: 'Cancelled', title: 'Cancelled', colorClass: 'col-cancelled' },
];

export interface DashboardState {
  readonly loading: boolean;
  readonly dropdownOpen: boolean;
  readonly userInitial: string;
  readonly activeTab: DashboardTab;
  readonly viewMode: 'my-tasks' | 'all-tasks';
  readonly layoutMode: 'board' | 'list';
  readonly myFilterType: MyTasksFilterType;
  readonly statusFilter: TaskStatus | 'ALL';
  readonly priorityFilter: Priority | 'ALL';
  readonly searchQuery: string;
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly tasks: TaskResult[];
  readonly selectedTask: TaskDetailsResult | null;
  readonly isBladeOpen: boolean;
  readonly comments: TaskComment[];
  readonly commentsLoading: boolean;
  readonly currentUser: UserResult | null;
  readonly isCreateModalOpen: boolean;
  readonly isLogTimeModalOpen: boolean;
  readonly isAssignUserDialogOpen: boolean;
  readonly assignDropdownPosition: DropdownPosition | null;
  readonly taskToAssign: TaskResult | TaskDetailsResult | null;
  readonly assignableUsers: WorkspaceMemberResult[];
  readonly isAssignUsersLoading: boolean;
  readonly assignUserSearch: string;
  readonly assignUserPage: number;
  readonly assignUserPageSize: number;
  readonly assignUserTotalCount: number;
  readonly isAddMemberDialogOpen: boolean;
  readonly addMemberDropdownPosition: DropdownPosition | null;
  readonly potentialMembers: UserResult[];
  readonly isPotentialMembersLoading: boolean;
  readonly potentialMembersSearch: string;
  readonly potentialMembersPage: number;
  readonly potentialMembersPageSize: number;
  readonly potentialMembersTotalCount: number;
  readonly taskForTimeLog: TaskResult | null;
  readonly workspaces: Workspace[];
  readonly selectedWorkspace: Workspace | null;
  readonly savingSettings: boolean;
  readonly settingsMembers: WorkspaceMemberResult[];
  readonly settingsMembersLoading: boolean;
  readonly settingsMembersSearch: string;
  readonly settingsMembersPage: number;
  readonly settingsMembersPageSize: number;
  readonly settingsMembersTotalCount: number;
  readonly expandedSettingsSections: { general: boolean; members: boolean };

  // Remove Member Confirmation
  readonly isRemoveMemberModalOpen: boolean;
  readonly memberToRemove: WorkspaceMemberResult | null;
  readonly removeMemberConfirmInput: string;
  readonly isRemovingMember: boolean;
}

export interface KpiSummary {
  readonly total: number;
  readonly todo: number;
  readonly inProgress: number;
  readonly inReview: number;
  readonly done: number;
  readonly critical: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DatePipe,
    RouterLink,
    TaskDetailsComponent,
    AssignUserDialogComponent,
    SkeletonComponent,
    TooltipComponent,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly workspaceService = inject(WorkspaceService);
  private readonly stateSubject = new BehaviorSubject<DashboardState>({
    loading: !!this.workspaceService.currentWorkspace?.id,
    dropdownOpen: false,
    userInitial: this.calculateUserInitial(),
    activeTab: 'board',
    viewMode: 'all-tasks',
    layoutMode: 'board',
    myFilterType: 'all',
    statusFilter: 'ALL',
    priorityFilter: 'ALL',
    searchQuery: '',
    page: 1,
    pageSize: 10,
    totalCount: 0,
    tasks: [],
    selectedTask: null,
    isBladeOpen: false,
    comments: [],
    commentsLoading: false,
    currentUser: null,
    isCreateModalOpen: false,
    isLogTimeModalOpen: false,
    isAssignUserDialogOpen: false,
    assignDropdownPosition: null,
    taskToAssign: null,
    assignableUsers: [],
    isAssignUsersLoading: false,
    assignUserSearch: '',
    assignUserPage: 1,
    assignUserPageSize: 3,
    assignUserTotalCount: 0,
    isAddMemberDialogOpen: false,
    addMemberDropdownPosition: null,
    potentialMembers: [],
    isPotentialMembersLoading: false,
    potentialMembersSearch: '',
    potentialMembersPage: 1,
    potentialMembersPageSize: 10,
    potentialMembersTotalCount: 0,
    taskForTimeLog: null,
    workspaces: [],
    selectedWorkspace: null,
    savingSettings: false,
    settingsMembers: [],
    settingsMembersLoading: false,
    settingsMembersSearch: '',
    settingsMembersPage: 1,
    settingsMembersPageSize: 5,
    settingsMembersTotalCount: 0,
    expandedSettingsSections: { general: true, members: true },
    isRemoveMemberModalOpen: false,
    memberToRemove: null,
    removeMemberConfirmInput: '',
    isRemovingMember: false,
  });

  readonly state$: Observable<DashboardState> = this.stateSubject.asObservable();

  readonly filteredTasks$: Observable<TaskResult[]> = this.state$.pipe(
    map((s) => this.filterTasks(s.tasks, s.searchQuery, s.statusFilter, s.priorityFilter)),
  );

  readonly columns$: Observable<BoardColumnData[]> = this.filteredTasks$.pipe(
    map((tasks) =>
      BOARD_COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.status);
        return {
          ...col,
          count: colTasks.length,
          tasks: colTasks,
        };
      }),
    ),
  );

  readonly stats$: Observable<StatisticsSummary> = combineLatest([
    this.filteredTasks$,
    this.state$,
  ]).pipe(
    map(([filtered, state]) => {
      const total = filtered.length;
      const todo = filtered.filter((t) => t.status === 'Todo').length;
      const inProgress = filtered.filter((t) => t.status === 'InProgress').length;
      const inReview = filtered.filter((t) => t.status === 'InReview').length;
      const done = filtered.filter((t) => t.status === 'Done').length;
      const cancelled = filtered.filter((t) => t.status === 'Cancelled').length;
      const critical = filtered.filter((t) => t.priority === 'Critical').length;
      const high = filtered.filter((t) => t.priority === 'High').length;
      const medium = filtered.filter((t) => t.priority === 'Medium').length;
      const low = filtered.filter((t) => t.priority === 'Low').length;
      const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

      return {
        total,
        todo,
        inProgress,
        inReview,
        done,
        cancelled,
        critical,
        high,
        medium,
        low,
        completionRate,
        totalScope: state.tasks.length,
      };
    }),
  );

  readonly kpi$: Observable<KpiSummary> = this.stats$.pipe(
    map((s) => ({
      total: s.totalScope,
      todo: s.todo,
      inProgress: s.inProgress,
      inReview: s.inReview,
      done: s.done,
      critical: s.critical,
    })),
  );

  get snapshot(): DashboardState {
    return this.stateSubject.value;
  }

  /**
   * Returns the destination route when clicking the workspace breadcrumb link.
   * If the user is an admin, returns to the admin panel ('/admin'); otherwise to workspaces ('/workspaces').
   */
  get workspaceBreadcrumbRoute(): string {
    return this.authService.isAdmin() ? '/admin' : '/workspaces';
  }

  protected readonly createTaskForm: FormGroup;
  protected readonly logTimeForm: FormGroup;
  protected readonly workspaceSettingsForm: FormGroup;
  private readonly settingsMembersSearchSubject = new Subject<string>();

  get totalSettingsMemberPages(): number {
    const total = this.snapshot.settingsMembersTotalCount;
    const size = this.snapshot.settingsMembersPageSize;
    return Math.max(1, Math.ceil(total / size));
  }

  get canManageWorkspaceMembers(): boolean {
    if (this.authService.isAdmin()) return true;
    const ws = this.snapshot.selectedWorkspace;
    if (!ws) return false;
    if (ws.role === 'Owner' || ws.role === 'Admin') return true;
    const currentUserId = this.authService.currentUserId();
    if (currentUserId && ws.ownerId && ws.ownerId.toLowerCase() === currentUserId.toLowerCase()) {
      return true;
    }
    return !ws.role;
  }

  get isRemoveMemberConfirmed(): boolean {
    return this.isRemoveMemberButtonEnabled();
  }

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    protected readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly taskService: TaskService,
    private readonly fb: FormBuilder,
    private readonly elementRef: ElementRef,
    private readonly router: Router,
  ) {
    this.createTaskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      priority: ['Medium' as Priority, [Validators.required]],
      deadline: [''],
      tags: [''],
      assigneeId: [null as string | null],
    });

    this.logTimeForm = this.fb.group({
      minutesSpent: [30, [Validators.required, Validators.min(1)]],
      description: [''],
      loggedDate: [new Date().toISOString().substring(0, 10), [Validators.required]],
    });

    this.workspaceSettingsForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
    });
  }

  ngOnInit(): void {
    this.updateState({
      userInitial: this.calculateUserInitial(),
      currentUser: this.buildCurrentUser(),
    });

    this.settingsMembersSearchSubject
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((query) => {
        this.updateState({ settingsMembersSearch: query, settingsMembersPage: 1 });
        this.loadSettingsMembers();
      });

    this.workspaceService.selectedWorkspace$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ws) => {
        const isWorkspaceSwitched = this.snapshot.selectedWorkspace?.id !== ws?.id;
        this.updateState({ selectedWorkspace: ws, ...(isWorkspaceSwitched ? { page: 1 } : {}) });
        if (ws) {
          this.workspaceSettingsForm.patchValue({
            name: ws.name,
            description: ws.description || '',
          });
          if (isWorkspaceSwitched && this.snapshot.activeTab === 'settings') {
            this.loadSettingsMembers(ws.id);
          }
        }
        if (ws?.id) {
          if (isWorkspaceSwitched) {
            this.loadTasks();
          }
        } else {
          this.updateState({ loading: false, tasks: [], totalCount: 0 });
        }
      });
  }

  protected onWorkspaces(): void {
    this.updateState({ dropdownOpen: false });
    this.router.navigate([this.authService.isAdmin() ? '/admin' : '/workspaces']);
  }

  protected loadTasks(): void {
    const current = this.snapshot;
    const workspaceId =
      current.selectedWorkspace?.id || this.workspaceService.currentWorkspace?.id || null;

    if (!workspaceId) {
      this.updateState({ loading: false, tasks: [], totalCount: 0 });
      return;
    }

    this.updateState({ loading: true });

    const request$ =
      current.viewMode === 'my-tasks'
        ? this.taskService.getMy(current.myFilterType, current.page, current.pageSize, workspaceId)
        : this.taskService.getAll(current.page, current.pageSize, workspaceId);

    request$
      .pipe(
        catchError(() => {
          return of({
            items: [],
            page: 1,
            pageSize: 10,
            totalCount: 0,
          });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          const items = res?.items ?? [];
          this.updateState({
            loading: false,
            tasks: items,
            totalCount: res?.totalCount ?? items.length,
            page: res?.page ?? 1,
          });
        },
        error: () => {
          this.updateState({ loading: false });
        },
      });
  }

  protected switchViewMode(mode: 'my-tasks' | 'all-tasks'): void {
    this.updateState({ viewMode: mode, page: 1 });
    this.loadTasks();
  }

  protected setLayoutMode(mode: 'board' | 'list'): void {
    const isEnteringBoard = mode === 'board';
    const shouldReload = isEnteringBoard && this.snapshot.viewMode !== 'all-tasks';
    this.updateState({
      layoutMode: mode,
      activeTab: mode,
      ...(isEnteringBoard ? { viewMode: 'all-tasks' } : {}),
    });
    if (shouldReload) {
      this.loadTasks();
    }
  }

  protected setActiveTab(tab: DashboardTab): void {
    const isEnteringBoard = tab === 'board';
    const shouldReload = isEnteringBoard && this.snapshot.viewMode !== 'all-tasks';
    this.updateState({
      activeTab: tab,
      layoutMode: tab === 'list' ? 'list' : 'board',
      ...(isEnteringBoard ? { viewMode: 'all-tasks' } : {}),
    });
    if (tab === 'settings') {
      const ws = this.snapshot.selectedWorkspace;
      if (ws) {
        this.workspaceSettingsForm.patchValue({
          name: ws.name,
          description: ws.description || '',
        });
      }
      this.loadSettingsMembers();
    }
    if (shouldReload) {
      this.loadTasks();
    }
  }

  protected onWorkspaceChange(workspace: Workspace): void {
    this.workspaceService.selectWorkspace(workspace);
    this.notificationService.info(`Switched active workspace to: ${workspace.name}`);
  }

  protected onCreateWorkspace(): void {
    this.notificationService.info(
      'Workspace creation is simulated in mock mode. API integration pending.',
    );
  }

  protected resetFilters(): void {
    this.updateState({
      statusFilter: 'ALL',
      priorityFilter: 'ALL',
      searchQuery: '',
      myFilterType: 'all',
      viewMode: 'all-tasks',
      page: 1,
    });
    this.loadTasks();
  }

  protected setMyFilterType(type: MyTasksFilterType): void {
    this.updateState({ myFilterType: type, viewMode: 'my-tasks', page: 1 });
    this.loadTasks();
  }

  protected setStatusFilter(status: TaskStatus | 'ALL'): void {
    this.updateState({ statusFilter: status });
  }

  protected setPriorityFilter(priority: Priority | 'ALL'): void {
    this.updateState({ priorityFilter: priority });
  }

  protected onSearchChange(term: string): void {
    this.updateState({ searchQuery: term });
  }

  protected onSelectTask(task: TaskResult): void {
    this.taskService
      .getById(task.id)
      .pipe(
        catchError(() => {
          this.notificationService.error('Failed to load task details.');
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((details) => {
        if (details) {
          this.updateState({
            selectedTask: details,
            isBladeOpen: true,
            comments: [],
            commentsLoading: true,
          });
          this.loadComments(details.id);
        }
      });
  }

  protected loadComments(taskId: string, page: number = 1): void {
    this.updateState({ commentsLoading: true });
    this.taskService
      .getComments(taskId, page, 50)
      .pipe(
        catchError(() => {
          this.notificationService.error('Failed to load comments.');
          return of({ items: [], page: 1, pageSize: 50, totalCount: 0 });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        this.updateState({ comments: res?.items ?? [], commentsLoading: false });
      });
  }

  protected onAddComment(content: string): void {
    const task = this.snapshot.selectedTask;
    if (!task || !content.trim()) return;

    this.taskService
      .addComment(task.id, { content: content.trim() })
      .pipe(
        catchError(() => {
          this.notificationService.error('Failed to post comment.');
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((commentId) => {
        if (commentId !== null) {
          this.loadComments(task.id);
        }
      });
  }

  protected onDeleteComment(commentId: string): void {
    const task = this.snapshot.selectedTask;
    if (!task) return;

    this.taskService
      .deleteComment(task.id, commentId)
      .pipe(
        catchError(() => {
          this.notificationService.error('Failed to delete comment.');
          this.loadComments(task.id);
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.updateState({
          comments: this.snapshot.comments.filter((c) => c.id !== commentId),
        });
      });
  }

  protected closeBlade(): void {
    this.updateState({
      isBladeOpen: false,
      selectedTask: null,
      comments: [],
      commentsLoading: false,
    });
  }

  private calculateAnchorPosition(event?: MouseEvent): DropdownPosition | null {
    if (!event) return null;
    const target = (event.currentTarget || event.target) as HTMLElement;
    if (!target || typeof target.getBoundingClientRect !== 'function') return null;

    const rect = target.getBoundingClientRect();
    const dropdownWidth = 290;
    const dropdownHeight = 320;

    let top = rect.bottom + 6;
    let left = rect.left;

    if (left + dropdownWidth > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - dropdownWidth - 12);
    }

    if (top + dropdownHeight > window.innerHeight - 12 && rect.top > dropdownHeight) {
      top = rect.top - dropdownHeight - 6;
    }

    return { top: Math.round(top), left: Math.round(left) };
  }

  protected onDetailsAssign(event?: MouseEvent): void {
    const task = this.snapshot.selectedTask;
    if (!task) return;

    const position = this.calculateAnchorPosition(event);
    this.updateState({
      isAssignUserDialogOpen: true,
      assignDropdownPosition: position,
      taskToAssign: task,
      assignUserSearch: '',
      assignUserPage: 1,
      assignUserPageSize: 3,
      assignUserTotalCount: 0,
      isAssignUsersLoading: true,
    });
    this.loadAssignableMembers(1, '', task.workspaceId);
  }

  protected onBoardAssign(task: TaskResult, event: MouseEvent): void {
    event.stopPropagation();
    const position = this.calculateAnchorPosition(event);
    this.updateState({
      isAssignUserDialogOpen: true,
      assignDropdownPosition: position,
      taskToAssign: task,
      assignUserSearch: '',
      assignUserPage: 1,
      assignUserPageSize: 3,
      assignUserTotalCount: 0,
      isAssignUsersLoading: true,
    });
    this.loadAssignableMembers(1, '', task.workspaceId);
  }

  protected onCloseAssignUserDialog(): void {
    this.updateState({
      isAssignUserDialogOpen: false,
      assignDropdownPosition: null,
      taskToAssign: null,
      assignUserSearch: '',
      assignUserPage: 1,
      assignUserTotalCount: 0,
    });
  }

  protected onAssignUserSearchChange(searchTerm: string): void {
    this.updateState({ assignUserSearch: searchTerm, assignUserPage: 1 });
    this.loadAssignableMembers(1, searchTerm);
  }

  protected onAssignUserPageChange(page: number): void {
    this.updateState({ assignUserPage: page });
    this.loadAssignableMembers(page, this.snapshot.assignUserSearch);
  }

  protected loadAssignableMembers(
    page: number = 1,
    search: string = '',
    explicitWorkspaceId?: string,
  ): void {
    const workspaceId =
      explicitWorkspaceId ||
      this.snapshot.taskToAssign?.workspaceId ||
      (this.snapshot.isCreateModalOpen
        ? this.snapshot.selectedWorkspace?.id || this.workspaceService.currentWorkspace?.id
        : null) ||
      this.snapshot.selectedTask?.workspaceId ||
      this.snapshot.selectedWorkspace?.id ||
      this.workspaceService.currentWorkspace?.id;

    if (!workspaceId) {
      this.updateState({
        assignableUsers: [],
        isAssignUsersLoading: false,
        assignUserPage: 1,
        assignUserTotalCount: 0,
      });
      return;
    }

    const pageSize = this.snapshot.assignUserPageSize || 3;
    this.updateState({ isAssignUsersLoading: true, assignUserPage: page });
    this.workspaceService
      .getMembers(workspaceId, search, page, pageSize)
      .pipe(
        catchError(() => {
          this.notificationService.error('Failed to load workspace members.');
          return of({ items: [], page, pageSize, totalCount: 0 });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        this.updateState({
          assignableUsers: res.items,
          assignUserPage: res.page,
          assignUserTotalCount: res.totalCount,
          isAssignUsersLoading: false,
        });
      });
  }

  protected onUserSelectedForAssignment(user: AssignableMember): void {
    if (this.snapshot.isCreateModalOpen && !this.snapshot.taskToAssign) {
      this.selectedCreateAssignee = user;
      this.createTaskForm.patchValue({ assigneeId: user.id });
      this.onCloseAssignUserDialog();
      return;
    }

    const task = this.snapshot.taskToAssign || this.snapshot.selectedTask;
    if (!task) return;

    this.taskService
      .assign(task.id, user.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificationService.success(
            `Assigned to ${user.fullName || user.userName} and moved to In Progress.`,
          );
          this.onCloseAssignUserDialog();
          this.refreshTaskDetails(task.id);
        },
        error: () => {
          this.notificationService.error('Failed to assign task.');
        },
      });
  }

  protected onDetailsSubmitForReview(): void {
    const task = this.snapshot.selectedTask;
    if (!task) return;

    this.taskService
      .submitForReview(task.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificationService.success('Task submitted for review.');
          this.refreshTaskDetails(task.id);
        },
        error: () => {
          this.notificationService.error('Failed to submit task for review.');
        },
      });
  }

  protected onDetailsApprove(): void {
    const task = this.snapshot.selectedTask;
    if (!task) return;

    this.taskService
      .approve(task.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificationService.success('Task approved and completed.');
          this.refreshTaskDetails(task.id);
        },
        error: () => {
          this.notificationService.error('Failed to approve task.');
        },
      });
  }

  protected onDetailsClose(): void {
    const task = this.snapshot.selectedTask;
    if (!task) return;

    this.taskService
      .close(task.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificationService.success('Task closed.');
          this.refreshTaskDetails(task.id);
        },
        error: () => {
          this.notificationService.error('Failed to close task.');
        },
      });
  }

  protected onDetailsCancel(): void {
    if (this.snapshot.selectedTask) {
      this.onCancelTask(this.snapshot.selectedTask);
    }
  }

  protected onDetailsChangePriority(priority: Priority): void {
    const task = this.snapshot.selectedTask;
    if (!task) return;

    this.taskService
      .changePriority(task.id, priority)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificationService.success(`Priority updated to ${priority}.`);
          this.refreshTaskDetails(task.id);
        },
        error: () => {
          this.notificationService.error('Failed to change priority.');
        },
      });
  }

  protected refreshTaskDetails(taskId: string): void {
    this.taskService
      .getById(taskId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updatedDetails) => {
        const updatedTasks = this.snapshot.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: updatedDetails.status,
                assignee: updatedDetails.assignee,
                priority: updatedDetails.priority,
              }
            : t,
        );
        this.updateState({
          tasks: updatedTasks,
          selectedTask: updatedDetails,
        });
      });
  }

  protected openLogTimeForSelected(): void {
    if (this.snapshot.selectedTask) {
      this.openLogTimeModal(this.snapshot.selectedTask);
    }
  }

  protected createdTags: string[] = [];
  protected tagInputText = '';
  protected selectedCreateAssignee: AssignableMember | null = null;

  protected focusTagInput(inputEl: HTMLInputElement): void {
    inputEl.focus();
  }

  protected onTagInput(value: string, inputEl?: HTMLInputElement): void {
    if (value.includes(',')) {
      const parts = value.split(',');
      for (const part of parts) {
        this.addCreatedTag(part);
      }
      this.tagInputText = '';
      if (inputEl) inputEl.value = '';
    } else if (value.includes('  ')) {
      const parts = value.split('  ');
      for (let i = 0; i < parts.length - 1; i++) {
        if (parts[i].trim()) {
          this.addCreatedTag(parts[i]);
        }
      }
      this.tagInputText = parts[parts.length - 1].trimStart();
      if (inputEl) inputEl.value = this.tagInputText;
    } else {
      this.tagInputText = value;
    }
  }

  protected onTagKeyDown(event: KeyboardEvent, inputEl?: HTMLInputElement): void {
    const el = inputEl || (event.target as HTMLInputElement | null);
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      if (this.tagInputText.trim()) {
        this.addCreatedTag(this.tagInputText);
        this.tagInputText = '';
        if (el) el.value = '';
      }
    } else if (event.key === ' ' || event.code === 'Space') {
      if (this.tagInputText.endsWith(' ') && this.tagInputText.trim()) {
        event.preventDefault();
        this.addCreatedTag(this.tagInputText);
        this.tagInputText = '';
        if (el) el.value = '';
      }
    } else if (event.key === 'Backspace' && !this.tagInputText && this.createdTags.length > 0) {
      this.removeCreatedTag(this.createdTags[this.createdTags.length - 1]);
    }
  }

  protected onTagBlur(inputEl?: HTMLInputElement): void {
    if (this.tagInputText.trim()) {
      this.addCreatedTag(this.tagInputText);
      this.tagInputText = '';
      if (inputEl) inputEl.value = '';
    }
  }

  protected addCreatedTag(tag: string): void {
    const trimmed = tag.trim();
    if (trimmed && !this.createdTags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      this.createdTags = [...this.createdTags, trimmed];
      this.createTaskForm.get('tags')?.setValue(this.createdTags.join(', '));
    }
  }

  protected removeCreatedTag(tag: string, event?: Event): void {
    event?.stopPropagation();
    this.createdTags = this.createdTags.filter((t) => t !== tag);
    this.createTaskForm.get('tags')?.setValue(this.createdTags.join(', '));
  }

  protected onOpenCreateAssigneeDialog(event: MouseEvent): void {
    event.stopPropagation();
    const position = this.calculateAnchorPosition(event);
    const workspaceId =
      this.snapshot.selectedWorkspace?.id || this.workspaceService.currentWorkspace?.id || '';

    this.updateState({
      isAssignUserDialogOpen: true,
      assignDropdownPosition: position,
      taskToAssign: null,
      assignUserSearch: '',
      assignUserPage: 1,
      assignUserPageSize: 3,
      assignUserTotalCount: 0,
      isAssignUsersLoading: true,
    });
    this.loadAssignableMembers(1, '', workspaceId);
  }

  protected onClearCreateAssignee(event?: MouseEvent): void {
    event?.stopPropagation();
    this.selectedCreateAssignee = null;
    this.createTaskForm.patchValue({ assigneeId: null });
  }

  protected getMemberInitial(member: AssignableMember | null): string {
    if (!member) return '?';
    const name = member.fullName || member.userName || '?';
    return name.trim().charAt(0).toUpperCase() || '?';
  }

  protected openCreateModal(): void {
    this.createdTags = [];
    this.tagInputText = '';
    this.selectedCreateAssignee = null;
    this.createTaskForm.reset({
      title: '',
      priority: 'Medium',
      deadline: '',
      description: '',
      tags: '',
      assigneeId: null,
    });
    this.updateState({ isCreateModalOpen: true });
  }

  protected closeCreateModal(): void {
    this.createdTags = [];
    this.tagInputText = '';
    this.selectedCreateAssignee = null;
    if (this.snapshot.isAssignUserDialogOpen && !this.snapshot.taskToAssign) {
      this.onCloseAssignUserDialog();
    }
    this.updateState({ isCreateModalOpen: false });
  }

  protected onCreateTaskSubmit(): void {
    if (this.tagInputText.trim()) {
      this.addCreatedTag(this.tagInputText);
      this.tagInputText = '';
    }

    if (this.createTaskForm.invalid) {
      this.createTaskForm.markAllAsTouched();
      return;
    }

    const val = this.createTaskForm.value;
    const formTagsArray = val.tags
      ? val.tags
          .split(',')
          .map((t: string) => t.trim())
          .filter((t: string) => !!t)
      : [];
    const tagsArray = this.createdTags.length > 0 ? [...this.createdTags] : formTagsArray;

    const activeWorkspaceId =
      this.snapshot.selectedWorkspace?.id || this.workspaceService.currentWorkspace?.id || '';

    if (!activeWorkspaceId) {
      this.notificationService.error('Please select or create a workspace before creating tasks.');
      return;
    }

    const request: CreateTaskRequest = {
      workspaceId: activeWorkspaceId,
      title: val.title.trim(),
      description: val.description?.trim() || null,
      priority: val.priority,
      deadline: val.deadline ? new Date(val.deadline).toISOString() : null,
      assigneeId: val.assigneeId || null,
      tags: tagsArray,
    };

    this.taskService
      .create(request)
      .pipe(
        catchError(() => {
          this.notificationService.error('Failed to create task.');
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        if (result) {
          this.notificationService.success('Task created successfully.');
          this.closeCreateModal();
          this.loadTasks();
        }
      });
  }

  protected onCompleteTask(task: TaskResult): void {
    this.taskService
      .complete(task.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const updated = this.snapshot.tasks.map((t) =>
            t.id === task.id ? { ...t, status: 'Done' as TaskStatus } : t,
          );
          const isSelected = this.snapshot.selectedTask?.id === task.id;
          this.updateState({
            tasks: updated,
            selectedTask: isSelected ? null : this.snapshot.selectedTask,
            isBladeOpen: isSelected ? false : this.snapshot.isBladeOpen,
          });
          this.notificationService.success('Task completed successfully.');
        },
        error: () => {},
      });
  }

  protected onCancelTask(task: TaskResult): void {
    this.taskService
      .cancel(task.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const updated = this.snapshot.tasks.map((t) =>
            t.id === task.id ? { ...t, status: 'Cancelled' as TaskStatus } : t,
          );
          const isSelected = this.snapshot.selectedTask?.id === task.id;
          this.updateState({
            tasks: updated,
            selectedTask: isSelected ? null : this.snapshot.selectedTask,
            isBladeOpen: isSelected ? false : this.snapshot.isBladeOpen,
          });
          this.notificationService.info('Task cancelled.');
        },
        error: () => {},
      });
  }

  readonly timePresets: { minutes: number; label: string; description: string }[] = [
    { minutes: 30, label: '30m', description: '30 minutes' },
    { minutes: 60, label: '1h', description: '1 hour' },
    { minutes: 120, label: '2h', description: '2 hours' },
    { minutes: 240, label: '4h', description: '4 hours' },
    { minutes: 480, label: '8h', description: '8 hours' },
  ];

  protected setTimePreset(minutes: number): void {
    this.logTimeForm.patchValue({ minutesSpent: minutes });
    this.logTimeForm.get('minutesSpent')?.markAsDirty();
  }

  protected openLogTimeModal(task: TaskResult): void {
    this.logTimeForm.reset({
      minutesSpent: 60,
      description: '',
      loggedDate: new Date().toISOString().substring(0, 10),
    });
    this.updateState({ isLogTimeModalOpen: true, taskForTimeLog: task });
  }

  protected closeLogTimeModal(): void {
    this.updateState({ isLogTimeModalOpen: false, taskForTimeLog: null });
  }

  protected onLogTimeSubmit(): void {
    if (this.logTimeForm.invalid || !this.snapshot.taskForTimeLog) {
      this.logTimeForm.markAllAsTouched();
      return;
    }

    const taskId = this.snapshot.taskForTimeLog.id;
    const val = this.logTimeForm.value;
    const req: LogTimeRequest = {
      minutesSpent: Number(val.minutesSpent),
      description: val.description?.trim() || null,
      loggedDate: val.loggedDate,
    };

    this.taskService
      .logTime(taskId, req)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificationService.success(`Logged ${req.minutesSpent} minutes.`);
          this.closeLogTimeModal();
          if (this.snapshot.selectedTask?.id === taskId) {
            this.taskService
              .getById(taskId)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe((updatedTask) => {
                if (updatedTask) {
                  this.updateState({ selectedTask: updatedTask });
                }
              });
          }
        },
        error: () => {},
      });
  }

  protected toggleDropdown(): void {
    this.updateState({ dropdownOpen: !this.stateSubject.value.dropdownOpen });
  }

  protected closeDropdown(): void {
    this.updateState({ dropdownOpen: false });
  }

  protected onProfile(): void {
    this.closeDropdown();
    this.router.navigate(['/profile']);
  }

  protected onAdmin(): void {
    this.closeDropdown();
    this.router.navigate(['/admin']);
  }

  protected onLogout(): void {
    this.closeDropdown();
    this.notificationService.info('You have been signed out.');
    this.authService.logout();
  }

  @HostListener('document:click', ['$event'])
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.stateSubject.value.dropdownOpen) return;
    const target = event.target as HTMLElement;
    if (!this.elementRef.nativeElement.querySelector('.user-menu-container')?.contains(target)) {
      this.closeDropdown();
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.snapshot.isRemoveMemberModalOpen) {
      this.closeRemoveMemberModal();
    } else if (this.snapshot.isCreateModalOpen) {
      this.closeCreateModal();
    } else if (this.snapshot.isLogTimeModalOpen) {
      this.closeLogTimeModal();
    } else if (this.snapshot.isBladeOpen) {
      this.closeBlade();
    } else {
      this.closeDropdown();
    }
  }

  private filterTasks(
    tasks: TaskResult[],
    query: string,
    status: TaskStatus | 'ALL',
    priority: Priority | 'ALL',
  ): TaskResult[] {
    const q = (query || '').toLowerCase().trim();
    return tasks.filter((t) => {
      const taskNumberLower = String(t.number ?? '').toLowerCase();
      const matchesQuery =
        !q ||
        (q && taskNumberLower.includes(q)) ||
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q));

      const matchesStatus = status === 'ALL' || t.status === status;
      const matchesPriority = priority === 'ALL' || t.priority === priority;

      return matchesQuery && matchesStatus && matchesPriority;
    });
  }

  isTaskAssigned(task: TaskResult): boolean {
    return !!task.assignee;
  }

  getAssigneeUsername(task: TaskResult): string {
    return task.assignee?.userName || task.assignee?.fullName || '';
  }

  getAssigneeTooltip(task: TaskResult): string {
    if (!this.isTaskAssigned(task)) {
      return 'Unassigned';
    }
    return this.getAssigneeUsername(task) || 'Unassigned';
  }

  getAssigneeInitial(task: TaskResult): string {
    const username = this.getAssigneeUsername(task);
    if (!username) return '?';
    return username.trim().charAt(0).toUpperCase() || '?';
  }

  protected loadSettingsMembers(workspaceId?: string): void {
    const wsId =
      workspaceId ||
      this.snapshot.selectedWorkspace?.id ||
      this.workspaceService.currentWorkspace?.id;
    if (!wsId) return;

    this.updateState({ settingsMembersLoading: true });
    this.workspaceService
      .getMembers(
        wsId,
        this.snapshot.settingsMembersSearch,
        this.snapshot.settingsMembersPage,
        this.snapshot.settingsMembersPageSize,
      )
      .pipe(
        catchError(() => {
          this.notificationService.error('Failed to load workspace members.');
          return of({ items: [], page: 1, pageSize: 5, totalCount: 0 });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        const ownerId = this.snapshot.selectedWorkspace?.ownerId;
        const items = (res?.items ?? []).map((m) => ({
          ...m,
          isOwner:
            m.isOwner ?? (!!ownerId && (m.userId || m.id).toLowerCase() === ownerId.toLowerCase()),
        }));
        this.updateState({
          settingsMembersLoading: false,
          settingsMembers: items,
          settingsMembersTotalCount: res?.totalCount ?? 0,
        });
      });
  }

  protected onSettingsMembersSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.settingsMembersSearchSubject.next(input.value);
  }

  protected onSettingsMembersPageChange(page: number): void {
    this.updateState({ settingsMembersPage: page });
    this.loadSettingsMembers();
  }

  protected onOpenAddMemberDialog(event?: MouseEvent): void {
    const ws = this.snapshot.selectedWorkspace;
    if (!ws?.id) return;

    const position = this.calculateAnchorPosition(event);
    this.updateState({
      isAddMemberDialogOpen: true,
      addMemberDropdownPosition: position,
      potentialMembersSearch: '',
      potentialMembersPage: 1,
      potentialMembersPageSize: 10,
      potentialMembersTotalCount: 0,
      isPotentialMembersLoading: true,
      potentialMembers: [],
    });
    this.loadPotentialMembers(1, '', ws.id);
  }

  protected onCloseAddMemberDialog(): void {
    this.updateState({
      isAddMemberDialogOpen: false,
      addMemberDropdownPosition: null,
      potentialMembersSearch: '',
      potentialMembersPage: 1,
      potentialMembersTotalCount: 0,
      potentialMembers: [],
      isPotentialMembersLoading: false,
    });
  }

  protected onAddMemberSearchChange(searchTerm: string): void {
    this.updateState({ potentialMembersSearch: searchTerm, potentialMembersPage: 1 });
    this.loadPotentialMembers(1, searchTerm);
  }

  protected onAddMemberPageChange(page: number): void {
    this.updateState({ potentialMembersPage: page });
    this.loadPotentialMembers(page, this.snapshot.potentialMembersSearch);
  }

  protected loadPotentialMembers(
    page: number = 1,
    search: string = '',
    explicitWorkspaceId?: string,
  ): void {
    const workspaceId =
      explicitWorkspaceId ||
      this.snapshot.selectedWorkspace?.id ||
      this.workspaceService.currentWorkspace?.id;

    if (!workspaceId) {
      this.updateState({
        potentialMembers: [],
        isPotentialMembersLoading: false,
        potentialMembersPage: 1,
        potentialMembersTotalCount: 0,
      });
      return;
    }

    const pageSize = this.snapshot.potentialMembersPageSize || 10;
    this.updateState({ isPotentialMembersLoading: true, potentialMembersPage: page });
    this.workspaceService
      .getPotentialMembers(workspaceId, search, page, pageSize)
      .pipe(
        catchError(() => {
          this.notificationService.error('Failed to load potential members.');
          return of({ items: [], page, pageSize, totalCount: 0 });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        this.updateState({
          potentialMembers: res.items,
          potentialMembersPage: res.page,
          potentialMembersTotalCount: res.totalCount,
          isPotentialMembersLoading: false,
        });
      });
  }

  protected onAddMemberUserSelected(user: AssignableMember): void {
    const ws = this.snapshot.selectedWorkspace;
    if (!ws?.id) return;

    this.workspaceService
      .addMember(ws.id, { userId: user.id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificationService.success(`Added ${user.fullName || user.userName} to workspace.`);
          this.onCloseAddMemberDialog();
          this.loadSettingsMembers(ws.id);
          this.workspaceService
            .loadWorkspaces()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe();
        },
        error: (err) => {
          const msg =
            err?.error?.message || err?.error?.detail || 'Failed to add member to workspace.';
          this.notificationService.error(msg);
        },
      });
  }

  protected isMemberOwner(member: WorkspaceMemberResult): boolean {
    if (member.isOwner) return true;
    const ownerId = this.snapshot.selectedWorkspace?.ownerId;
    const memberId = member.userId || member.id;
    return !!ownerId && !!memberId && ownerId.toLowerCase() === memberId.toLowerCase();
  }

  protected openRemoveMemberModal(member: WorkspaceMemberResult): void {
    this.updateState({
      isRemoveMemberModalOpen: true,
      memberToRemove: member,
      removeMemberConfirmInput: '',
      isRemovingMember: false,
    });
  }

  protected closeRemoveMemberModal(force: boolean = false): void {
    if (!force && this.snapshot.isRemovingMember) return;
    this.updateState({
      isRemoveMemberModalOpen: false,
      memberToRemove: null,
      removeMemberConfirmInput: '',
      isRemovingMember: false,
    });
  }

  protected onRemoveMemberConfirmInputChange(value: string): void {
    this.updateState({ removeMemberConfirmInput: value });
  }

  protected isRemoveMemberButtonEnabled(): boolean {
    const target = this.snapshot.memberToRemove;
    if (!target) return false;
    return (
      this.snapshot.removeMemberConfirmInput.trim() === target.userName.trim() &&
      !this.snapshot.isRemovingMember
    );
  }

  protected confirmRemoveMember(): void {
    const member = this.snapshot.memberToRemove;
    const ws = this.snapshot.selectedWorkspace;
    if (!member || !ws?.id || !this.isRemoveMemberButtonEnabled()) return;

    const memberUserId = member.userId || member.id;
    this.updateState({ isRemovingMember: true });

    this.workspaceService
      .removeMember(ws.id, memberUserId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notificationService.success(`Removed @${member.userName} from workspace.`);
          if (this.snapshot.settingsMembers.length === 1 && this.snapshot.settingsMembersPage > 1) {
            this.updateState({
              settingsMembersPage: this.snapshot.settingsMembersPage - 1,
            });
          }
          this.closeRemoveMemberModal(true);
          this.loadSettingsMembers(ws.id);
          this.workspaceService
            .loadWorkspaces()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe();
        },
        error: (err) => {
          this.updateState({ isRemovingMember: false });
          const msg =
            err?.error?.message || err?.error?.detail || 'Failed to remove member from workspace.';
          this.notificationService.error(msg);
        },
      });
  }

  protected isSettingsSectionExpanded(section: 'general' | 'members'): boolean {
    return !!this.snapshot.expandedSettingsSections[section];
  }

  protected toggleSettingsSection(section: 'general' | 'members'): void {
    const current = this.snapshot.expandedSettingsSections;
    this.updateState({
      expandedSettingsSections: {
        ...current,
        [section]: !current[section],
      },
    });
  }

  protected onSaveWorkspaceSettings(): void {
    if (this.workspaceSettingsForm.invalid) {
      this.workspaceSettingsForm.markAllAsTouched();
      return;
    }

    const ws = this.snapshot.selectedWorkspace;
    if (!ws?.id) {
      this.notificationService.error('No active workspace selected.');
      return;
    }

    const { name, description } = this.workspaceSettingsForm.value;
    const trimmedName = (name || '').trim();
    const trimmedDesc = description ? description.trim() : '';

    this.updateState({ savingSettings: true });

    this.workspaceService
      .update(ws.id, {
        name: trimmedName,
        description: trimmedDesc ? trimmedDesc : null,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const newCode = generateWorkspaceCode(trimmedName);
          const updatedWs: Workspace = {
            ...ws,
            name: trimmedName,
            description: trimmedDesc,
            code: newCode,
          };

          this.workspaceService.updateWorkspace(ws.id, {
            name: trimmedName,
            description: trimmedDesc,
            code: newCode,
          });

          this.updateState({
            savingSettings: false,
            selectedWorkspace: updatedWs,
          });

          this.workspaceSettingsForm.reset({
            name: trimmedName,
            description: trimmedDesc,
          });

          this.workspaceService
            .loadWorkspaces()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe();

          this.notificationService.success('Workspace settings updated successfully.');
        },
        error: (err) => {
          this.updateState({ savingSettings: false });
          const msg =
            err?.error?.message || err?.error?.detail || 'Failed to update workspace settings.';
          this.notificationService.error(msg);
        },
      });
  }

  protected onDiscardWorkspaceSettings(): void {
    const ws = this.snapshot.selectedWorkspace;
    if (ws) {
      this.workspaceSettingsForm.reset({
        name: ws.name,
        description: ws.description || '',
      });
    }
  }

  private calculateUserInitial(): string {
    const user =
      typeof this.authService?.currentUser === 'function' ? this.authService.currentUser() : null;
    if (!user) return '?';
    const name =
      user.unique_name ||
      user['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
      user.name ||
      user.email ||
      '';
    const trimmed = typeof name === 'string' ? name.trim() : '';
    return trimmed.charAt(0).toUpperCase() || '?';
  }

  private buildCurrentUser(): UserResult | null {
    const jwt =
      typeof this.authService?.currentUser === 'function' ? this.authService.currentUser() : null;
    if (!jwt) return null;
    return {
      id: jwt.sub || '',
      email: jwt.email || '',
      userName: jwt.unique_name || jwt.name || jwt.email || '',
      fullName: typeof jwt.name === 'string' ? jwt.name : null,
    };
  }

  private updateState(partial: Partial<DashboardState>): void {
    this.stateSubject.next({
      ...this.stateSubject.value,
      ...partial,
    });
  }
}
