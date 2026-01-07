import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { Button } from 'antd';
import { html } from 'lit';
import React from 'react';
import ReactDOM from 'react-dom/client';

/**
 * # Button DOM Structure Comparison
 *
 * This page compares the DOM structure between **React Ant Design** and **Hero AntD Web Components**.
 *
 * Use browser DevTools to inspect and compare the rendered HTML structure.
 *
 * ## Icon Usage
 *
 * Hero AntD uses individual icon components for tree-shaking:
 *
 * ```html
 * <ant-btn type="primary">
 *   <ant-icon-search-outlined slot="icon" />
 *   Search
 * </ant-btn>
 * ```
 *
 * Available icons: All 831 icons from @ant-design/icons-svg
 * Pattern: `<ant-icon-{name}-{theme} />` (e.g., search-outlined, plus-filled, home-twotone)
 */
const meta: Meta = {
  title: 'Comparison/Button',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// Custom element to render React Ant Design buttons
class ReactAntdButtons extends HTMLElement {
  private root?: ReactDOM.Root;

  connectedCallback() {
    this.root = ReactDOM.createRoot(this);
    this.root.render(
      React.createElement(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
        // Default button
        React.createElement(
          'div',
          {
            className: 'comparison-row',
            style: { display: 'flex', gap: '8px', alignItems: 'center' },
          },
          React.createElement(
            'label',
            { style: { minWidth: '100px', fontWeight: 500 } },
            'Default:'
          ),
          React.createElement(Button, {}, 'Button')
        ),
        // Primary button
        React.createElement(
          'div',
          {
            className: 'comparison-row',
            style: { display: 'flex', gap: '8px', alignItems: 'center' },
          },
          React.createElement(
            'label',
            { style: { minWidth: '100px', fontWeight: 500 } },
            'Primary:'
          ),
          React.createElement(Button, { type: 'primary' }, 'Button')
        ),
        // With Icon
        React.createElement(
          'div',
          {
            className: 'comparison-row',
            style: { display: 'flex', gap: '8px', alignItems: 'center' },
          },
          React.createElement(
            'label',
            { style: { minWidth: '100px', fontWeight: 500 } },
            'With Icon:'
          ),
          React.createElement(
            Button,
            { type: 'primary', icon: React.createElement(SearchOutlined) },
            'Search'
          )
        ),
        // Icon Only
        React.createElement(
          'div',
          {
            className: 'comparison-row',
            style: { display: 'flex', gap: '8px', alignItems: 'center' },
          },
          React.createElement(
            'label',
            { style: { minWidth: '100px', fontWeight: 500 } },
            'Icon Only:'
          ),
          React.createElement(Button, {
            type: 'primary',
            shape: 'circle',
            icon: React.createElement(PlusOutlined),
          })
        )
      )
    );
  }

  disconnectedCallback() {
    this.root?.unmount();
  }
}

if (!customElements.get('react-antd-buttons')) {
  customElements.define('react-antd-buttons', ReactAntdButtons);
}

/**
 * Side-by-side comparison of React Ant Design and Hero AntD buttons.
 *
 * Open browser DevTools and inspect the elements to compare:
 * - React wraps icons in `<span class="anticon">`
 * - React wraps text in `<span>`
 * - Hero AntD uses slots for icons with individual icon components
 */
export const LiveComparison: Story = {
  render: () => html`
    <style>
      .comparison-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        padding: 16px;
      }
      .comparison-section {
        border: 1px solid #d9d9d9;
        border-radius: 8px;
        padding: 16px;
      }
      .comparison-section h3 {
        margin-top: 0;
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 1px solid #f0f0f0;
        font-size: 16px;
      }
      .comparison-row {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 16px;
      }
      .comparison-row label {
        min-width: 100px;
        font-weight: 500;
      }
      .hint {
        color: #888;
        font-size: 12px;
        margin-top: 8px;
      }
    </style>

    <div class="comparison-grid">
      <div class="comparison-section">
        <h3>React Ant Design (Reference)</h3>
        <react-antd-buttons></react-antd-buttons>
        <p class="hint">Inspect in DevTools to see expected DOM structure</p>
      </div>

      <div class="comparison-section">
        <h3>Hero AntD Web Component</h3>

        <div class="comparison-row">
          <label>Default:</label>
          <ant-btn>Button</ant-btn>
        </div>

        <div class="comparison-row">
          <label>Primary:</label>
          <ant-btn type="primary">Button</ant-btn>
        </div>

        <div class="comparison-row">
          <label>With Icon:</label>
          <ant-btn type="primary">
            <ant-icon-search-outlined slot="icon"></ant-icon-search-outlined>
            Search
          </ant-btn>
        </div>

        <div class="comparison-row">
          <label>Icon Only:</label>
          <ant-btn type="primary" shape="circle">
            <ant-icon-plus-outlined slot="icon"></ant-icon-plus-outlined>
          </ant-btn>
        </div>

        <p class="hint">Using tree-shakeable icon components</p>
      </div>
    </div>
  `,
};
