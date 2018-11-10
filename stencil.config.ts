import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
import sassInlineSvg from 'sass-inline-svg';

export const config: Config = {
  bundles: [
    { components: ['t-combobox'] },
    { components: ['t-combobox-choices'] },
    { components: ['t-combobox-modal', 't-combobox-modal-list'] },
    { components: ['t-container'] },
    { components: ['t-form-controller', 't-validation-controller'] },
    { components: ['t-message', 't-message-summary'] },
    { components: ['t-popup-menu-controller', 't-popup-menu-popover'] },
    { components: ['t-select', 't-select-option'] },
  ],
  plugins: [
    sass()
  ],
  copy: [
    { src: 'tests' }
  ],
  namespace: 'TempusDigitalIonic',
  outputTargets:[
    {
      type: 'dist'
    },
    {
      type: 'www',
      serviceWorker: null
    }
  ]
};
