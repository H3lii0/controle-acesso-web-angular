import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ErrorMessageService {
  getLoginMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const credentialMessage = this.getCredentialMessage(error);

      if (credentialMessage) {
        return credentialMessage;
      }

      if (error.status === 401 || error.status === 422) {
        return 'E-mail ou senha inválidos. Confira os dados e tente fazer login novamente.';
      }

      if (error.status === 0 || error.status >= 500) {
        return 'Não foi possível concluir o login agora. Verifique a conexão e tente novamente.';
      }
    }

    return 'Não foi possível concluir o login. Tente novamente em alguns instantes.';
  }

  private getCredentialMessage(error: HttpErrorResponse): string | null {
    const emailErrors = error.error?.errors?.email;

    if (Array.isArray(emailErrors) && typeof emailErrors[0] === 'string') {
      return emailErrors[0];
    }

    return null;
  }
}
