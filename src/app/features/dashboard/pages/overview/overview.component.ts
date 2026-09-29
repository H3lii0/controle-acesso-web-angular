import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideClockAlert,
  LucideDownload,
  LucideDynamicIcon,
  LucideFilter,
  LucideMonitorCheck,
  LucideScanLine,
  LucideShieldX,
  LucideTriangleAlert,
  LucideUsers,
} from '@lucide/angular';

@Component({
  selector: 'app-overview',
  imports: [RouterLink, LucideDynamicIcon],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent {
  protected readonly icons = {
    students: LucideUsers,
    accessRecords: LucideScanLine,
    delays: LucideClockAlert,
    denied: LucideShieldX,
    terminal: LucideMonitorCheck,
    alert: LucideTriangleAlert,
    arrow: LucideArrowRight,
    export: LucideDownload,
    filter: LucideFilter,
  };

  protected readonly events = [
    { initials: 'LM', name: 'Lucas Martins', enrollment: '2024-0042', className: '7º Ano B', time: '07:26:14', movement: 'Entrada', status: 'Autorizado', tone: 'success' },
    { initials: 'BS', name: 'Beatriz Souza', enrollment: '2023-0314', className: '8º Ano A', time: '07:29:02', movement: 'Entrada', status: 'Atraso de 1 min', tone: 'warning' },
    { initials: 'GL', name: 'Gabriel Lima', enrollment: '2024-0421', className: '6º Ano B', time: '07:16:42', movement: 'Saída', status: 'Autorizado', tone: 'info' },
    { initials: 'SA', name: 'Sofia Albuquerque', enrollment: '2022-0128', className: '9º Ano C', time: '08:22:18', movement: 'Entrada', status: 'Acesso negado', tone: 'danger' },
    { initials: 'CC', name: 'Carlos Eduardo Santos', enrollment: '2024-0187', className: '7º Ano A', time: '08:15:50', movement: 'Entrada', status: 'Autorizado', tone: 'success' },
  ];
}


