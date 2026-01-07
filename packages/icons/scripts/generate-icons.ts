/**
 * Generate individual icon components from @ant-design/icons-svg
 *
 * Creates tree-shakeable icon components:
 * - src/generated/search-outlined.tsx
 * - src/generated/plus-filled.tsx
 *
 * And index files by theme:
 * - src/generated/index.ts (all)
 * - src/generated/outlined.ts
 * - src/generated/filled.ts
 * - src/generated/twotone.ts
 */

import { mkdir, readdir, rm, writeFile } from 'fs/promises';
import { join } from 'path';

const ICONS_DIR = join(process.cwd(), 'node_modules/@ant-design/icons-svg/es/asn');
const OUTPUT_DIR = join(process.cwd(), 'src/generated');

/**
 * Convert PascalCase to kebab-case
 */
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Get theme from icon name (Outlined, Filled, TwoTone)
 */
function getTheme(iconName: string): string {
  if (iconName.endsWith('Outlined')) return 'outlined';
  if (iconName.endsWith('Filled')) return 'filled';
  if (iconName.endsWith('TwoTone')) return 'twotone';
  return 'other';
}

/**
 * Generate a single icon component
 */
function generateIconComponent(iconName: string): string {
  const kebabName = toKebabCase(iconName);
  const tagName = `ant-icon-${kebabName}`;
  // Extract base name without theme suffix for aria-label and data-icon
  const baseName = kebabName.replace(/-(outlined|filled|two-tone)$/, '');

  return `import { Component, type VNode, h, Prop } from '@stencil/core';
import IconDef from '@ant-design/icons-svg/es/asn/${iconName}';
import type { AbstractNode } from '@ant-design/icons-svg/es/types';

@Component({
  tag: '${tagName}',
  shadow: false,
})
export class Icon${iconName} {
  @Prop() spin?: boolean;
  @Prop() rotate?: number;

  private renderNode = (node: AbstractNode): VNode => {
    const { tag, attrs, children } = node;
    return children?.length ? h(tag, attrs, children.map(this.renderNode)) : h(tag, attrs);
  };

  render() {
    const iconNode = typeof IconDef.icon === 'function' ? IconDef.icon('#333', '#E6E6E6') : IconDef.icon;
    const cls = ['anticon', 'anticon-${baseName}', this.spin && 'anticon-spin'].filter(Boolean).join(' ');
    const style = this.rotate ? { transform: \`rotate(\${this.rotate}deg)\` } : undefined;

    return (
      <span role="img" aria-label="${baseName}" class={cls}>
        <svg
          {...iconNode.attrs}
          data-icon="${baseName}"
          width="1em"
          height="1em"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
          style={style}
        >
          {iconNode.children?.map(this.renderNode)}
        </svg>
      </span>
    );
  }
}
`;
}

/**
 * Generate index file for a set of icons
 */
function generateIndexFile(iconNames: string[], description: string): string {
  const exports = iconNames
    .map((name) => {
      const kebabName = toKebabCase(name);
      return `export { Icon${name} } from './${kebabName}';`;
    })
    .join('\n');

  return `/**
 * ${description}
 * Auto-generated - do not edit
 */

${exports}
`;
}

async function main() {
  console.log('Generating icon components from @ant-design/icons-svg...\n');

  // Read all icon files
  const files = await readdir(ICONS_DIR);
  const iconNames = files
    .filter((f) => f.endsWith('.js') && !f.startsWith('index'))
    .map((f) => f.replace('.js', ''))
    .sort();

  console.log(`Found ${iconNames.length} icons\n`);

  // Clean and recreate output directory
  try {
    await rm(OUTPUT_DIR, { recursive: true });
  } catch {
    // Directory might not exist
  }
  await mkdir(OUTPUT_DIR, { recursive: true });

  // Group icons by theme
  const byTheme: Record<string, string[]> = {
    outlined: [],
    filled: [],
    twotone: [],
    other: [],
  };

  // Generate each icon component
  let generated = 0;
  for (const iconName of iconNames) {
    const kebabName = toKebabCase(iconName);
    const theme = getTheme(iconName);
    byTheme[theme].push(iconName);

    const componentCode = generateIconComponent(iconName);
    await writeFile(join(OUTPUT_DIR, `${kebabName}.tsx`), componentCode);
    generated++;

    // Progress indicator every 100 icons
    if (generated % 100 === 0) {
      console.log(`  Generated ${generated}/${iconNames.length} icons...`);
    }
  }

  // Generate main index (all icons)
  const mainIndex = generateIndexFile(iconNames, 'All Ant Design icons');
  await writeFile(join(OUTPUT_DIR, 'index.ts'), mainIndex);

  // Generate theme-specific indexes
  if (byTheme.outlined.length > 0) {
    const outlinedIndex = generateIndexFile(byTheme.outlined, 'Outlined icons');
    await writeFile(join(OUTPUT_DIR, 'outlined.ts'), outlinedIndex);
    console.log(`  outlined.ts (${byTheme.outlined.length} icons)`);
  }

  if (byTheme.filled.length > 0) {
    const filledIndex = generateIndexFile(byTheme.filled, 'Filled icons');
    await writeFile(join(OUTPUT_DIR, 'filled.ts'), filledIndex);
    console.log(`  filled.ts (${byTheme.filled.length} icons)`);
  }

  if (byTheme.twotone.length > 0) {
    const twotoneIndex = generateIndexFile(byTheme.twotone, 'TwoTone icons');
    await writeFile(join(OUTPUT_DIR, 'twotone.ts'), twotoneIndex);
    console.log(`  twotone.ts (${byTheme.twotone.length} icons)`);
  }

  console.log(`\nGenerated ${generated} icon components to ${OUTPUT_DIR}`);
  console.log('\nUsage:');
  console.log('  <ant-icon-search-outlined />');
  console.log('  <ant-icon-plus-outlined />');
  console.log('  <ant-icon-loading-outlined spin />');
}

main().catch(console.error);
