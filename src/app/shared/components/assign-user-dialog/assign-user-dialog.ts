import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserResult } from '../../../core/models/task.models';
import { WorkspaceMemberResult } from '../../../core/models/workspace.models';

export type AssignableMember = UserResult | WorkspaceMemberResult;

export interface DropdownPosition {
  top: number;
  left: number;
}

@Component({
  selector: 'app-assign-user-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './assign-user-dialog.html',
  styleUrl: './assign-user-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignUserDialogComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchSubject = new Subject<string>();

  @Input() isOpen = false;
  @Input() users: AssignableMember[] = [];
  @Input() isLoading = false;
  @Input() searchTerm = '';
  @Input() page = 1;
  @Input() pageSize = 3;
  @Input() totalCount = 0;
  @Input() anchorPosition: DropdownPosition | null = null;
  @Input() debounceTimeMs = 400;
  @Input() title = 'Assign Work Item';
  @Input() searchPlaceholder = 'Search team member...';
  @Input() loadingText = 'Loading members...';
  @Input() emptyText = 'No workspace members available.';

  @Output() readonly searchChange = new EventEmitter<string>();
  @Output() readonly pageChange = new EventEmitter<number>();
  @Output() readonly userSelected = new EventEmitter<AssignableMember>();
  @Output() readonly closeDialog = new EventEmitter<void>();

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(this.debounceTimeMs),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((term) => {
        this.searchChange.emit(term);
      });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / (this.pageSize || 3)));
  }

  protected onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.page) {
      this.pageChange.emit(page);
    }
  }

  protected onSelect(user: AssignableMember): void {
    this.userSelected.emit(user);
  }

  protected onClose(): void {
    this.closeDialog.emit();
  }

  protected onSearchInput(value: string): void {
    this.searchTerm = value;
    this.searchSubject.next(value);
  }

  protected onSearchEnter(): void {
    this.searchChange.emit(this.searchTerm);
  }

  protected onClearSearch(): void {
    this.searchTerm = '';
    this.searchSubject.next('');
    this.searchChange.emit('');
  }

  protected getUserInitial(user: AssignableMember): string {
    const name = user.fullName || user.userName || '?';
    return name.charAt(0).toUpperCase();
  }

  protected isOwner(user: AssignableMember): boolean {
    return 'isOwner' in user && !!user.isOwner;
  }
}
