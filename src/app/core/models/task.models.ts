export type TaskStatus = 'Todo' | 'InProgress' | 'InReview' | 'Done' | 'Cancelled' | 'Closed';

export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

export type MyTasksFilterType = 'all' | 'created' | 'assigned';

export interface UserResult {
  readonly id: string;
  readonly email: string;
  readonly userName: string;
  readonly fullName: string | null;
}

export interface TaskResult {
  readonly id: string;
  readonly workspaceId: string;
  readonly title: string;
  readonly description: string | null;
  readonly status: TaskStatus;
  readonly priority: Priority;
  readonly deadline: string | null;
  readonly assignee?: UserResult | null;
  readonly tags: string[];
  readonly commentCount?: number;
}

export interface TimeLogResult {
  readonly id: string;
  readonly userId: string;
  readonly minutesSpent: number;
  readonly description: string | null;
  readonly loggedDate: string;
  readonly createdAt: string;
}

export interface TaskComment {
  readonly id: string;
  readonly taskId?: string;
  readonly authorId?: string;
  readonly author: UserResult | null;
  readonly content: string;
  readonly createdAt: string;
}

export interface AddCommentRequest {
  readonly content: string;
}

export type TaskAction = 'Assign' | 'SubmitForReview' | 'Approve' | 'Close' | 'Cancel';

export interface TaskTransitionResult {
  readonly action: TaskAction | string;
  readonly targetStatus: TaskStatus;
  readonly isAllowed: boolean;
}

export interface TaskDetailsResult extends TaskResult {
  readonly createdAt: string;
  readonly updatedAt: string | null;
  readonly assignee: UserResult | null;
  readonly createdBy: UserResult;
  readonly timeLogs: TimeLogResult[];
  readonly comments?: TaskComment[];
  readonly createdById?: string;
  readonly assignedUser?: UserResult | null;
  readonly createdByUser?: UserResult;
  readonly availableTransitions?: TaskTransitionResult[];
}

export interface PaginationResult<T> {
  readonly items: T[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
}

export interface CreateTaskRequest {
  readonly workspaceId: string;
  readonly title: string;
  readonly description?: string | null;
  readonly priority: Priority;
  readonly deadline?: string | null;
  readonly assigneeId?: string | null;
  readonly tags?: string[];
}

export interface UpdateTaskRequest {
  readonly title: string;
  readonly description?: string | null;
  readonly priority: Priority;
  readonly deadline?: string | null;
  readonly tags?: string[];
}

export interface LogTimeRequest {
  readonly minutesSpent: number;
  readonly description?: string | null;
  readonly loggedDate: string; // YYYY-MM-DD
}

export interface ChangeTaskPriorityRequest {
  readonly priority: Priority;
}
