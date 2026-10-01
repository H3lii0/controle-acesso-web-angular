import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  LucideClock3,
  LucideDynamicIcon,
  LucideFingerprint,
  LucideSchool,
  LucideShieldCheck,
  LucideUserRound,
} from '@lucide/angular';
import { AuthService } from '../../../../core/authentication/auth.service';
import { SettingsService } from '../../../../core/settings/settings.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-settings',
  imports: [LucideDynamicIcon, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private readonly auth = inject(AuthService);
  private readonly settingsService = inject(SettingsService);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly changeDetector = inject(ChangeDetectorRef);

  protected user = this.auth.sessionSnapshot?.user;
  protected schoolLoading = true;
  protected savingSchool = false;
  protected savingProfile = false;
  protected error = '';
  protected success = '';
  protected readonly schoolForm = this.formBuilder.group({
    name: [''],
    contact_email: [''],
    phone: [''],
    address: [''],
    timezone: ['America/Recife'],
  });
  protected readonly profileForm = this.formBuilder.group({
    full_name: [this.user?.full_name ?? ''],
    phone: [this.user?.phone ?? ''],
  });
  protected readonly icons = {
    school: LucideSchool,
    user: LucideUserRound,
    clock: LucideClock3,
    biometric: LucideFingerprint,
    security: LucideShieldCheck,
  };

  constructor() {
    this.settingsService.school().subscribe({
      next: (response) => {
        this.schoolForm.patchValue({
          ...response.data,
          contact_email: response.data.contact_email ?? '',
          phone: response.data.phone ?? '',
          address: response.data.address ?? '',
        });
        this.schoolLoading = false;
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.error = 'Não foi possível carregar as configurações da escola.';
        this.schoolLoading = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  protected saveSchool(): void {
    if (this.schoolForm.invalid || this.savingSchool) return;
    this.savingSchool = true;
    this.error = '';
    this.success = '';
    this.settingsService.updateSchool(this.schoolForm.getRawValue()).pipe(
      finalize(() => { this.savingSchool = false; this.changeDetector.markForCheck(); }),
    ).subscribe({
      next: (response) => {
        this.schoolForm.patchValue({
          ...response.data,
          contact_email: response.data.contact_email ?? '',
          phone: response.data.phone ?? '',
          address: response.data.address ?? '',
        });
        this.success = response.message;
        this.changeDetector.markForCheck();
      },
      error: () => { this.error = 'Não foi possível salvar os dados da escola.'; this.changeDetector.markForCheck(); },
    });
  }

  protected saveProfile(): void {
    if (this.profileForm.invalid || this.savingProfile) return;
    this.savingProfile = true;
    this.error = '';
    this.success = '';
    this.auth.updateProfile(this.profileForm.getRawValue()).pipe(
      finalize(() => { this.savingProfile = false; this.changeDetector.markForCheck(); }),
    ).subscribe({
      next: (response) => { this.user = response.data; this.success = response.message; this.changeDetector.markForCheck(); },
      error: () => { this.error = 'Não foi possível salvar o perfil.'; this.changeDetector.markForCheck(); },
    });
  }
}
