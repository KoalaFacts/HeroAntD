import { Component, Prop, Event, EventEmitter, Method, Element, h, Host } from '@stencil/core';
import type { SizeType } from '@/types/shared';

// Reference: ../../../../tokens/node_modules/antd/es/button/Button.d.ts

const cls = 'ant-btn';

@Component({
  tag: 'ant-btn',
  shadow: false,
})
export class Button {
  @Element() el!: HTMLElement;

  // ==========================================================================
  // PROPS - Add from ButtonProps interface
  // ==========================================================================

  /** With default value (optional) */
  @Prop() size: SizeType = 'middle';

  /** Optional prop (no default) */
  @Prop() disabled?: boolean;

  /** Required prop - must use { reflect: true } for attribute binding */
  @Prop({ reflect: true }) type!: string;

  // ==========================================================================
  // EVENTS - For React on* callbacks
  // Native events (click, focus, blur) work automatically.
  // Custom events need @Event() declaration.
  // ==========================================================================

  @Event() close!: EventEmitter<void>;

  private handleClick = () => {
    this.close.emit();
  };

  // ==========================================================================
  // METHODS - For imperative API (focus, blur, etc.)
  // ==========================================================================

  @Method()
  async focus() {
    this.el.querySelector<HTMLElement>('__ELEMENT__')?.focus();
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  private getClassString(): string {
    return [
      cls,
      this.type && `${cls}-${this.type}`,
      this.size && `${cls}-${this.size}`,
      this.disabled && `${cls}-disabled`,
    ].filter(Boolean).join(' ');
  }

  render() {
    return (
      <Host>
        <button class={this.getClassString()} onClick={this.handleClick}>
          {/* Named slots: <slot name="icon" /> */}
          <slot />
        </button>
      </Host>
    );
  }
}
