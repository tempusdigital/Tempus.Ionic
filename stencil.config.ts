import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  bundles: [
    { components: ['t-combobox'] },
    { components: ['t-combobox2', 't-combobox-list2'] },
    { components: ['t-combobox-choices'] },
    { components: ['t-combobox-modal', 't-combobox-modal-list'] },
    { components: ['t-container'] },
    { components: ['t-action-controller', 't-validation-controller'] },
    { components: ['t-message', 't-message-summary'] },
    { components: ['t-popup-menu-controller', 't-popup-menu-popover'] },
    { components: ['t-select', 't-select-option'] },
  ],
  plugins: [
    sass()
  ],
  copy: [
    { src: 'tests' },
    { src: '..\\node_modules\\@ionic', dest: '@ionic' }
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
