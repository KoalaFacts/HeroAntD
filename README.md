# HeroAntD Development Guide

Web Components library porting [Ant Design](https://ant.design/) React to framework-agnostic Web Components.

## Project Structure

```
packages/
├── core/                 # Stencil Web Components
│   ├── src/components/   # Component source files
│   └── scripts/          # scaffold helper
├── tokens/               # Ant Design CSS & design tokens
│   └── dist/components/  # Extracted component CSS
└── docs/                 # Storybook documentation
    └── stories/          # Component stories
```

## Setup

```bash
bun install
bun run build
```

---

# Porting a Component

## Step 1: Scaffold Component

Run the scaffold script to see React Ant Design types and props.
It will fail if the component already exists in the codebase.

```bash
cd packages/core
bun run scaffold <component-name>
```

Example:
```bash
bun run scaffold button
```

This outputs:
- **EXTRACTED TYPES** → Copy these directly to your component
- **.d.ts content** → Review for props, events, methods

## Step 2: Create Component File

```bash
mkdir packages/core/src/components/<name>
```

Create `packages/core/src/components/<name>/<name>.tsx`:

```tsx
import { Component, Prop, Event, EventEmitter, Method, Element, h, Host } from '@stencil/core';

// 1. Paste extracted types
export type ButtonType = 'default' | 'primary' | 'dashed' | 'link' | 'text';

@Component({
  tag: 'ant-<css-prefix>',  // Must match CSS class prefix
  shadow: false,             // Light DOM to use Ant Design CSS
})
export class Button {
  @Element() el!: HTMLElement;

  // 2. Add props from .d.ts review
  @Prop() type: ButtonType = 'default';
  @Prop() disabled: boolean = false;

  // 3. Add events (rename: onClick → btnClick)
  @Event() btnClick!: EventEmitter<MouseEvent>;

  // 4. Add methods (from ref)
  @Method()
  async setFocus(): Promise<void> {
    // implementation
  }

  // 5. Build CSS class string
  private getClassString(): string {
    return [
      'ant-btn',
      this.disabled && 'ant-btn-disabled',
    ].filter(Boolean).join(' ');
  }

  // 6. Render with slots for ReactNode props
  render() {
    return (
      <Host>
        <button class={this.getClassString()} disabled={this.disabled}>
          <slot name="icon" />
          <slot />
        </button>
      </Host>
    );
  }
}
```

## Step 3: Build

```bash
cd packages/core
bun run build
```

## Step 4: Create Storybook Story

Create `packages/docs/stories/<Name>.stories.ts`:

```ts
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
  title: 'Components/<Name>',
  tags: ['autodocs'],
  argTypes: {
    // Add controls for each prop
  },
  render: (args) => html`<ant-<name> ...>${args.label}</ant-<name>>`,
};

export default meta;
type Story = StoryObj;

export const Default: Story = { args: { label: 'Default' } };
```

## Step 5: Test

```bash
cd packages/docs
bun run dev
```

---

# Reference

## React → Stencil Mapping

| React | Stencil | Example |
|-------|---------|---------|
| Props in interface | `@Prop()` | `@Prop() disabled: boolean` |
| `children` | `<slot>` | `<slot />` |
| `icon: ReactNode` | `<slot name="icon">` | `<slot name="icon" />` |
| `prefix: ReactNode` | `<slot name="prefix">` | `<slot name="prefix" />` |
| `onClick` | `@Event()` | `@Event() btnClick` |
| `onChange` | `@Event()` | `@Event() inputChange` |
| `ref.focus()` | `@Method()` | `@Method() async setFocus()` |
| `className` | Skip | Use CSS classes |
| `style` | Skip | Use CSS |
| `prefixCls` | Skip | Internal only |
| `classNames` | Skip | Semantic styles |

## Naming Conventions

| React Component | Tag Name | CSS Prefix |
|-----------------|----------|------------|
| Button | `<ant-btn>` | `.ant-btn` |
| Input | `<ant-input>` | `.ant-input` |
| Select | `<ant-select>` | `.ant-select` |
| Checkbox | `<ant-checkbox>` | `.ant-checkbox` |
| Switch | `<ant-switch>` | `.ant-switch` |
| Tag | `<ant-tag>` | `.ant-tag` |

**Tag name must match the CSS class prefix** from `@hero-antd/tokens`.

## Key Principles

1. **No custom CSS** - All styles come from `@hero-antd/tokens`
2. **Light DOM** - Always use `shadow: false` to inherit Ant Design CSS
3. **Match React API** - Keep props, types, and behavior as close as possible
4. **Slots for ReactNode** - `icon`, `prefix`, `suffix` become named slots

## CSS Class Patterns

Most Ant Design components follow these patterns:

```tsx
// Base class
'ant-btn'

// Size variants
'ant-btn-sm'     // size="small"
'ant-btn-lg'     // size="large"

// State classes
'ant-btn-disabled'
'ant-btn-loading'

// Variant classes
'ant-btn-primary'
'ant-btn-dashed'
```

Check `packages/tokens/dist/components/<prefix>.css` for available classes.

---

# Scripts

All scripts can be run from the project root:

```bash
# Common
bun install                   # Install all dependencies
bun run dev                   # Start Storybook (most common)
bun run build                 # Build all packages
bun run scaffold <name>       # Scaffold new component

# Targeted
bun run dev:all               # Dev mode for all packages
bun run dev:core              # Stencil dev server only
bun run dev:tokens            # Tokens watch mode
bun run build:core            # Build core only
bun run build:tokens          # Build tokens only
bun run build:docs            # Build Storybook for deployment
bun run test                  # Run all tests
```
