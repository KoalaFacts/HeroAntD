import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
  title: 'Components/Button',
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['default', 'primary', 'dashed', 'text', 'link'],
      description: 'Button type (legacy API, maps to color + variant)',
      table: { defaultValue: { summary: 'default' } },
    },
    color: {
      control: 'select',
      options: [
        'default', 'primary', 'danger', 'blue', 'purple', 'cyan', 'green',
        'magenta', 'pink', 'red', 'orange', 'yellow', 'volcano', 'geekblue', 'lime', 'gold',
      ],
      description: 'Button color',
    },
    variant: {
      control: 'select',
      options: ['outlined', 'dashed', 'solid', 'filled', 'text', 'link'],
      description: 'Button variant style',
    },
    shape: {
      control: 'select',
      options: ['default', 'circle', 'round', 'square'],
      description: 'Button shape',
      table: { defaultValue: { summary: 'default' } },
    },
    size: {
      control: 'select',
      options: ['small', 'middle', 'large'],
      description: 'Button size',
      table: { defaultValue: { summary: 'middle' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    loading: {
      control: 'boolean',
      description: 'Loading state',
    },
    ghost: {
      control: 'boolean',
      description: 'Ghost button (transparent background)',
    },
    danger: {
      control: 'boolean',
      description: 'Danger button (shorthand for color="danger")',
    },
    block: {
      control: 'boolean',
      description: 'Full width button',
    },
    iconPlacement: {
      control: 'select',
      options: ['start', 'end'],
      description: 'Icon placement',
      table: { defaultValue: { summary: 'start' } },
    },
    label: {
      control: 'text',
      description: 'Button text',
    },
  },
  render: (args) => html`
    <ant-btn
      type=${args.type || 'default'}
      color=${args.color || undefined}
      variant=${args.variant || undefined}
      shape=${args.shape || 'default'}
      size=${args.size || 'middle'}
      icon-placement=${args.iconPlacement || 'start'}
      ?disabled=${args.disabled}
      ?loading=${args.loading}
      ?ghost=${args.ghost}
      ?danger=${args.danger}
      ?block=${args.block}
    >
      ${args.label || 'Button'}
    </ant-btn>
  `,
};

export default meta;
type Story = StoryObj;

// ============ BASIC TYPES ============

export const Default: Story = {
  args: { label: 'Default' },
};

export const Primary: Story = {
  args: { label: 'Primary', type: 'primary' },
};

export const Dashed: Story = {
  args: { label: 'Dashed', type: 'dashed' },
};

export const Text: Story = {
  args: { label: 'Text', type: 'text' },
};

export const Link: Story = {
  args: { label: 'Link', type: 'link' },
};

// ============ SIZES ============

export const Sizes: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px; align-items: center;">
      <ant-btn size="small">Small</ant-btn>
      <ant-btn size="middle">Middle</ant-btn>
      <ant-btn size="large">Large</ant-btn>
    </div>
  `,
};

// ============ SHAPES ============

export const Shapes: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px; align-items: center;">
      <ant-btn type="primary">Default</ant-btn>
      <ant-btn type="primary" shape="round">Round</ant-btn>
      <ant-btn type="primary" shape="circle">A</ant-btn>
      <ant-btn type="primary" shape="square">B</ant-btn>
    </div>
  `,
};

// ============ COLORS ============

export const Colors: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <ant-btn color="default" variant="solid">Default</ant-btn>
      <ant-btn color="primary" variant="solid">Primary</ant-btn>
      <ant-btn color="danger" variant="solid">Danger</ant-btn>
      <ant-btn color="blue" variant="solid">Blue</ant-btn>
      <ant-btn color="purple" variant="solid">Purple</ant-btn>
      <ant-btn color="cyan" variant="solid">Cyan</ant-btn>
      <ant-btn color="green" variant="solid">Green</ant-btn>
      <ant-btn color="magenta" variant="solid">Magenta</ant-btn>
      <ant-btn color="red" variant="solid">Red</ant-btn>
      <ant-btn color="orange" variant="solid">Orange</ant-btn>
      <ant-btn color="gold" variant="solid">Gold</ant-btn>
    </div>
  `,
};

// ============ VARIANTS ============

export const Variants: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      <ant-btn color="primary" variant="solid">Solid</ant-btn>
      <ant-btn color="primary" variant="outlined">Outlined</ant-btn>
      <ant-btn color="primary" variant="dashed">Dashed</ant-btn>
      <ant-btn color="primary" variant="filled">Filled</ant-btn>
      <ant-btn color="primary" variant="text">Text</ant-btn>
      <ant-btn color="primary" variant="link">Link</ant-btn>
    </div>
  `,
};

// ============ STATES ============

export const Disabled: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px;">
      <ant-btn disabled>Disabled</ant-btn>
      <ant-btn type="primary" disabled>Primary Disabled</ant-btn>
    </div>
  `,
};

export const Loading: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px;">
      <ant-btn loading>Loading</ant-btn>
      <ant-btn type="primary" loading>Loading</ant-btn>
    </div>
  `,
};

export const Ghost: Story = {
  render: () => html`
    <div style="background: #1677ff; padding: 16px; display: flex; gap: 8px;">
      <ant-btn ghost>Ghost</ant-btn>
      <ant-btn type="primary" ghost>Primary Ghost</ant-btn>
      <ant-btn danger ghost>Danger Ghost</ant-btn>
    </div>
  `,
};

export const Danger: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px;">
      <ant-btn danger>Danger</ant-btn>
      <ant-btn danger variant="solid">Danger Solid</ant-btn>
      <ant-btn danger variant="dashed">Danger Dashed</ant-btn>
    </div>
  `,
};

export const Block: Story = {
  args: { label: 'Block Button', type: 'primary', block: true },
};

// ============ WITH ICON ============

export const WithIcon: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px; align-items: center;">
      <ant-btn type="primary">
        <svg slot="icon" viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor">
          <path d="M909.6 854.5L649.9 594.8C690.2 542.7 714 478.4 714 408c0-167.6-136.4-304-304-304S106 240.4 106 408s136.4 304 304 304c70.4 0 134.7-23.8 186.8-64.1l259.7 259.6a8.2 8.2 0 0011.6 0l51.5-51.5c3.2-3.2 3.2-8.4 0-11.5zM410 676c-147 0-266-119-266-266s119-266 266-266 266 119 266 266-119 266-266 266z"></path>
        </svg>
        Search
      </ant-btn>
      <ant-btn>
        <svg slot="icon" viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor">
          <path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"></path>
          <path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z"></path>
        </svg>
        Add
      </ant-btn>
      <ant-btn type="primary" shape="circle">
        <svg slot="icon" viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor">
          <path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"></path>
          <path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z"></path>
        </svg>
      </ant-btn>
    </div>
  `,
};

export const IconAtEnd: Story = {
  render: () => html`
    <ant-btn type="primary" icon-placement="end">
      Next
      <svg slot="icon" viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor">
        <path d="M765.7 486.8L314.9 134.7A7.97 7.97 0 00302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V k883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 000-50.4z"></path>
      </svg>
    </ant-btn>
  `,
};

// ============ LINK BUTTON ============

export const AsLink: Story = {
  render: () => html`
    <div style="display: flex; gap: 8px;">
      <ant-btn href="https://ant.design" target="_blank">Link to Ant Design</ant-btn>
      <ant-btn type="primary" href="https://ant.design" target="_blank">Primary Link</ant-btn>
    </div>
  `,
};
