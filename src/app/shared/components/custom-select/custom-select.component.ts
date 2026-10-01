import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import {
  LucideCheck,
  LucideChevronDown,
  LucideDynamicIcon,
  LucideIconInput,
} from '@lucide/angular';

export interface CustomSelectOption {
  value: string | number;
  label: string;
  description?: string;
}

@Component({
  selector: 'app-custom-select',
  imports: [CommonModule, LucideDynamicIcon],
  templateUrl: './custom-select.component.html',
  styleUrl: './custom-select.component.scss',
})
export class CustomSelectComponent {
  @Input({ required: true }) options: CustomSelectOption[] = [];
  @Input() value: string | number | null = null;
  @Input() size: 'default' | 'large' = 'default';
  @Input() placeholder = 'Selecione uma opção';
  @Input() label = '';
  @Input() loading = false;
  @Input() disabled = false;
  @Input() emptyMessage = 'Nenhuma opção disponível';
  @Input() ariaLabel = 'Selecionar opção';
  @Input() icon: LucideIconInput | null = null;
  @Output() valueChange = new EventEmitter<string | number>();

  protected open = false;
  protected readonly checkIcon = LucideCheck;
  protected readonly chevronIcon = LucideChevronDown;

  protected get selectionLabel(): string {
    if (this.loading) {
      return 'Carregando...';
    }

    if (this.options.length === 0) {
      return this.emptyMessage;
    }

    return this.options.find((option) => this.isSelected(option.value))?.label ?? this.placeholder;
  }

  protected toggle(): void {
    if (this.disabled || this.loading || this.options.length === 0) {
      return;
    }

    this.open = !this.open;
  }

  protected select(option: CustomSelectOption): void {
    this.value = option.value;
    this.valueChange.emit(option.value);
    this.open = false;
  }

  protected isSelected(value: string | number): boolean {
    return String(this.value) === String(value);
  }

  protected stopClick(event: MouseEvent): void {
    event.stopPropagation();
  }

  @HostListener('document:click')
  protected close(): void {
    this.open = false;
  }
}
