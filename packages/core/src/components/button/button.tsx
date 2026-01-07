import { Component, Prop, Event, EventEmitter, Method, Element, h, Host } from '@stencil/core';

/**
 * Button type (legacy API, maps to color + variant)
 */
export type ButtonType = 'default' | 'primary' | 'dashed' | 'link' | 'text';

/**
 * Button shape
 */
export type ButtonShape = 'default' | 'circle' | 'round' | 'square';

/**
 * HTML button type attribute
 */
export type ButtonHTMLType = 'submit' | 'button' | 'reset';

/**
 * Button variant style
 */
export type ButtonVariant = 'outlined' | 'dashed' | 'solid' | 'filled' | 'text' | 'link';

/**
 * Button color
 */
export type ButtonColor =
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

/**
 * Button size
 */
export type ButtonSize = 'small' | 'middle' | 'large';

/**
 * Icon placement
 */
export type IconPlacement = 'start' | 'end';

/**
 * @component ant-btn
 * @description A button component that matches Ant Design Button API.
 *
 * @slot - Default slot for button text content
 * @slot icon - Slot for button icon
 *
 * @example
 * <ant-btn type="primary">Click me</ant-btn>
 * <ant-btn color="danger" variant="solid">Delete</ant-btn>
 * <ant-btn href="https://example.com">Link</ant-btn>
 */
@Component({
  tag: 'ant-btn',
  shadow: false,
})
export class Button {
  @Element() el!: HTMLElement;

  private buttonEl?: HTMLButtonElement | HTMLAnchorElement;

  // ============ PROPS ============

  /**
   * Button type (legacy API). Maps to color + variant internally.
   * - 'default' → color=default, variant=outlined
   * - 'primary' → color=primary, variant=solid
   * - 'dashed' → color=default, variant=dashed
   * - 'text' → color=default, variant=text
   * - 'link' → color=default, variant=link
   */
  @Prop() type: ButtonType = 'default';

  /**
   * Button color. Use with `variant` for full control.
   */
  @Prop() color?: ButtonColor;

  /**
   * Button variant style. Use with `color` for full control.
   */
  @Prop() variant?: ButtonVariant;

  /**
   * Button shape.
   */
  @Prop() shape: ButtonShape = 'default';

  /**
   * Button size.
   */
  @Prop() size: ButtonSize = 'middle';

  /**
   * Whether the button is disabled.
   */
  @Prop() disabled: boolean = false;

  /**
   * Whether the button is in loading state.
   */
  @Prop() loading: boolean = false;

  /**
   * Make button transparent (ghost style).
   */
  @Prop() ghost: boolean = false;

  /**
   * Shorthand for color="danger". Sets button to danger/red color.
   */
  @Prop() danger: boolean = false;

  /**
   * Make button full width (block level).
   */
  @Prop() block: boolean = false;

  /**
   * Icon placement relative to text.
   */
  @Prop() iconPlacement: IconPlacement = 'start';

  /**
   * HTML button type attribute. Only applies when not using href.
   */
  @Prop() htmlType: ButtonHTMLType = 'button';

  /**
   * If set, button renders as an anchor element.
   */
  @Prop() href?: string;

  /**
   * Target attribute for anchor. Only applies when href is set.
   */
  @Prop() target?: string;

  // ============ EVENTS ============

  /**
   * Emitted when button is clicked.
   */
  @Event() btnClick!: EventEmitter<MouseEvent>;

  // ============ METHODS ============

  /**
   * Sets focus on the button.
   */
  @Method()
  async setFocus(): Promise<void> {
    this.buttonEl?.focus();
  }

  /**
   * Removes focus from the button.
   */
  @Method()
  async setBlur(): Promise<void> {
    this.buttonEl?.blur();
  }

  // ============ PRIVATE METHODS ============

  private handleClick = (event: MouseEvent): void => {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.btnClick.emit(event);
  };

  /**
   * Get color class based on props.
   * Priority: danger > color > type mapping
   */
  private getColorClass(): string {
    if (this.danger) {
      return 'ant-btn-color-danger';
    }
    if (this.color) {
      return `ant-btn-color-${this.color}`;
    }
    // Map legacy type to color
    if (this.type === 'primary') {
      return 'ant-btn-color-primary';
    }
    return 'ant-btn-color-default';
  }

  /**
   * Get variant class based on props.
   * Priority: variant > type mapping
   */
  private getVariantClass(): string {
    if (this.variant) {
      return `ant-btn-variant-${this.variant}`;
    }
    // Map legacy type to variant
    switch (this.type) {
      case 'primary':
        return 'ant-btn-variant-solid';
      case 'dashed':
        return 'ant-btn-variant-dashed';
      case 'text':
        return 'ant-btn-variant-text';
      case 'link':
        return 'ant-btn-variant-link';
      default:
        return 'ant-btn-variant-outlined';
    }
  }

  private getSizeClass(): string {
    switch (this.size) {
      case 'small':
        return 'ant-btn-sm';
      case 'large':
        return 'ant-btn-lg';
      default:
        return '';
    }
  }

  private getShapeClass(): string {
    switch (this.shape) {
      case 'circle':
        return 'ant-btn-circle';
      case 'round':
        return 'ant-btn-round';
      case 'square':
        return 'ant-btn-square';
      default:
        return '';
    }
  }

  private renderContent() {
    if (this.iconPlacement === 'end') {
      return [<slot />, <slot name="icon" />];
    }
    return [<slot name="icon" />, <slot />];
  }

  // ============ RENDER ============

  render() {
    const classes = {
      'ant-btn': true,
      [this.getColorClass()]: true,
      [this.getVariantClass()]: true,
      [this.getSizeClass()]: !!this.getSizeClass(),
      [this.getShapeClass()]: !!this.getShapeClass(),
      'ant-btn-block': this.block,
      'ant-btn-loading': this.loading,
      'ant-btn-background-ghost': this.ghost,
      'ant-btn-disabled': this.disabled,
      'ant-btn-icon-end': this.iconPlacement === 'end',
    };

    const classString = Object.entries(classes)
      .filter(([, value]) => value)
      .map(([key]) => key)
      .join(' ');

    // Render as anchor if href is provided
    if (this.href) {
      return (
        <Host>
          <a
            ref={(el) => (this.buttonEl = el)}
            class={classString}
            href={this.disabled ? undefined : this.href}
            target={this.target}
            aria-disabled={this.disabled ? 'true' : undefined}
            onClick={this.handleClick}
          >
            {this.renderContent()}
          </a>
        </Host>
      );
    }

    return (
      <Host>
        <button
          ref={(el) => (this.buttonEl = el)}
          class={classString}
          type={this.htmlType}
          disabled={this.disabled}
          aria-disabled={this.disabled ? 'true' : undefined}
          onClick={this.handleClick}
        >
          {this.renderContent()}
        </button>
      </Host>
    );
  }
}
