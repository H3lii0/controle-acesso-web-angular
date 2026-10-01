import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideCalendarDays,
  LucideClockAlert,
  LucideClock3,
  LucideDownload,
  LucideDynamicIcon,
  LucideFilter,
  LucideMonitorCheck,
  LucideScanLine,
  LucideSchool,
  LucideShieldX,
  LucideTriangleAlert,
  LucideUsers,
} from '@lucide/angular';
import {
  DashboardFilters,
  DashboardPeriod,
  DashboardShift,
  DashboardSummary,
} from '../../../../core/dashboard/dashboard.models';
import { DashboardService } from '../../../../core/dashboard/dashboard.service';
import { finalize } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import {
  CustomSelectComponent,
  CustomSelectOption,
} from '../../../../shared/components/custom-select/custom-select.component';

Chart.register(...registerables);

@Component({
  selector: 'app-overview',
  imports: [RouterLink, LucideDynamicIcon, CustomSelectComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss',
})
export class OverviewComponent implements AfterViewInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);
  private readonly changeDetector = inject(ChangeDetectorRef);
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
    calendar: LucideCalendarDays,
    school: LucideSchool,
    clock: LucideClock3,
  };

  protected summary: DashboardSummary | null = null;
  protected loading = true;
  protected error = '';
  protected period: DashboardPeriod = 'today';
  protected schoolClassId = '';
  protected shift: '' | DashboardShift = '';
  protected readonly date = this.todayInRecife();
  @ViewChild('flowChart') private flowChart?: ElementRef<HTMLCanvasElement>;
  private chart?: Chart<'line'>;

  constructor() {
    this.load();
  }

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  protected load(): void {
    this.loading = true;
    this.error = '';
    const filters: DashboardFilters = { date: this.date, period: this.period };
    if (this.schoolClassId) filters.school_class_id = Number(this.schoolClassId);
    if (this.shift) filters.shift = this.shift;
    this.dashboardService
      .summary(filters)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.changeDetector.markForCheck();
        }),
      )
      .subscribe({
        next: (response) => {
          this.summary = response.data;
          this.changeDetector.markForCheck();
          setTimeout(() => this.renderChart());
        },
        error: () => {
          this.error = 'Não foi possível carregar os indicadores do dashboard.';
          this.changeDetector.markForCheck();
        },
      });
  }

  protected formatTime(timestamp: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Recife',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(timestamp));
  }

  protected initials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }
  protected percentage(value: number, total: number): string {
    return total ? `${((value / total) * 100).toFixed(1).replace('.', ',')}%` : '0%';
  }
  protected readonly periodOptions: CustomSelectOption[] = [
    { value: 'today', label: 'Hoje' },
    { value: 'last_7_days', label: 'Últimos 7 dias' },
  ];
  protected readonly shiftOptions: CustomSelectOption[] = [
    { value: '', label: 'Todos os turnos' },
    { value: 'morning', label: 'Manhã' },
    { value: 'afternoon', label: 'Tarde' },
  ];
  protected classOptions(): CustomSelectOption[] {
    return [
      { value: '', label: 'Todas as turmas' },
      ...(this.summary?.classes ?? []).map((schoolClass) => ({
        value: schoolClass.id,
        label: schoolClass.name,
      })),
    ];
  }
  protected selectPeriod(value: string | number): void {
    this.period = value as DashboardPeriod;
    this.load();
  }
  protected selectClass(value: string | number): void {
    this.schoolClassId = String(value);
    this.load();
  }
  protected selectShift(value: string | number): void {
    this.shift = value as '' | DashboardShift;
    this.load();
  }
  private renderChart(): void {
    const canvas = this.flowChart?.nativeElement;
    const flow = this.summary?.flow ?? [];
    if (!canvas || !flow.length) return;

    this.chart?.destroy();
    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: flow.map((point) => point.label),
        datasets: [
          {
            label: 'Entradas',
            data: flow.map((point) => point.entries),
            borderColor: '#0f766e',
            backgroundColor: 'rgba(15, 118, 110, 0.10)',
            pointBackgroundColor: '#0f766e',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
            borderWidth: 2,
            tension: 0.35,
            fill: true,
          },
          {
            label: 'Saídas',
            data: flow.map((point) => point.exits),
            borderColor: '#2563eb',
            backgroundColor: 'rgba(37, 99, 235, 0.06)',
            pointBackgroundColor: '#2563eb',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 3,
            pointHoverRadius: 5,
            borderWidth: 2,
            tension: 0.35,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            align: 'end',
            labels: {
              boxWidth: 8,
              boxHeight: 8,
              usePointStyle: true,
              color: '#526173',
              font: { size: 10 },
            },
          },
          tooltip: { displayColors: true, padding: 10 },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#8290a3', maxTicksLimit: 12, font: { size: 9 } },
          },
          y: {
            beginAtZero: true,
            ticks: { precision: 0, stepSize: 1, color: '#8290a3', font: { size: 9 } },
            grid: { color: '#e5e9ed', drawTicks: false },
          },
        },
      },
    });
  }
  protected todayInRecife(): string {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Recife',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date());
    const part = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((item) => item.type === type)?.value ?? '';
    return `${part('year')}-${part('month')}-${part('day')}`;
  }
}
