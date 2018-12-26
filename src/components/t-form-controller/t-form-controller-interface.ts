export interface ProcessSubmitOptions {
  toastPosition: 'top' | 'bottom' | 'middle';
}

export interface IFormControllerMessages {
  sending?: string,
  timeout?: string,
  notFound?: string,
  forbidden?: string,
  badRequest?: string,
  internalServerError?: string
}

export const FormControllerDefaultMessages: IFormControllerMessages = {
  sending: 'Enviando...',
  timeout: 'O servidor demorou para responder, por favor, tente novamente',
  notFound: 'Não encontramos o que você está procurando',
  forbidden: 'Você não possui permissão para continuar',
  badRequest: 'Corrija o preenchimento de todos os campos',
  internalServerError: 'Ops! Erro interno do servidor'
};