import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, finalize, startWith, Subject, switchMap } from 'rxjs';
import { LucideCheck, LucideChevronDown, LucideDynamicIcon, LucideEye, LucidePlus, LucideSchool, LucideSearch, LucideShieldCheck, LucideUsers } from '@lucide/angular';
import { SchoolClass, Student, StudentStatusFilter } from '../../../../core/students/student.models';
import { StudentService } from '../../../../core/students/student.service';

@Component({
  selector: 'app-student-list',
  imports: [CommonModule, FormsModule, RouterLink, LucideDynamicIcon],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss',
})
export class StudentListComponent implements OnInit {
  private readonly studentService = inject(StudentService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly filterChanges = new Subject<void>();

  protected readonly search = signal('');
  protected readonly classFilter = signal<number | ''>('');
  protected readonly statusFilter = signal<StudentStatusFilter>('');
  protected readonly students = signal<Student[]>([]);
  protected readonly schoolClasses = signal<SchoolClass[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal('');
  protected readonly openFilter = signal<'class' | 'status' | null>(null);
  protected readonly currentPage = signal(1);
  protected readonly lastPage = signal(1);
  protected readonly total = signal(0);
  protected readonly icons = { search: LucideSearch, add: LucidePlus, view: LucideEye, students: LucideUsers, school: LucideSchool, status: LucideShieldCheck, chevron: LucideChevronDown, check: LucideCheck };

  ngOnInit(): void {
    this.studentService.schoolClassOptions().subscribe({
      next: (response) => { this.schoolClasses.set(response.data); this.changeDetector.markForCheck(); },
    });
    this.filterChanges.pipe(
      startWith(undefined),
      debounceTime(250),
      switchMap(() => {
        this.loading.set(true);
        this.errorMessage.set('');
        return this.studentService.list(this.filters()).pipe(finalize(() => { this.loading.set(false); this.changeDetector.markForCheck(); }));
      }),
    ).subscribe({
      next: (response) => { this.students.set(response.data); this.currentPage.set(response.meta.current_page); this.lastPage.set(response.meta.last_page); this.total.set(response.meta.total); },
      error: () => { this.errorMessage.set('Não foi possível carregar os alunos.'); this.changeDetector.markForCheck(); },
    });
  }

  protected applyFilters(): void { this.currentPage.set(1); this.filterChanges.next(); }
  protected changePage(page: number): void { if (page < 1 || page > this.lastPage() || page === this.currentPage()) return; this.currentPage.set(page); this.filterChanges.next(); }
  protected classLabel(schoolClass: SchoolClass): string { return `${schoolClass.name} · ${schoolClass.shift === 'morning' ? 'Manhã' : 'Tarde'}`; }
  protected initials(name: string): string { return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase(); }
  protected activeLabel(active: boolean): string { return active ? 'Ativo' : 'Inativo'; }
  protected toggleFilter(filter: 'class' | 'status'): void { this.openFilter.update((current) => current === filter ? null : filter); }
  protected selectClass(value: number | ''): void { this.classFilter.set(value); this.openFilter.set(null); this.applyFilters(); }
  protected selectStatus(value: StudentStatusFilter): void { this.statusFilter.set(value); this.openFilter.set(null); this.applyFilters(); }
  protected classFilterLabel(): string { return this.classFilter() ? this.schoolClasses().find((schoolClass) => schoolClass.id === this.classFilter())?.name ?? 'Turma selecionada' : 'Todas as turmas'; }
  protected statusFilterLabel(): string { return this.statusFilter() === 'active' ? 'Ativos' : this.statusFilter() === 'inactive' ? 'Inativos' : 'Todas as situações'; }
  protected isSelectedClass(id: number): boolean { return this.classFilter() === id; }
  @HostListener('document:click') protected closeFilters(): void { this.openFilter.set(null); }

  private filters() {
    const status = this.statusFilter();
    return { search: this.search().trim() || undefined, school_class_id: this.classFilter() || undefined, is_active: status ? status === 'active' : undefined, page: this.currentPage(), per_page: 15 };
  }
}
