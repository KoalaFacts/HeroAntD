import { withThemeByDataAttribute } from '@storybook/addon-themes';
import type { Preview } from '@storybook/web-components-vite';

// Import foundation styles from core (base reset + light theme tokens)
// Component CSS is bundled with each component via shadow DOM
import '@hero-antd/core/styles.css';

// Import theme variants for dark/compact mode switching
import '@hero-antd/tokens/dark.css';
import '@hero-antd/tokens/compact.css';

// Register Stencil web components globally
import { defineCustomElements } from '@hero-antd/core/loader';
import { defineCustomElements as defineIconElements } from '@hero-antd/icons/loader';

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
  // Use loaders to ensure components are registered before stories render
  loaders: [
    async () => {
      await Promise.all([defineCustomElements(), defineIconElements()]);
      return {};
    },
  ],
};

export default preview;
