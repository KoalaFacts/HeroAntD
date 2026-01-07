#!/usr/bin/env bun
/**
 * Scaffold Script
 *
 * Creates a simple Web Component boilerplate from React Ant Design.
 * Shows .d.ts content for reference - developer handles all implementation.
 *
 * Usage: bun run scaffold <component-name>
 * Example: bun run scaffold button
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join, relative } from 'path';

const ANTD_PATH = join(dirname(import.meta.path), '../../tokens/node_modules/antd/es');
const COMPONENTS_PATH = join(dirname(import.meta.path), '../src/components');
const TOKENS_CSS_PATH = join(dirname(import.meta.path), '../../tokens/dist/components');

// CSS prefix mapping (mirrors tokens/scripts/config.ts)
const CSS_PREFIX_MAP: Record<string, string> = {
  button: 'btn',
  colorpicker: 'color-picker',
  floatbutton: 'float-btn',
  inputnumber: 'input-number',
  datepicker: 'picker',
  timepicker: 'picker',
  qrcode: 'qrcode',
  backtop: 'back-top',
  treeselect: 'tree-select',
  autocomplete: 'select',
};

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getCssPrefix(componentName: string): string {
  const lower = componentName.toLowerCase();
  return CSS_PREFIX_MAP[lower] || lower;
}

function generateComponent(
  className: string,
  tagName: string,
  cssPrefix: string,
  dtsPath: string
): string {
  return `import { Component, Prop, Event, EventEmitter, Method, Element, h, Host } from '@stencil/core';
import type { } from '@/types/shared';

// Reference: ${dtsPath}

const cls = 'ant-${cssPrefix}';

@Component({
  tag: '${tagName}',
  shadow: false,
})
export class ${className} {
  @Element() el!: HTMLElement;

  // ==========================================================================
  // PROPS - Add from ${className}Props interface
  // ==========================================================================

  /** With default value (optional) */
  @Prop() size: string = 'middle';

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
      this.type && \`\${cls}-\${this.type}\`,
      this.size && \`\${cls}-\${this.size}\`,
      this.disabled && \`\${cls}-disabled\`,
    ].filter(Boolean).join(' ');
  }

  render() {
    return (
      <Host>
        <__ELEMENT__ class={this.getClassString()} onClick={this.handleClick}>
          {/* Named slots: <slot name="icon" /> */}
          <slot />
        </__ELEMENT__>
      </Host>
    );
  }
}
`;
}

function listComponents() {
  console.log('\nAvailable Ant Design components:\n');
  const dirs = readdirSync(ANTD_PATH, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((d) => !d.startsWith('_') && !d.startsWith('.'))
    .sort();

  const cols = 4;
  const rows = Math.ceil(dirs.length / cols);
  for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < cols; j++) {
      const idx = i + j * rows;
      if (idx < dirs.length) {
        row.push(dirs[idx].padEnd(18));
      }
    }
    console.log(`  ${row.join('')}`);
  }
}

async function main() {
  const componentName = process.argv[2]?.toLowerCase();

  if (!componentName || componentName === '--list' || componentName === '-l') {
    listComponents();
    console.log('\nUsage: bun run scaffold <component-name>');
    process.exit(componentName ? 0 : 1);
  }

  const componentDir = join(ANTD_PATH, componentName);

  if (!existsSync(componentDir)) {
    console.error(`Component not found: ${componentName}`);
    listComponents();
    process.exit(1);
  }

  // Check if component already exists
  const existingComponentDir = join(COMPONENTS_PATH, componentName);
  if (existsSync(existingComponentDir)) {
    console.error(`\n⚠️  Component "${componentName}" already exists at:`);
    console.error(`   ${existingComponentDir}`);
    process.exit(1);
  }

  const dtsFiles = readdirSync(componentDir).filter((f) => f.endsWith('.d.ts'));
  if (dtsFiles.length === 0) {
    console.error(`No .d.ts files found in ${componentDir}`);
    process.exit(1);
  }

  const cssPrefix = getCssPrefix(componentName);
  const tagName = `ant-${cssPrefix}`;
  const cssFile = join(TOKENS_CSS_PATH, `${cssPrefix}.css`);
  const cssExists = existsSync(cssFile);

  console.log(`\n📦 Component: ${componentName}`);
  console.log(`🏷️  Tag: <${tagName}>`);
  console.log(`🎨 CSS: .ant-${cssPrefix} ${cssExists ? '✓' : '⚠️ not found'}`);
  console.log(`📁 Source: ${componentDir}`);
  console.log(`📄 Files: ${dtsFiles.join(', ')}\n`);

  // Show main .d.ts content
  const mainFile = `${capitalize(componentName)}.d.ts`;
  const fallbackFile = 'index.d.ts';
  const fileToShow = dtsFiles.includes(mainFile)
    ? mainFile
    : dtsFiles.includes(fallbackFile)
      ? fallbackFile
      : dtsFiles[0];

  if (fileToShow) {
    const content = readFileSync(join(componentDir, fileToShow), 'utf-8');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📖 ${fileToShow}`);
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(content);
  }

  // Generate component
  const className = capitalize(componentName);
  const outputDir = join(COMPONENTS_PATH, componentName);
  const outputFile = join(outputDir, `${componentName}.tsx`);

  const absoluteDtsPath = fileToShow ? join(componentDir, fileToShow) : componentDir;
  const relativeDtsPath = relative(outputDir, absoluteDtsPath).replace(/\\/g, '/');
  const componentCode = generateComponent(className, tagName, cssPrefix, relativeDtsPath);

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(outputFile, componentCode, 'utf-8');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ COMPONENT CREATED');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`📁 ${outputFile}\n`);

  console.log('📝 NEXT STEPS:');
  console.log(`   1. Open ${componentName}/${componentName}.tsx`);
  console.log(`   2. Ctrl+click the reference path to view .d.ts`);
  console.log('   3. Replace __ELEMENT__ with correct HTML tag (button, div, etc.)');
  console.log('   4. Update @Prop() declarations from the interface');
  console.log('   5. Update @Event() and handlers as needed');
  console.log('   6. Update @Method() for imperative APIs');
  console.log('   7. Update getClassString() with component-specific classes');
  console.log('   8. Run: bun run build:core\n');
}

main().catch(console.error);
