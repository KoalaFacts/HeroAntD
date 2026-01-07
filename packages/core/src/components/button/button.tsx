import { Component, Element, Host, h, Method, Prop } from '@stencil/core';

import type { SizeType } from '@/types/shared';

// Reference: antd/es/button/Button.d.ts

// =============================================================================
// BUTTON TYPES
// =============================================================================

export type ButtonType = 'default' | 'primary' | 'dashed' | 'link' | 'text';
export type ButtonShape = 'default' | 'circle' | 'round';
export type ButtonHTMLType = 'submit' | 'button' | 'reset';
export type ButtonVariantType = 'outlined' | 'dashed' | 'solid' | 'filled' | 'text' | 'link';
export type ButtonColorType =
  | 'default'
  | 'primary'
  | 'danger'
  | 'blue'
  | 'purple'
  | 'cyan'
  | 'green'
  | 'magenta'
  | 'pink'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'volcano'
  | 'geekblue'
  | 'lime'
  | 'gold';
export type ButtonIconPlacement = 'start' | 'end';

const cls = 'ant-btn';

/**
 * Converts legacy `type` prop to `color` and `variant` equivalents.
 * type="primary" => color="primary", variant="solid"
 * type="dashed" => color="default", variant="dashed"
 * type="link" => color="primary", variant="link"
 * type="text" => color="default", variant="text"
 * type="default" => color="default", variant="outlined"
 */
function convertTypeToColorVariant(type?: ButtonType): {
  color: ButtonColorType;
  variant: ButtonVariantType;
} {
  switch (type) {
    case 'primary':
      return { color: 'primary', variant: 'solid' };
    case 'dashed':
      return { color: 'default', variant: 'dashed' };
    case 'link':
      return { color: 'primary', variant: 'link' };
    case 'text':
      return { color: 'default', variant: 'text' };
    case 'default':
    default:
      return { color: 'default', variant: 'outlined' };
  }
}

@Component({
  tag: 'ant-btn',
  shadow: false,
  styleUrls: [
    '~@hero-antd/tokens/dist/components/btn.css',
    '~@hero-antd/tokens/dist/components/wave.css',
  ],
})
export class Button {
  @Element() el!: HTMLElement;

  // ==========================================================================
  // PROPS
  // ==========================================================================

  /**
   * Button type (legacy shorthand for color + variant)
   * @default 'default'
   */
  @Prop() type: ButtonType = 'default';

  /**
   * Button color scheme
   * When specified, takes precedence over type
   */
  @Prop() color?: ButtonColorType;

  /**
   * Button visual variant
   * When specified, takes precedence over type
   */
  @Prop() variant?: ButtonVariantType;

  /**
   * Button shape
   * @default 'default'
   */
  @Prop() shape: ButtonShape = 'default';

  /**
   * Button size
   * @default 'middle'
   */
  @Prop() size: SizeType = 'middle';

  /**
   * HTML button type attribute
   * @default 'button'
   */
  @Prop() htmlType: ButtonHTMLType = 'button';

  /**
   * Disabled state
   */
  @Prop() disabled?: boolean;

  /**
   * Loading state - shows spinner and disables interaction
   */
  @Prop() loading?: boolean;

  /**
   * Make button transparent with colored text/border
   */
  @Prop() ghost?: boolean;

  /**
   * Use danger/error color scheme
   */
  @Prop() danger?: boolean;

  /**
   * Make button full width
   */
  @Prop() block?: boolean;

  /**
   * Hyperlink URL - renders as <a> instead of <button>
   */
  @Prop() href?: string;

  /**
   * Link target attribute (when href is set)
   */
  @Prop() target?: string;

  /**
   * Icon placement relative to content
   * @default 'start'
   */
  @Prop() iconPlacement: ButtonIconPlacement = 'start';

  /**
   * Auto-insert space between two Chinese characters
   * @default true
   */
  @Prop() autoInsertSpace: boolean = true;

  // ==========================================================================
  // METHODS
  // ==========================================================================

  private buttonRef?: HTMLButtonElement | HTMLAnchorElement;

  /** Sets focus on the button element */
  @Method()
  async setFocus() {
    this.buttonRef?.focus();
  }

  /** Removes focus from the button element */
  @Method()
  async setBlur() {
    this.buttonRef?.blur();
  }

  // ==========================================================================
  // INTERNAL
  // ==========================================================================

  private hasIcon = false;
  private hasContent = false;

  /**
   * Show wave effect using direct DOM manipulation (like React version)
   * Creates a wave element, appends it, and removes after animation
   */
  private showWave() {
    const target = this.buttonRef;
    if (!target) return;

    // Skip for link/text variants
    const effectiveVariant = this.variant || convertTypeToColorVariant(this.type).variant;
    if (effectiveVariant === 'link' || effectiveVariant === 'text') return;

    // Create wave element
    const wave = document.createElement('span');
    wave.className = 'ant-wave';

    // Insert at beginning of button (like React does)
    target.insertBefore(wave, target.firstChild);

    // Remove after animation completes
    wave.addEventListener('animationend', () => {
      wave.remove();
    });
  }

  /**
   * Handle click - triggers wave effect
   */
  private handleClick = () => {
    if (this.disabled || this.loading) return;
    this.showWave();
  };

  /**
   * Check if slotted content exists
   */
  private checkSlots() {
    const iconSlot = this.el.querySelector('[slot="icon"]');
    this.hasIcon = !!iconSlot;

    // Check for default slot content (text or elements)
    const childNodes = Array.from(this.el.childNodes).filter((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent?.trim() !== '';
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        return !el.hasAttribute('slot');
      }
      return false;
    });
    this.hasContent = childNodes.length > 0;
  }

  /**
   * Build the class string based on all props
   */
  private getClassString(): string {
    // Determine effective color and variant
    // Explicit color/variant props take precedence over type
    // Use || instead of ?? to handle empty strings from Storybook controls
    const { color: typeColor, variant: typeVariant } = convertTypeToColorVariant(this.type);
    const effectiveColor = this.danger ? 'dangerous' : this.color || typeColor;
    const effectiveVariant = this.variant || typeVariant;

    // Map color to CSS class name
    // 'danger' prop maps to 'dangerous' class, 'default' stays as 'default'
    const colorClass = effectiveColor === 'danger' ? 'dangerous' : effectiveColor;

    return [
      cls,
      // Color
      colorClass && `${cls}-color-${colorClass}`,
      // Variant
      effectiveVariant && `${cls}-variant-${effectiveVariant}`,
      // Size (only for non-middle)
      this.size === 'small' && `${cls}-sm`,
      this.size === 'large' && `${cls}-lg`,
      // Shape
      this.shape === 'circle' && `${cls}-circle`,
      this.shape === 'round' && `${cls}-round`,
      // States
      this.disabled && `${cls}-disabled`,
      this.loading && `${cls}-loading`,
      this.block && `${cls}-block`,
      this.ghost && `${cls}-background-ghost`,
      // Icon position
      this.iconPlacement === 'end' && `${cls}-icon-end`,
      // Icon only (no text content)
      this.hasIcon && !this.hasContent && `${cls}-icon-only`,
    ]
      .filter(Boolean)
      .join(' ');
  }

  /**
   * Render loading spinner using Ant Design's dot spinner structure
   * Uses antRotate keyframe animation extracted from Ant Design
   */
  private renderLoadingIcon() {
    return (
      <span class={`${cls}-loading-icon`}>
        <span class="ant-spin">
          <span class="ant-spin-dot ant-spin-dot-spin">
            <i class="ant-spin-dot-item" />
            <i class="ant-spin-dot-item" />
            <i class="ant-spin-dot-item" />
            <i class="ant-spin-dot-item" />
          </span>
        </span>
      </span>
    );
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  componentWillRender() {
    this.checkSlots();
  }

  render() {
    const isDisabled = this.disabled || this.loading;
    const isAnchor = !!this.href && !isDisabled;

    const innerContent = [
      // Loading icon (shown when loading)
      this.loading && this.renderLoadingIcon(),
      // Icon slot - icon components already include .anticon wrapper
      // Structure: <span class="ant-btn-icon"><slot name="icon" /></span>
      this.hasIcon && (
        <span class={`${cls}-icon`}>
          <slot name="icon" />
        </span>
      ),
      // Default slot - wrapped in span (matches Ant Design structure)
      // Ant Design renders: <button><span>text</span></button>
      this.hasContent && (
        <span>
          <slot />
        </span>
      ),
    ];

    const classString = this.getClassString();

    if (isAnchor) {
      return (
        <Host>
          <a
            class={classString}
            href={this.href}
            target={this.target}
            ref={(el?: HTMLAnchorElement) => (this.buttonRef = el)}
            onClick={this.handleClick}
          >
            {innerContent}
          </a>
        </Host>
      );
    }

    return (
      <Host>
        <button
          class={classString}
          type={this.htmlType}
          disabled={isDisabled}
          aria-disabled={isDisabled ? 'true' : undefined}
          ref={(el?: HTMLButtonElement) => (this.buttonRef = el)}
          onClick={this.handleClick}
        >
          {innerContent}
        </button>
      </Host>
    );
  }
}
