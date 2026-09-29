import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  LucideDownload,
  LucideDynamicIcon,
  LucideEye,
  LucideFingerprint,
  LucidePlus,
  LucideSearch,
  LucideTriangleAlert,
  LucideUsers,
} from '@lucide/angular';

@Component({
  selector: 'app-student-list',
  imports: [FormsModule, RouterLink, LucideDynamicIcon],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss',
})
export class StudentListComponent {
  protected search = signal('');
  protected classFilter = signal('Todas as turmas');
  protected readonly icons = {
    search: LucideSearch,
    export: LucideDownload,
    add: LucidePlus,
    view: LucideEye,
    biometric: LucideFingerprint,
    students: LucideUsers,
    alert: LucideTriangleAlert,
  };

  private readonly allStudents = [
    { id: 'lucas', initials: 'LM', name: 'Lucas Martins', enrollment: '2024-0042', className: '7º Ano B', shift: 'Manhã', guardian: 'Mariana Martins', biometric: 'Cadastrada', status: 'Ativo' },
    { id: 'clara', initials: 'CM', name: 'Clara Mendes', enrollment: '2024-0316', className: '8º Ano A', shift: 'Manhã', guardian: 'Roberto Mendes', biometric: 'Cadastrada', status: 'Ativo' },
    { id: 'enzo', initials: 'EG', name: 'Enzo Gabriel', enrollment: '2024-1102', className: '6º Ano C', shift: 'Manhã', guardian: 'Camila Gabriel', biometric: 'Pendente', status: 'Ativo' },
    { id: 'manuela', initials: 'MR', name: 'Manuela Rocha', enrollment: '2023-0208', className: '1ª Série EM', shift: 'Tarde', guardian: 'Carlos Rocha', biometric: 'Cadastrada', status: 'Ativo' },
    { id: 'pedro', initials: 'PH', name: 'Pedro Henrique', enrollment: '2024-0604', className: '9º Ano B', shift: 'Manhã', guardian: 'Juliana Henrique', biometric: 'Cadastrada', status: 'Ativo' },
    { id: 'laura', initials: 'LB', name: 'Laura Beatriz', enrollment: '2024-0289', className: '7º Ano A', shift: 'Tarde', guardian: 'Paulo Beatriz', biometric: 'Pendente', status: 'Inativo' },
  ];

  protected readonly students = computed(() => {
    const term = this.search().trim().toLocaleLowerCase('pt-BR');

    return this.allStudents.filter((student) => {
      const matchesSearch = !term || `${student.name} ${student.enrollment} ${student.guardian}`
        .toLocaleLowerCase('pt-BR')
        .includes(term);
      const matchesClass = this.classFilter() === 'Todas as turmas' || student.className === this.classFilter();

      return matchesSearch && matchesClass;
    });
  });
}


