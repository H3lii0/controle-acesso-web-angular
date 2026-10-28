import {
  Directive,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  Optional,
  Self,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
  selector: 'input[appPhoneInput]',
  standalone: true,
})
export class PhoneInputDirective implements OnInit, OnDestroy {
  private valueChangesSubscription?: Subscription;

  constructor(
    private readonly elementRef: ElementRef<HTMLInputElement>,
    @Optional() @Self() private readonly ngControl: NgControl,
  ) {}

  ngOnInit(): void {
    this.syncInputValue();

    this.valueChangesSubscription = this.ngControl?.control?.valueChanges.subscribe(() => {
      this.syncInputValue();
    });
  }

  ngOnDestroy(): void {
    this.valueChangesSubscription?.unsubscribe();
  }

  @HostListener('input', ['$event'])
  protected mask(event: Event): void {
    this.syncInputValue(event.target as HTMLInputElement);
  }

  @HostListener('focus', ['$event'])
  protected maskExistingValue(event: FocusEvent): void {
    this.syncInputValue(event.target as HTMLInputElement);
  }

  private syncInputValue(input?: HTMLInputElement): void {
    const target = input ?? this.elementRef.nativeElement;

    if (!target) {
      return;
    }

    const digits = target.value.replace(/\D/g, '').slice(0, 11);
    const masked = this.format(digits);

    if (target.value === masked) {
      return;
    }

    target.value = masked;

    if (this.ngControl?.control && this.ngControl.control.value !== masked) {
      this.ngControl.control.setValue(masked, { emitEvent: false });
    }
  }

  private format(digits: string): string {
    if (digits.length <= 2) {
      return digits;
    }

    if (digits.length <= 6) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }

    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
}
