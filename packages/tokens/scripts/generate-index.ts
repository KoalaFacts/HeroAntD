/**
 * Generate CSS entry points
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { OUTPUT_DIR } from './config';
import { formatSize } from './helpers';

/**
 * Generate index.css - Foundation styles only (base + light tokens)
 * This is the minimal CSS needed for theming - component CSS is separate
 */
export async function generateIndexCss(): Promise<void> {
  const tokensDir = join(OUTPUT_DIR, 'tokens');

  const sections: string[] = [
    '/**',
    ' * Ant Design Foundation Styles',
    ' * Base reset + Light theme tokens (CSS variables)',
    ' * Import component CSS separately for tree-shaking',
    ' */',
    '',
  ];

  // Read and inline light tokens
  try {
    const lightTokens = await readFile(join(tokensDir, 'light-tokens.css'), 'utf-8');
    sections.push('/* ========== Design Tokens (Light Theme) ========== */');
    sections.push(lightTokens);
    sections.push('');
  } catch {
    // Tokens file might not exist yet
  }

  // Read and inline base.css
  try {
    const baseCss = await readFile(join(OUTPUT_DIR, 'base.css'), 'utf-8');
    sections.push('/* ========== Base/Reset Styles ========== */');
    sections.push(baseCss);
    sections.push('');
  } catch {
    // Base file might not exist yet
  }

  const content = sections.join('\n');
  const outputPath = join(OUTPUT_DIR, 'index.css');
  await writeFile(outputPath, content);

  console.log(`    index.css (${formatSize(content.length)}) - foundation only`);
}

/**
 * Generate all.css - Everything bundled (foundation + all components)
 * For convenience when tree-shaking is not needed
 */
export async function generateAllCss(): Promise<void> {
  const componentsDir = join(OUTPUT_DIR, 'components');
  const tokensDir = join(OUTPUT_DIR, 'tokens');

  const sections: string[] = [
    '/**',
    ' * Ant Design Web Components - All Styles Bundled',
    ' * Includes foundation + all component CSS',
    ' */',
    '',
  ];

  // Read and inline light tokens
  try {
    const lightTokens = await readFile(join(tokensDir, 'light-tokens.css'), 'utf-8');
    sections.push('/* ========== Design Tokens (Light Theme) ========== */');
    sections.push(lightTokens);
    sections.push('');
  } catch {
    // Tokens file might not exist yet
  }

  // Read and inline base.css
  try {
    const baseCss = await readFile(join(OUTPUT_DIR, 'base.css'), 'utf-8');
    sections.push('/* ========== Base/Reset Styles ========== */');
    sections.push(baseCss);
    sections.push('');
  } catch {
    // Base file might not exist yet
  }

  // Read and inline all component CSS files
  try {
    const files = await readdir(componentsDir);
    const componentFiles = files.filter((f) => f.endsWith('.css')).sort();

    if (componentFiles.length > 0) {
      sections.push('/* ========== Component Styles ========== */');
      for (const file of componentFiles) {
        const css = await readFile(join(componentsDir, file), 'utf-8');
        sections.push(css);
      }
    }
  } catch {
    // Components directory might not exist yet
  }

  sections.push('');

  const content = sections.join('\n');
  const outputPath = join(OUTPUT_DIR, 'all.css');
  await writeFile(outputPath, content);

  console.log(`    all.css (${formatSize(content.length)}) - everything bundled`);
}

/**
 * Generate dark theme CSS (inlined for bundler compatibility)
 */
export async function generateDarkIndexCss(): Promise<void> {
  const tokensDir = join(OUTPUT_DIR, 'tokens');

  let content = `/**
 * Dark theme - Import after foundation to enable dark mode
 */
`;

  try {
    const darkTokens = await readFile(join(tokensDir, 'dark-tokens.css'), 'utf-8');
    content += darkTokens;
  } catch {
    // File might not exist yet
  }

  const outputPath = join(OUTPUT_DIR, 'dark.css');
  await writeFile(outputPath, content);

  console.log(`    dark.css (${formatSize(content.length)})`);
}

/**
 * Generate compact theme CSS (inlined for bundler compatibility)
 */
export async function generateCompactIndexCss(): Promise<void> {
  const tokensDir = join(OUTPUT_DIR, 'tokens');

  let content = `/**
 * Compact theme - Import after foundation to enable compact mode
 */
`;

  try {
    const compactTokens = await readFile(join(tokensDir, 'compact-tokens.css'), 'utf-8');
    content += compactTokens;
  } catch {
    // File might not exist yet
  }

  const outputPath = join(OUTPUT_DIR, 'compact.css');
  await writeFile(outputPath, content);

  console.log(`    compact.css (${formatSize(content.length)})`);
}
