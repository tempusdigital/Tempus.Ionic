import { ActionControllerDefaultMessages as ActionControllerDefaultMessages, ProcessOptions as ActionProcessOptions } from './t-action-controller-interface';
import { FormValidationMessages } from "../t-validation-controller/t-validation-controller-interface";
import { toastController, loadingController } from '@ionic/core';
import { validationController } from '../..';

const DefaultOptions : ActionProcessOptions ={
  messages: ActionControllerDefaultMessages,
  showLoading: true,
  toastPosition: 'bottom'
};

class ActionController {

  private getOptions(options?: ActionProcessOptions) {
    if (!options)
      return DefaultOptions;

    return {
      ...DefaultOptions,
      ...options,
      messages: {
        ...DefaultOptions.messages,
        ...options.messages
      }
    };
  }

  public async validate(form: HTMLFormElement) {
    await validationController.clearCustomValidity(form);

    let valid = await validationController.reportValidity(form);

    return valid;
  }

  /**
   * Processa as mensagens pra execução do submit de um formulário:
   * - Exibe mensagem de "Carregando..." 
   * - Impede alterações dos campos e reenvio do formulário até terminar o submit
   * - Exibe validações locais
   * - Exibe validações do servidor (retornadas com o status 400)
   * - Exibe avisos de erros de servidor
   * @param form Formulário
   * @param action Ação para ser executada como submit do formulário. Geralmente nesta ação é enviado o formulário para o servidor.
   */
  public async processSubmit(form: HTMLFormElement, action?: () => any, options?: ActionProcessOptions): Promise<boolean> {
    options = this.getOptions(options);
 
    let valid = await this.validate(form);

    if (!valid) {
      await this.showToast(options.messages.badRequest, options.toastPosition);
      return false;
    }

    let loading = null;

    if (action)
      try {
        loading = options.showLoading && await this.showLoading(options);

        let actionResult = action();

        if (actionResult && 'then' in actionResult)
          await actionResult;
      }
      catch (e) {
        if (e && e.status == 400 && e.json)
          this.processFormStatus400(form, await e.json(), options);

        loading && loading.dismiss();

        let toastMessage = this.getToastMessage(e, options);
        this.showToast(toastMessage, options.toastPosition);

        return false;
      }
      finally {
        loading && loading.dismiss();
      }

    validationController.reportValidity(form);

    loading && loading.dismiss();

    return true;
  }

  /**
 * Processa as mensagens pra execução do submit de um formulário:
 * - Exibe mensagem de "Carregando..." 
 * - Impede alterações dos campos e reenvio do formulário até terminar o submit
 * - Exibe validações locais
 * - Exibe validações do servidor (retornadas com o status 400)
 * - Exibe avisos de erros de servidor
 * @param form Formulário
 * @param action Ação para ser executada como submit do formulário. Geralmente nesta ação é enviado o formulário para o servidor.
 */
  public async processAction(action?: () => any, options?: ActionProcessOptions): Promise<boolean> {
    options = this.getOptions(options);

    let loading = null;

    if (action)
      try {
        loading = options.showLoading && await this.showLoading(options);

        let actionResult = action();

        if (actionResult && 'then' in actionResult)
          await actionResult;
      }
      catch (e) {
        loading && loading.dismiss();

        if (e && e.status == 400 && e.json) {
          this.processActionStatus400(await e.json(), options);
          return;
        }

        let toastMessage = this.getToastMessage(e, options);
        this.showToast(toastMessage, options.toastPosition);

        return false;
      }
      finally {
        loading && loading.dismiss();
      }

    loading && loading.dismiss();

    return true;
  }

  private async showLoading(options: ActionProcessOptions) {
    let loading = await loadingController.create({
      showBackdrop: true,
      translucent: true,
      message: options.messages.sending
    });

    await loading.present();

    return loading;
  }

  private getToastMessage(e: Response, options: ActionProcessOptions) {
    switch (e && e.status) {
      case 400:
        return options.messages.badRequest;

      case 401:
      case 403:
        return options.messages.forbidden;

      case 404:
        return options.messages.notFound;

      case 408:
      case 502:
      case 504:
        return options.messages.timeout;

      default:
        return options.messages.internalServerError;
    }
  }

  private async processFormStatus400(form: HTMLFormElement, data: any, options: ActionProcessOptions) {
    validationController.clearCustomValidity(form);

    let messages = this.getServerValidationMessages(data);

    if (messages)
      validationController.setCustomValidity(form, messages);

    await validationController.reportValidity(form);

    await this.showToast(options.messages.badRequest);
  }

  private async processActionStatus400(data: any, options: ActionProcessOptions) {
    let messages = this.getServerValidationMessages(data);

    if (messages)
      for (let field in messages) {
        let fieldMessages = messages[field];
        if (fieldMessages && fieldMessages.length) {
          if (field != 'global' && field != 'Global')
            await this.showToast(field + ': ' + fieldMessages[0]);
          else
            await this.showToast(fieldMessages[0]);

          return;
        }
      }

    await this.showToast(options.messages.badRequest);
  }

  private async showToast(message: string, position: 'top' | 'bottom' | 'middle' = 'bottom') {
    let toast = await toastController.create({
      cssClass: 't-toast-validation',
      message: message,
      duration: 5000,
      position: position
    });

    await toast.present();

    return toast;
  }

  /**
   * Retorna as mensagens de validação de uma resposta do servidor.
   * O servidor deve retornar as validações como json e seguindo o schema:
   * {
   *   errors: {
   *     [elementName: string] : string | string[] | { text: string }[]
   *   }
   * }
   * @param e
   */
  private getServerValidationMessages(data: any): FormValidationMessages {
    if (!data || !data.errors)
      return null;

    let result: FormValidationMessages = {};
    let hasErrors = false;

    for (let errorKey in data.errors) {
      let messages = data.errors[errorKey];

      if (!messages || !messages.length)
        continue;

      let elementName = this.normalizeName(errorKey);

      if (typeof messages === 'string')
        messages = [messages];

      messages = messages.map(m => m && m.text || m).filter(m => !!m && typeof m === 'string');

      if (messages.length) {
        result[elementName] = messages;
        hasErrors = true;
      }
    }

    if (hasErrors)
      return result;

    return null;
  }

  private normalizeName(elementName: string) {
    return elementName.substr(0, 1).toLowerCase() + elementName.substr(1, elementName.length - 1);
  }
}

export const actionController = new ActionController();