import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
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
  namespace: 'TempusDigitalIonic',
  outputTargets:[
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements-bundle',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
      copy: [
        { src: 'tests' },
        { src: '..\\node_modules\\@ionic\\core', dest: 'ionic'}
      ],
    },
  ]
};
