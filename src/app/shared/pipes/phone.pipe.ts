import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phone',
  standalone: true,
})
export class PhonePipe implements PipeTransform {
  transform(value: string | number | null | undefined): string {
    const digits = String(value ?? '').replace(/\D/g, '');

    if (digits.length === 11) {
      return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    }

    if (digits.length === 10) {
      return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    }

    return value ? String(value) : '';
  }
}
