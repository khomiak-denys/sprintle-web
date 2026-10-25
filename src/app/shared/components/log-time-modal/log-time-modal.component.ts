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
import { TaskDetailsResult, TaskResult } from '../../../core/models/task.models';

export interface TimePreset {
  minutes: number;
  description: string;
}

export interface LogTimePayload {
  minutesSpent: number;
  loggedDate: string;
  description: string | null;
}

export const DEFAULT_TIME_PRESETS: TimePreset[] = [
  { minutes: 30, description: '30 minutes (0.5h)' },
  { minutes: 60, description: '1 hour (1.0h)' },
  { minutes: 120, description: '2 hours (2.0h)' },
  { minutes: 240, description: '4 hours (Half-day)' },
  { minutes: 480, description: '8 hours (Full-day)' },
];

@Component({
  selector: 'app-log-time-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './log-time-modal.component.html',
  styleUrl: './log-time-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogTimeModalComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() isOpen = false;
  @Input() task: TaskResult | TaskDetailsResult | null = null;
  @Input() isSubmitting = false;
  @Input() timePresets: TimePreset[] = DEFAULT_TIME_PRESETS;

  @Output() readonly close = new EventEmitter<void>();
  @Output() readonly submitTimeLog = new EventEmitter<LogTimePayload>();

  protected readonly logTimeForm: FormGroup = this.fb.group({
    minutesSpent: [60, [Validators.required, Validators.min(1)]],
    loggedDate: [new Date().toISOString().split('T')[0], [Validators.required]],
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
    if (this.logTimeForm.invalid || this.isSubmitting) {
      this.logTimeForm.markAllAsTouched();
      return;
    }

    const val = this.logTimeForm.value;
    this.submitTimeLog.emit({
      minutesSpent: Number(val.minutesSpent),
      loggedDate: val.loggedDate,
      description: val.description?.trim() || null,
    });
  }

  private resetForm(): void {
    this.logTimeForm.reset({
      minutesSpent: 60,
      loggedDate: new Date().toISOString().split('T')[0],
      description: '',
    });
  }
}
