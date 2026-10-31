import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon';
import { IconName } from '../../icons/icon-registry';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: IconName;
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.scss',
})
export class Dropdown {
  @Input() options: DropdownOption[] = [];
  @Input() placeholder: string = 'Select an option';
  @Input() value: string | null = null;
  @Output() valueChange = new EventEmitter<string>();

  isOpen = false;
  selectedOption: DropdownOption | null = null;

  constructor(private elementRef: ElementRef) {}

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  selectOption(option: DropdownOption, event: Event) {
    event.stopPropagation();
    this.selectedOption = option;
    this.isOpen = false;
    this.valueChange.emit(option.value);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}
