import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  taskQueue: 'async',
  bundles: [
    { components: ['t-combobox'] },
    { components: ['t-combobox-choices', 't-combobox-list'] },
    { components: ['t-combobox-modal', 't-combobox-modal-list'] },
    { components: ['t-container'] },
    { components: ['t-message', 't-message-summary'] },
    { components: ['t-popup-menu-popover'] },
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
      type: 'dist',
      esmLoaderPath: '../loader'
    },
    {
      type: 'www',
      serviceWorker: null
    }
  ]
};
