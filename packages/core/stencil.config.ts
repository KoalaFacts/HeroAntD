import type { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
import { resolve } from 'path';
import type { Plugin } from 'rollup';

/**
 * Rollup plugin to resolve ~@hero-antd/* paths to node_modules
 * This allows using clean package paths in styleUrl
 */
function resolveHeroAntd(): Plugin {
  return {
    name: 'resolve-hero-antd',
    resolveId(source) {
      // Handle paths like ./~@hero-antd/... or ~@hero-antd/...
      const match = source.match(/^(?:\.\/)?~@hero-antd\/(.+)/);
      if (match) {
        return resolve(__dirname, 'node_modules/@hero-antd', match[1]);
      }
      return null;
    },
  };
}

export const config: Config = {
  namespace: 'hero-antd',
  globalStyle: 'src/styles/index.scss',
  plugins: [
    sass({
      includePaths: ['node_modules'],
    }),
  ],
  rollupPlugins: {
    before: [resolveHeroAntd()],
  },
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
    },
    {
      type: 'www',
      serviceWorker: null,
    },
  ],
  testing: {
    browserHeadless: 'shell',
  },
};
