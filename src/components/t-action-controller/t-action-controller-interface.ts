export interface ProcessOptions {
  toastPosition: 'top' | 'bottom' | 'middle';
  showLoading: boolean;
}

export interface IActionControllerMessages {
  sending?: string,
  timeout?: string,
  notFound?: string,
  forbidden?: string,
  badRequest?: string,
  internalServerError?: string
}

export const ActionControllerDefaultMessages: IActionControllerMessages = {
  sending: 'Enviando...',
  timeout: 'O servidor demorou para responder, por favor, tente novamente',
  notFound: 'Não encontramos o que você está procurando',
  forbidden: 'Você não possui permissão para continuar',
  badRequest: 'Corrija o preenchimento de todos os campos',
  internalServerError: 'Ops! Erro interno do servidor'
};