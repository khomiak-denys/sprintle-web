import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import {
  TaskDetailsResult,
  TaskComment,
  TaskStatus,
  UserResult,
  Priority,
} from '../../../core/models/task.models';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe],
  templateUrl: './task-details.component.html',
  styleUrl: './task-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDetailsComponent {
  private readonly cdr = inject(ChangeDetectorRef);

  @Input()
  set task(value: TaskDetailsResult | null) {
    this._task = value;
    this.isPriorityDropdownOpen = false;
    this.loadCommentsForTask(value);
    this.cdr.markForCheck();
  }
  get task(): TaskDetailsResult | null {
    return this._task;
  }
  private _task: TaskDetailsResult | null = null;

  @Input() isOpen = false;

  @Input()
  set comments(value: TaskComment[] | null | undefined) {
    if (value !== undefined && value !== null) {
      this._comments = [...value];
      if (this._task) {
        this.taskCommentsMap.set(this._task.id, this._comments);
      }
      this.cdr.markForCheck();
    }
  }
  get comments(): TaskComment[] {
    return this._comments;
  }
  private _comments: TaskComment[] = [];

  @Input() commentsLoading = false;
  @Input() currentUser: UserResult | null = null;
  @Input() isAdmin = false;

  @Output() readonly closeBlade = new EventEmitter<void>();
  @Output() readonly assign = new EventEmitter<MouseEvent | undefined>();
  @Output() readonly submitForReview = new EventEmitter<void>();
  @Output() readonly approve = new EventEmitter<void>();
  @Output() readonly close = new EventEmitter<void>();
  @Output() readonly logTime = new EventEmitter<void>();
  @Output() readonly cancel = new EventEmitter<void>();
  @Output() readonly addComment = new EventEmitter<string>();
  @Output() readonly deleteComment = new EventEmitter<string>();
  @Output() readonly changePriority = new EventEmitter<Priority>();

  protected isPriorityDropdownOpen = false;
  protected readonly priorityLevels: Priority[] = ['Low', 'Medium', 'High', 'Critical'];
  protected newCommentText = '';

  private readonly taskCommentsMap = new Map<string, TaskComment[]>();

  protected get canChangePriority(): boolean {
    if (this.isAdmin) return true;
    if (!this._task) return false;
    const currentUserId = this.currentUser?.id;
    if (!currentUserId) return false;
    const creatorId = this._task.createdById || this._task.createdBy?.id;
    return !!creatorId && creatorId.toLowerCase() === currentUserId.toLowerCase();
  }

  protected togglePriorityDropdown(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    if (!this.canChangePriority) return;
    this.isPriorityDropdownOpen = !this.isPriorityDropdownOpen;
    this.cdr.markForCheck();
  }

  protected closePriorityDropdown(): void {
    if (this.isPriorityDropdownOpen) {
      this.isPriorityDropdownOpen = false;
      this.cdr.markForCheck();
    }
  }

  protected selectPriority(priority: Priority): void {
    this.closePriorityDropdown();
    if (this._task && this._task.priority !== priority) {
      this.changePriority.emit(priority);
    }
  }

  protected isTransitionAllowed(action: string): boolean {
    const normalized = action.toLowerCase().replace(/[-_]/g, '');
    return (
      this._task?.availableTransitions?.some(
        (t) => t.action.toString().toLowerCase().replace(/[-_]/g, '') === normalized && t.isAllowed,
      ) ?? false
    );
  }

  protected onClose(): void {
    this.isPriorityDropdownOpen = false;
    this.closeBlade.emit();
  }

  protected onAssign(event?: MouseEvent): void {
    this.assign.emit(event);
  }

  protected onSubmitForReview(): void {
    this.submitForReview.emit();
  }

  protected onApprove(): void {
    this.approve.emit();
  }

  protected onCloseTask(): void {
    this.close.emit();
  }

  protected onLogTime(): void {
    this.logTime.emit();
  }

  protected onCancel(): void {
    this.cancel.emit();
  }

  protected onCommentInput(value: string): void {
    this.newCommentText = value;
  }

  protected onAddComment(): void {
    const text = this.newCommentText.trim();
    if (!text || !this._task) return;

    const comment: TaskComment = {
      id: `comment-${Date.now()}`,
      taskId: this._task.id,
      author: this.currentUser,
      authorId: this.currentUser?.id,
      content: text,
      createdAt: new Date().toISOString(),
    };

    this._comments = [...this._comments, comment];
    this.taskCommentsMap.set(this._task.id, this._comments);
    this.newCommentText = '';
    this.addComment.emit(text);
    this.cdr.markForCheck();
  }

  protected canDeleteComment(comment: TaskComment): boolean {
    if (!comment) return false;
    if (this.isAdmin) return true;
    const currentId = this.currentUser?.id;
    return !!currentId && (comment.authorId === currentId || comment.author?.id === currentId);
  }

  protected onDeleteComment(commentId: string): void {
    this._comments = this._comments.filter((c) => c.id !== commentId);
    if (this._task) {
      this.taskCommentsMap.set(this._task.id, this._comments);
    }
    this.deleteComment.emit(commentId);
    this.cdr.markForCheck();
  }

  protected getAuthorName(author?: UserResult | null): string {
    if (!author) return 'Anonymous';
    return author.fullName || author.userName || 'User';
  }

  protected getAuthorInitial(author?: UserResult | null): string {
    if (!author) return '?';
    const name = author.fullName || author.userName || '';
    return name.charAt(0).toUpperCase() || '?';
  }

  protected getAssigneeName(): string {
    if (!this._task?.assignee) return 'Unassigned';
    return this._task.assignee.fullName || this._task.assignee.userName || 'Assigned User';
  }

  protected getCreatorName(): string {
    if (!this._task?.createdBy) return 'System';
    return this._task.createdBy.fullName || this._task.createdBy.userName || 'Task Creator';
  }

  protected getAssigneeInitial(): string {
    const name = this.getAssigneeName();
    return name === 'Unassigned' ? '?' : name.charAt(0).toUpperCase();
  }

  protected getCreatorInitial(): string {
    const name = this.getCreatorName();
    return name.charAt(0).toUpperCase() || 'U';
  }

  protected getTotalLoggedMinutes(): number {
    if (!this._task?.timeLogs?.length) return 0;
    return this._task.timeLogs.reduce((acc, curr) => acc + (curr.minutesSpent || 0), 0);
  }

  private loadCommentsForTask(task: TaskDetailsResult | null): void {
    if (!task) {
      this._comments = [];
      this.newCommentText = '';
      return;
    }

    if (this.taskCommentsMap.has(task.id)) {
      this._comments = this.taskCommentsMap.get(task.id)!;
      return;
    }

    if (task.comments && task.comments.length > 0) {
      this._comments = [...task.comments];
      this.taskCommentsMap.set(task.id, this._comments);
      return;
    }

    this._comments = [];
    this.taskCommentsMap.set(task.id, []);
  }
}
