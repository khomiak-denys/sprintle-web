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
import { Priority } from '../../../core/models/task.models';
import { AssignableMember } from '../assign-user-dialog/assign-user-dialog';

export interface CreateTaskPayload {
  title: string;
  priority: Priority;
  deadline: string | null;
  description: string | null;
  assigneeId: string | null;
  tags: string[];
}

@Component({
  selector: 'app-create-task-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-task-modal.component.html',
  styleUrl: './create-task-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateTaskModalComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() isOpen = false;
  @Input() selectedAssignee: AssignableMember | null = null;
  @Input() isSubmitting = false;

  @Output() readonly close = new EventEmitter<void>();
  @Output() readonly submitTask = new EventEmitter<CreateTaskPayload>();
  @Output() readonly openAssigneeDialog = new EventEmitter<MouseEvent>();
  @Output() readonly clearAssignee = new EventEmitter<MouseEvent | undefined>();

  protected createdTags: string[] = [];
  protected tagInputText = '';

  protected readonly createTaskForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    priority: ['Medium' as Priority, [Validators.required]],
    deadline: [''],
    description: [''],
    assigneeId: [null],
    tags: [''],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']?.currentValue && !changes['isOpen'].previousValue) {
      this.resetModal();
    }
    if (changes['selectedAssignee']) {
      this.createTaskForm.patchValue({
        assigneeId: this.selectedAssignee?.id || null,
      });
    }
  }

  protected onClose(): void {
    this.close.emit();
  }

  protected onSubmit(): void {
    if (this.tagInputText.trim()) {
      this.addCreatedTag(this.tagInputText);
      this.tagInputText = '';
    }

    if (this.createTaskForm.invalid || this.isSubmitting) {
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

    this.submitTask.emit({
      title: val.title.trim(),
      description: val.description?.trim() || null,
      priority: val.priority,
      deadline: val.deadline ? new Date(val.deadline).toISOString() : null,
      assigneeId: val.assigneeId || null,
      tags: tagsArray,
    });
  }

  protected onOpenAssigneeDialog(event: MouseEvent): void {
    this.openAssigneeDialog.emit(event);
  }

  protected onClearAssignee(event?: MouseEvent): void {
    this.clearAssignee.emit(event);
  }

  protected getMemberInitial(member: AssignableMember | null): string {
    if (!member) return '?';
    const name = member.fullName || member.userName || '?';
    return name.trim().charAt(0).toUpperCase() || '?';
  }

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

  private resetModal(): void {
    this.createdTags = [];
    this.tagInputText = '';
    this.createTaskForm.reset({
      title: '',
      priority: 'Medium',
      deadline: '',
      description: '',
      tags: '',
      assigneeId: this.selectedAssignee?.id || null,
    });
  }
}
