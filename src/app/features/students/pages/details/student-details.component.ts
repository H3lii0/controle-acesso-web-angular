import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideCheck,
  LucideChevronLeft,
  LucideClock,
  LucideDynamicIcon,
  LucideFingerprint,
  LucideMapPin,
  LucidePencil,
  LucideScanLine,
  LucideUsers,
} from '@lucide/angular';

@Component({
  selector: 'app-student-details',
  imports: [RouterLink, LucideDynamicIcon],
  templateUrl: './student-details.component.html',
  styleUrl: './student-details.component.scss',
})
export class StudentDetailsComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly created = this.route.snapshot.queryParamMap.has('created');
  protected readonly icons = {
    back: LucideChevronLeft,
    edit: LucidePencil,
    guardians: LucideUsers,
    biometric: LucideFingerprint,
    accessRecords: LucideScanLine,
    location: LucideMapPin,
    clock: LucideClock,
    check: LucideCheck,
    arrow: LucideArrowRight,
  };
  protected readonly events = [
    { type: 'Entrada autorizada', time: 'Hoje, 07:12', location: 'Portaria principal', tone: 'success' },
    { type: 'Saída regular', time: 'Ontem, 17:05', location: 'Portaria principal', tone: 'info' },
    { type: 'Entrada autorizada', time: 'Ontem, 07:09', location: 'Portaria principal', tone: 'success' },
    { type: 'Saída antecipada autorizada', time: '22/10, 11:30', location: 'Portaria lateral', tone: 'warning' },
  ];
}


