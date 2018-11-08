export interface PopupMenuOptions {
  event?: Event;
  mode?: any;
  id?: string;
  header?: string;
  cssClass?: string | string[];
  buttons: PopupMenuButton[];
  backdropDismiss?: boolean;
  translucent?: boolean;
  animated?: boolean;
  keyboardClose?: boolean;
}

export interface PopupMenuButton {
  text?: string;
  icon?: string;
  handler?: () => any;
}
