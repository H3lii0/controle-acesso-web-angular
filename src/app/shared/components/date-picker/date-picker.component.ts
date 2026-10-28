import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { LucideCalendarDays, LucideDynamicIcon } from '@lucide/angular';

type CalendarView = 'days' | 'months' | 'years';
type CalendarDay = { date: string; day: number; currentMonth: boolean };

@Component({
  selector: 'app-date-picker',
  imports: [CommonModule, LucideDynamicIcon],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
})
export class DatePickerComponent {
  @Input() value = '';
  @Input() ariaLabel = 'Selecionar data';
  @Output() valueChange = new EventEmitter<string>();

  protected open = false;
  protected view: CalendarView = 'days';
  protected calendarMonth = new Date();
  protected readonly weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  protected readonly calendarIcon = LucideCalendarDays;

  protected toggle(): void {
    if (!this.open && this.value) {
      this.calendarMonth = new Date(`${this.value}T12:00:00`);
    }
    this.view = 'days';
    this.open = !this.open;
  }

  protected moveMonth(months: number): void {
    this.calendarMonth = new Date(
      this.calendarMonth.getFullYear(),
      this.calendarMonth.getMonth() + months,
      1,
      12,
    );
  }

  protected moveYears(years: number): void {
    this.calendarMonth = new Date(
      this.calendarMonth.getFullYear() + years,
      this.calendarMonth.getMonth(),
      1,
      12,
    );
  }

  protected calendarLabel(): string {
    return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
      this.calendarMonth,
    );
  }

  protected yearOptions(): number[] {
    const year = this.calendarMonth.getFullYear();
    return Array.from({ length: 12 }, (_, index) => year - 6 + index);
  }

  protected monthOptions(): { value: number; label: string }[] {
    return Array.from({ length: 12 }, (_, value) => ({
      value,
      label: new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(
        new Date(2020, value, 1, 12),
      ),
    }));
  }

  protected calendarDays(): CalendarDay[] {
    const year = this.calendarMonth.getFullYear();
    const month = this.calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1, 12);
    const start = new Date(year, month, 1 - firstDay.getDay(), 12);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index, 12);
      return {
        date: this.toIsoDate(date),
        day: date.getDate(),
        currentMonth: date.getMonth() === month,
      };
    });
  }

  protected selectDate(value: string): void {
    this.valueChange.emit(value);
    this.open = false;
  }

  protected selectYear(year: number): void {
    this.calendarMonth = new Date(year, this.calendarMonth.getMonth(), 1, 12);
    this.view = 'months';
  }

  protected selectMonth(month: number): void {
    this.calendarMonth = new Date(this.calendarMonth.getFullYear(), month, 1, 12);
    this.view = 'days';
  }

  protected clear(): void {
    this.valueChange.emit('');
    this.open = false;
  }

  protected selectToday(): void {
    this.valueChange.emit(this.toIsoDate(new Date()));
    this.open = false;
  }

  protected isSelected(value: string): boolean {
    return value === this.value;
  }

  protected isToday(value: string): boolean {
    return value === this.toIsoDate(new Date());
  }

  protected displayValue(): string {
    if (!this.value) return 'Selecione a data';
    const [year, month, day] = this.value.split('-');
    return `${day}/${month}/${year}`;
  }

  private toIsoDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  @HostListener('document:click')
  protected close(): void {
    this.open = false;
  }
}
