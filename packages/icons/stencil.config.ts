import type { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'hero-antd-icons',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
    },
  ],
  testing: {
    browserHeadless: 'shell',
  },
};
