import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon';
import { IconName } from '../../icons/icon-registry';

export type StatePanelType = 'loading' | 'empty' | 'error';

@Component({
  selector: 'app-state-panel',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './state-panel.html',
  styleUrl: './state-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatePanelComponent {
  @Input() type: StatePanelType = 'loading';
  @Input() title = '';
  @Input() message = '';
  @Input() icon: IconName | null = null;
}
