import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

export interface CreateWorkspacePayload {
  name: string;
  description: string | null;
}

@Component({
  selector: 'app-create-workspace-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-workspace-modal.component.html',
  styleUrl: './create-workspace-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateWorkspaceModalComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() isOpen = false;
  @Input() canCreate = true;
  @Input() isSubmitting = false;

  @Output() readonly close = new EventEmitter<void>();
  @Output() readonly submitWorkspace = new EventEmitter<CreateWorkspacePayload>();

  protected readonly createForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue && !changes['isOpen'].previousValue) {
      this.resetForm();
    }
  }

  protected onClose(): void {
    this.close.emit();
  }

  protected onSubmit(): void {
    if (this.createForm.invalid || this.isSubmitting) {
      this.createForm.markAllAsTouched();
      return;
    }

    const formVal = this.createForm.value;
    this.submitWorkspace.emit({
      name: formVal.name.trim(),
      description: formVal.description?.trim() || null,
    });
  }

  private resetForm(): void {
    this.createForm.reset({
      name: '',
      description: '',
    });
  }
}
