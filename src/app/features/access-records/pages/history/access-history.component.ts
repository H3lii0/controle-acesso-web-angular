import { Component } from '@angular/core';
import {
  LucideClockAlert,
  LucideDownload,
  LucideDynamicIcon,
  LucideLogIn,
  LucideLogOut,
  LucideRefreshCw,
  LucideSearch,
  LucideShieldX,
} from '@lucide/angular';

@Component({
  selector: 'app-access-history',
  imports: [LucideDynamicIcon],
  templateUrl: './access-history.component.html',
  styleUrl: './access-history.component.scss',
})
export class AccessHistoryComponent {
  protected readonly icons = {
    export: LucideDownload,
    refresh: LucideRefreshCw,
    entry: LucideLogIn,
    exit: LucideLogOut,
    delay: LucideClockAlert,
    denied: LucideShieldX,
    search: LucideSearch,
  };
  protected readonly records = [
    { date: '24/10/2026', time: '07:12:04', name: 'Lucas Gabriel Albuquerque', enrollment: '2024-0042', className: '7º Ano C', movement: 'Entrada', status: 'Acesso autorizado', tone: 'success', terminal: 'Portaria principal' },
    { date: '24/10/2026', time: '07:32:22', name: 'Beatriz Valença de Souza', enrollment: '2023-0415', className: '8º Ano A', movement: 'Entrada', status: 'Atraso de 2 min', tone: 'warning', terminal: 'Portaria principal' },
    { date: '24/10/2026', time: '08:14:09', name: 'Rodrigo Medeiros Prado', enrollment: '2024-0281', className: '1ª Série EM', movement: 'Entrada bloqueada', status: 'Acesso negado', tone: 'danger', terminal: 'Portaria lateral' },
    { date: '24/10/2026', time: '09:42:18', name: 'Carolina Sampaio Neves', enrollment: '2022-0098', className: '9º Ano A', movement: 'Saída', status: 'Saída registrada', tone: 'info', terminal: 'Portaria principal' },
    { date: '24/10/2026', time: '10:05:47', name: 'Enzo Martins Farias', enrollment: '2024-1102', className: '6º Ano C', movement: 'Saída', status: 'Saída regular', tone: 'info', terminal: 'Portaria principal' },
    { date: '24/10/2026', time: '10:28:31', name: 'Gabriel Duarte Lima', enrollment: '2024-0421', className: '7º Ano B', movement: 'Entrada', status: 'Acesso autorizado', tone: 'success', terminal: 'Portaria principal' },
  ];
}


