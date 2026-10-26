import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ICONS, IconDefinition, IconName } from '../../icons/icon-registry';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [],
  templateUrl: './icon.html',
  styleUrl: './icon.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent implements OnChanges {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() name: IconName | null = null;
  @Input() size = 20;
  @Input() strokeWidth = 2;

  iconDef: IconDefinition | null = null;
  safeSvgBody: SafeHtml | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['name']) {
      this.updateIcon();
    }
  }

  private updateIcon(): void {
    if (!this.name || !ICONS[this.name]) {
      this.iconDef = null;
      this.safeSvgBody = null;
    } else {
      this.iconDef = ICONS[this.name];
      this.safeSvgBody = this.sanitizer.bypassSecurityTrustHtml(this.iconDef.body);
    }
    this.cdr.markForCheck();
  }
}
