import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Reusable presentational tooltip component.
 * Displays a styled tooltip bubble when user hovers or focuses on content.
 */
@Component({
  selector: 'app-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tooltip.component.html',
  styleUrl: './tooltip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipComponent {
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() text = '';
  @Input() position: TooltipPosition = 'top';

  protected isVisible = false;

  show(): void {
    if (this.text) {
      this.isVisible = true;
      this.cdr.markForCheck();
    }
  }

  hide(): void {
    if (this.isVisible) {
      this.isVisible = false;
      this.cdr.markForCheck();
    }
  }
}
