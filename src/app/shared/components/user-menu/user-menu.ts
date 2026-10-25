import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './user-menu.html',
  styleUrl: './user-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserMenuComponent {
  @Input() userInitial = 'U';
  @Input() isOpen = false;
  @Input() isAdmin = false;
  @Input() showAdminOption = true;

  @Output() readonly toggle = new EventEmitter<void>();
  @Output() readonly close = new EventEmitter<void>();
  @Output() readonly profile = new EventEmitter<void>();
  @Output() readonly admin = new EventEmitter<void>();
  @Output() readonly logout = new EventEmitter<void>();

  constructor(private readonly elementRef: ElementRef) {}

  onToggle(): void {
    this.toggle.emit();
  }

  onProfileClick(): void {
    this.profile.emit();
  }

  onAdminClick(): void {
    this.admin.emit();
  }

  onLogoutClick(): void {
    this.logout.emit();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.close.emit();
    }
  }
}
