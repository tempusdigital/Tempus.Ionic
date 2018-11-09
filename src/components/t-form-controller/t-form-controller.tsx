import { Component, Method, Prop } from "@stencil/core";
import { ProcessSubmitOptions } from './t-form-controller-interface';
import { FormValidationMessages } from "../t-validation-controller/t-validation-controller-interface";

@Component({
  tag: 't-form-controller',
  styleUrl: 't-form-controller.scss'
})
export class TFormController {
  private messages = {
    badRequest: 'Corrija o preenchimento de todos os campos',
    forbidden: 'Você não possui permissão para continuar',
    notFound: 'Não encontramos o que você está procurando',
    timeout: 'O servidor demorou para responder, por favor, tente novamente',
    internalServerError: 'Ops! Erro interno do servidor',
    sending: 'Enviando...'
  };

  @Prop({ context: 'window' }) win!: Window;

  @Prop({ connect: 'ion-toast-controller' }) toastController: any;

  @Prop({ connect: 'ion-loading-controller' }) loadingController: any;

  validationController: any;

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
  @Method()
  async processSubmit(form: HTMLFormElement, action?: () => any, options?: ProcessSubmitOptions): Promise<boolean> {
    let toastPosition = options && options.toastPosition || 'bottom';

    this.validationController.componentOnReady();

    this.validationController.clearCustomValidity(form);

    let valid = await await this.validationController.reportValidity(form);

    if (!valid) {
      await this.showToast(this.messages.badRequest, toastPosition);
      return false;
    }

    let loading = null;

    if (action)
      try {
        loading = await this.showLoading();

        let actionResult = action();

        if (actionResult && 'then' in actionResult)
          await actionResult;
      }
      catch (e) {
        if (e && e.status == 400 && e.json)
          this.processStatus400(form, await e.json());

        loading.dismiss();

        let toastMessage = this.getToastMessage(e);
        this.showToast(toastMessage, toastPosition);

        return false;
      }

    this.validationController && this.validationController.reportValidity(form);
    
    loading && loading.dismiss();

    return true;
  }

  @Method()
  async getValidationController() {
    await this.validationController.componentOnReady();
    return this.validationController;
  }

  private async showLoading() {
    await this.loadingController.componentOnReady();
    let loading = await this.loadingController.create({
      showBackdrop: true,
      translucent: true,
      message: this.messages.sending
    });

    await loading.present();

    return loading;
  }

  private getToastMessage(e: Response) {
    switch (e && e.status) {
      case 400:
        return this.messages.badRequest;

      case 401:
      case 403:
        return this.messages.forbidden;

      case 404:
        return this.messages.notFound;

      case 408:
      case 502:
      case 504:
        return this.messages.timeout;

      default:
        return this.messages.internalServerError;
    }
  }

  private async processStatus400(form: HTMLFormElement, data: any) {
    this.validationController.clearCustomValidity(form);

    let messages = await this.getServerValidationMessages(data);

    if (messages)
      this.validationController.setCustomValidity(form, messages);

    await this.validationController.reportValidity(form);

    await this.showToast(this.messages.badRequest);
  }

  private async showToast(message: string, position: 'top' | 'bottom' | 'middle' = 'bottom') {
    await this.toastController.componentOnReady();

    let toast = await this.toastController.create({
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

  render() {
    return (<t-validation-controller ref={e => this.validationController = e as any}></t-validation-controller>);
  }
}
