import { Component, Method, Prop, Watch } from "@stencil/core";
import { IActionControllerMessages, ActionControllerDefaultMessages as ActionControllerDefaultMessages, ProcessOptions } from './t-action-controller-interface';
import { FormValidationMessages } from "../t-validation-controller/t-validation-controller-interface";

@Component({
  tag: 't-action-controller',
  styleUrl: 't-action-controller.scss'
})
export class TActionController {

  private _internalMessages = { ...ActionControllerDefaultMessages };

  @Prop() messages: IActionControllerMessages;

  @Prop({ context: 'window' }) win!: Window;

  @Prop({ connect: 'ion-toast-controller' }) toastController: any;

  @Prop({ connect: 'ion-loading-controller' }) loadingController: any;

  validationController: any;

  componentWillLoad() {
    this.messagesChanged();
  }

  @Watch('messages')
  messagesChanged() {
    if (this.messages)
      this._internalMessages = { ...ActionControllerDefaultMessages, ...this.messages };
    else
      this._internalMessages = { ...ActionControllerDefaultMessages };
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
  @Method()
  async processSubmit(form: HTMLFormElement, action?: () => any, options?: ProcessOptions): Promise<boolean> {
    let showLoading = !options || options.showLoading === true;
    let toastPosition = options && options.toastPosition || 'bottom';

    await this.validationController.componentOnReady();

    await this.validationController.clearCustomValidity(form);

    let valid = await await this.validationController.reportValidity(form);

    if (!valid) {
      await this.showToast(this._internalMessages.badRequest, toastPosition);
      return false;
    }

    let loading = null;

    if (action)
      try {
        loading = showLoading && await this.showLoading();

        let actionResult = action();

        if (actionResult && 'then' in actionResult)
          await actionResult;
      }
      catch (e) {
        if (e && e.status == 400 && e.json)
          this.processFormStatus400(form, await e.json());

        loading && loading.dismiss();

        let toastMessage = this.getToastMessage(e);
        this.showToast(toastMessage, toastPosition);

        return false;
      }
      finally {
        loading && loading.dismiss();
      }

    this.validationController && this.validationController.reportValidity(form);

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
  @Method()
  async processAction(action?: () => any, options?: ProcessOptions): Promise<boolean> {
    let showLoading = !options || options.showLoading === true;
    let toastPosition = options && options.toastPosition || 'bottom';

    let loading = null;

    if (action)
      try {
        loading = showLoading && await this.showLoading();

        let actionResult = action();

        if (actionResult && 'then' in actionResult)
          await actionResult;
      }
      catch (e) {
        loading && loading.dismiss();

        if (e && e.status == 400 && e.json) {
          this.processActionStatus400(await e.json());
          return;
        }

        let toastMessage = this.getToastMessage(e);
        this.showToast(toastMessage, toastPosition);

        return false;
      }
      finally {
        loading && loading.dismiss();
      }

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
      message: this._internalMessages.sending
    });

    await loading.present();

    return loading;
  }

  private getToastMessage(e: Response) {
    switch (e && e.status) {
      case 400:
        return this._internalMessages.badRequest;

      case 401:
      case 403:
        return this._internalMessages.forbidden;

      case 404:
        return this._internalMessages.notFound;

      case 408:
      case 502:
      case 504:
        return this._internalMessages.timeout;

      default:
        return this._internalMessages.internalServerError;
    }
  }

  private async processFormStatus400(form: HTMLFormElement, data: any) {
    this.validationController.clearCustomValidity(form);

    let messages = await this.getServerValidationMessages(data);

    if (messages)
      this.validationController.setCustomValidity(form, messages);

    await this.validationController.reportValidity(form);

    await this.showToast(this._internalMessages.badRequest);
  }

  private async processActionStatus400(data: any) {
    let messages = await this.getServerValidationMessages(data);

    if (messages && messages.length)
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

    await this.showToast(this._internalMessages.badRequest);
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
