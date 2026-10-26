import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() warningHeading = 'Warning';
  @Input() confirmButtonText = 'Confirm';
  @Input() cancelButtonText = 'Cancel';
  @Input() isProcessing = false;
  @Input() processingText = 'Processing...';

  /**
   * When provided, the user must type this exact string to enable the confirm button.
   */
  @Input() requireConfirmationText: string | null = null;
  @Input() confirmationLabel = 'To confirm, please type:';
  @Input() confirmationPlaceholder = 'Type here to confirm';
  @Input() confirmationInput = '';

  @Input() modalId = 'confirm-dialog-modal';
  @Input() overlayId = 'confirm-dialog-overlay';
  @Input() titleId = 'confirm-dialog-title';
  @Input() confirmButtonId = 'btn-confirm-action';
  @Input() cancelButtonId = 'btn-cancel-action';
  @Input() confirmationInputId = 'input-confirm-text';

  @Output() readonly close = new EventEmitter<void>();
  @Output() readonly confirm = new EventEmitter<void>();
  @Output() readonly confirmationInputChange = new EventEmitter<string>();

  onClose(): void {
    if (!this.isProcessing) {
      this.close.emit();
    }
  }

  onConfirm(): void {
    if (this.isConfirmEnabled()) {
      this.confirm.emit();
    }
  }

  onInputChange(value: string): void {
    this.confirmationInput = value;
    this.confirmationInputChange.emit(value);
  }

  isConfirmEnabled(): boolean {
    if (this.isProcessing) {
      return false;
    }
    if (this.requireConfirmationText !== null && this.requireConfirmationText !== undefined) {
      return this.confirmationInput.trim() === this.requireConfirmationText.trim();
    }
    return true;
  }
}
