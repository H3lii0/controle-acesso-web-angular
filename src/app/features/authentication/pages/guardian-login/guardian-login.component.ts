import { Component } from '@angular/core';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-guardian-login',
  imports: [LoginComponent],
  template: '<app-login mode="guardian"></app-login>',
})
export class GuardianLoginComponent {}
