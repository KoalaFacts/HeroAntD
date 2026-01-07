import type { Preview } from '@storybook/web-components-vite';
import { withThemeByDataAttribute } from '@storybook/addon-themes';

// Import Ant Design tokens and styles
import '@hero-antd/tokens';
import '@hero-antd/tokens/dark.css';
import '@hero-antd/tokens/compact.css';

// Register Stencil web components globally
import { defineCustomElements } from '@hero-antd/core/loader';
defineCustomElements();

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
  decorators: [
    withThemeByDataAttribute({
      themes: {
        light: '',
        dark: 'dark',
        compact: 'compact',
      },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
  ],
};

export default preview;
