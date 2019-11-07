import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
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
