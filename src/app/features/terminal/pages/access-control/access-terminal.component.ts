import { Component, OnDestroy, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideCircleCheckBig,
  LucideDynamicIcon,
  LucideFingerprint,
  LucideLogOut,
  LucideRotateCcw,
  LucideScanLine,
  LucideShieldX,
  LucideTriangleAlert,
  LucideWifi,
  LucideWifiOff,
  LucideWrench,
} from '@lucide/angular';
import { AuthService } from '../../../../core/authentication/auth.service';

type TerminalState = 'waiting' | 'reading' | 'entry' | 'exit' | 'denied' | 'failure' | 'offline' | 'maintenance';

@Component({
  selector: 'app-access-terminal',
  imports: [LucideDynamicIcon],
  templateUrl: './access-terminal.component.html',
  styleUrl: './access-terminal.component.scss',
})
export class AccessTerminalComponent implements OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private returnTimer?: number;
  private readonly clock = window.setInterval(() => this.currentTime.set(this.formatTime()), 1000);

  protected readonly currentTime = signal(this.formatTime());
  protected readonly state = signal<TerminalState>('waiting');
  protected readonly currentSchoolName = this.auth.sessionSnapshot?.currentSchool?.name ?? 'Colégio Horizonte';
  protected readonly icons = {
    fingerprint: LucideFingerprint,
    reading: LucideScanLine,
    success: LucideCircleCheckBig,
    denied: LucideShieldX,
    failure: LucideTriangleAlert,
    offline: LucideWifiOff,
    maintenance: LucideWrench,
    online: LucideWifi,
    restart: LucideRotateCcw,
    signOut: LucideLogOut,
  };
  protected readonly messages: Record<TerminalState, { title: string; text: string }> = {
    waiting: { title: 'Aguardando biometria', text: 'Posicione o dedo no leitor para registrar o acesso.' },
    reading: { title: 'Lendo digital...', text: 'Mantenha o dedo no leitor por alguns segundos.' },
    entry: { title: 'Entrada autorizada', text: 'Olá, Lucas Martins. Tenha um ótimo dia!' },
    exit: { title: 'Saída registrada', text: 'Até logo, Lucas Martins. Registro confirmado.' },
    denied: { title: 'Acesso não autorizado', text: 'Biometria reconhecida, mas sem permissão neste horário.' },
    failure: { title: 'Digital não reconhecida', text: 'Retire o dedo, limpe o leitor e tente novamente.' },
    offline: { title: 'Terminal sem conexão', text: 'Os registros serão sincronizados quando a conexão retornar.' },
    maintenance: { title: 'Terminal em manutenção', text: 'O equipamento está temporariamente indisponível.' },
  };

  ngOnDestroy(): void {
    window.clearInterval(this.clock);

    if (this.returnTimer) {
      window.clearTimeout(this.returnTimer);
    }
  }

  protected selectState(state: TerminalState): void {
    if (this.returnTimer) {
      window.clearTimeout(this.returnTimer);
    }

    this.state.set(state);
  }

  protected simulateReading(): void {
    this.selectState('reading');
    this.returnTimer = window.setTimeout(() => {
      this.state.set('entry');
      this.returnTimer = window.setTimeout(() => this.state.set('waiting'), 3500);
    }, 1500);
  }

  protected currentIcon() {
    return {
      waiting: this.icons.fingerprint,
      reading: this.icons.reading,
      entry: this.icons.success,
      exit: this.icons.success,
      denied: this.icons.denied,
      failure: this.icons.failure,
      offline: this.icons.offline,
      maintenance: this.icons.maintenance,
    }[this.state()];
  }

  protected signOut(): void {
    this.auth.logout().subscribe({
      next: () => this.router.navigateByUrl('/login'),
      error: () => this.router.navigateByUrl('/login'),
    });
  }

  private formatTime(): string {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date());
  }
}


