import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon';
import { IconName } from '../../icons/icon-registry';

export type ExpandableIconTone = 'primary' | 'danger' | 'security' | 'neutral' | 'metadata';

@Component({
  selector: 'app-expandable-item',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './expandable-item.html',
  styleUrl: './expandable-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpandableItemComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() icon: IconName | null = null;
  @Input() iconTone: ExpandableIconTone = 'primary';
  @Input() expanded = false;
  @Input() toggleButtonId = '';
  @Input() panelId = '';

  @Output() readonly toggle = new EventEmitter<void>();

  onToggle(): void {
    this.toggle.emit();
  }
}
