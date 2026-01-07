#!/usr/bin/env bun
/**
 * Scaffold Script
 *
 * Scaffolds a new Web Component by extracting type definitions from React Ant Design.
 * Shows extracted types and .d.ts content for manual review.
 *
 * Usage: bun run scaffold <component-name>
 * Example: bun run scaffold button
 */

import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';

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
  if (CSS_PREFIX_MAP[lower]) {
    return CSS_PREFIX_MAP[lower];
  }
  // Default: use component name as-is (lowercase)
  return lower;
}

function extractTypes(content: string): Map<string, string[]> {
  const types = new Map<string, string[]>();

  // Pattern 1: const _ButtonTypes: readonly ["default", "primary", ...]
  const constArrayRegex = /(?:export\s+)?(?:declare\s+)?const\s+_(\w+)s?:\s+readonly\s+\[([^\]]+)\]/g;
  let match;

  while ((match = constArrayRegex.exec(content)) !== null) {
    const typeName = capitalize(match[1]);
    const values = match[2].match(/"([^"]+)"/g)?.map((v) => v.replace(/"/g, '')) || [];
    if (values.length > 0) {
      types.set(typeName, values);
    }
  }

  // Pattern 2: type ButtonType = 'default' | 'primary' | ...
  const typeAliasRegex = /(?:export\s+)?type\s+(\w+)\s*=\s*\(typeof\s+_\w+\)\[number\]|(?:export\s+)?type\s+(\w+)\s*=\s*(['"][^'"]+['"](?:\s*\|\s*['"][^'"]+['"])*)/g;

  while ((match = typeAliasRegex.exec(content)) !== null) {
    if (match[2] && match[3]) {
      // Direct string literal union
      const typeName = match[2];
      const values = match[3].match(/['"]([^'"]+)['"]/g)?.map((v) => v.replace(/['"]/g, '')) || [];
      if (values.length > 0 && !types.has(typeName)) {
        types.set(typeName, values);
      }
    }
  }

  return types;
}

function listComponents() {
  console.log('\nAvailable Ant Design components:\n');
  const dirs = readdirSync(ANTD_PATH, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((d) => !d.startsWith('_') && !d.startsWith('.'))
    .sort();

  // Print in columns
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
    console.log('  ' + row.join(''));
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

  // Check if component already exists in our codebase
  const existingComponentDir = join(COMPONENTS_PATH, componentName);
  if (existsSync(existingComponentDir)) {
    console.error(`\n⚠️  Component "${componentName}" already exists at:`);
    console.error(`   ${existingComponentDir}`);
    console.error(`\n   Use a different name or delete the existing component first.`);
    process.exit(1);
  }

  // Find all .d.ts files in the component directory
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
  console.log(`📁 Path: ${componentDir}`);
  console.log(`📄 Files: ${dtsFiles.join(', ')}\n`);

  if (!cssExists) {
    console.log(`⚠️  CSS file not found: ${cssFile}`);
    console.log(`   Run 'bun run build:tokens' first or check if component uses shared CSS.\n`);
  }

  // Read and combine all .d.ts content
  let allContent = '';
  for (const file of dtsFiles) {
    const content = readFileSync(join(componentDir, file), 'utf-8');
    allContent += content + '\n';
  }

  // Extract types
  const types = extractTypes(allContent);

  if (types.size > 0) {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📋 EXTRACTED TYPES (copy to your component)');
    console.log('═══════════════════════════════════════════════════════════\n');

    for (const [typeName, values] of types) {
      console.log(`export type ${typeName} = ${values.map((v) => `'${v}'`).join(' | ')};`);
    }
    console.log('');
  }

  // Show main .d.ts file content for manual review
  const mainFile = `${capitalize(componentName)}.d.ts`;
  const fallbackFile = 'index.d.ts';
  const fileToShow = dtsFiles.includes(mainFile) ? mainFile : dtsFiles.includes(fallbackFile) ? fallbackFile : null;

  if (fileToShow) {
    const mainContent = readFileSync(join(componentDir, fileToShow), 'utf-8');

    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📖 ${fileToShow} (review for props, methods, events)`);
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(mainContent);
  }

  // Show helper file if exists
  const helperFile = `${componentName}Helpers.d.ts`;
  if (dtsFiles.includes(helperFile)) {
    const helperContent = readFileSync(join(componentDir, helperFile), 'utf-8');

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`📖 ${helperFile}`);
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(helperContent);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📝 PORTING CHECKLIST');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`
1. CREATE FILE:
   mkdir packages/core/src/components/${componentName}
   → ${componentName}.tsx

2. COMPONENT SETUP:
   @Component({ tag: '${tagName}', shadow: false })
   export class ${capitalize(componentName)} { ... }

3. PROPS to @Prop():
   - Look for interface ${capitalize(componentName)}Props
   - Skip: children, className, style, prefixCls, rootClassName, classNames, styles
   - ReactNode props → <slot name="xxx">

4. EVENTS to @Event():
   - onChange → ${componentName}Change
   - onClick → ${componentName}Click

5. METHODS to @Method():
   - Look for ref methods (focus, blur, etc.)

6. BUILD & TEST:
   bun run build:core
   bun run dev
`);
}

main().catch(console.error);
