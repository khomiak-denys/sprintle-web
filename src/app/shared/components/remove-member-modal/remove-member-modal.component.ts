import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkspaceMemberResult } from '../../../core/models/workspace.models';

@Component({
  selector: 'app-remove-member-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './remove-member-modal.component.html',
  styleUrl: './remove-member-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RemoveMemberModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() member: WorkspaceMemberResult | null = null;
  @Input() workspaceName = '';
  @Input() isRemoving = false;

  @Output() readonly close = new EventEmitter<void>();
  @Output() readonly confirm = new EventEmitter<WorkspaceMemberResult>();

  protected confirmInput = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue && !changes['isOpen'].previousValue) {
      this.confirmInput = '';
    }
  }

  protected onConfirmInputChange(value: string): void {
    this.confirmInput = value;
  }

  protected isConfirmEnabled(): boolean {
    if (this.isRemoving || !this.member) {
      return false;
    }
    return this.confirmInput.trim() === this.member.userName.trim();
  }

  protected onClose(): void {
    if (this.isRemoving) {
      return;
    }
    this.confirmInput = '';
    this.close.emit();
  }

  protected onConfirm(): void {
    if (!this.isConfirmEnabled() || !this.member) {
      return;
    }
    this.confirm.emit(this.member);
  }
}
