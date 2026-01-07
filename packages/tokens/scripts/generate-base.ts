/**
 * Generate base.css with reset and global styles using Ant Design tokens
 */

import { Biome } from '@biomejs/js-api/nodejs';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { OUTPUT_DIR } from './config';
import { extractKeyframesFromCss } from './extract-css';
import { formatSize } from './helpers';

// Biome formatter instance
let biome: Biome | null = null;
let projectKey: number | null = null;

async function initBiome(): Promise<void> {
  if (!biome) {
    biome = new Biome();
    const project = biome.openProject(process.cwd());
    projectKey = project.projectKey;
    biome.applyConfiguration(projectKey, {
      formatter: {
        enabled: true,
        indentStyle: 'space',
        indentWidth: 2,
      },
      css: {
        formatter: {
          enabled: true,
          indentStyle: 'space',
          indentWidth: 2,
        },
      },
    });
  }
}

function formatCss(css: string, fileName: string): string {
  if (!biome || projectKey === null) return css;
  try {
    return biome.formatContent(projectKey, css, { filePath: fileName }).content;
  } catch {
    return css;
  }
}

/**
 * Token-based enhancements applied on top of Ant Design's reset.css
 */
const TOKEN_ENHANCEMENTS = `
/* Token-based body styles */
body {
  font-family: var(--ant-font-family);
  font-size: var(--ant-font-size);
  line-height: var(--ant-line-height);
  color: var(--ant-color-text);
  background-color: var(--ant-color-bg-container);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Link styles using tokens */
a {
  color: var(--ant-color-link);
  transition: color var(--ant-motion-duration-mid);
}

a:hover {
  color: var(--ant-color-link-hover);
}

a:active {
  color: var(--ant-color-link-active);
}

/* Focus visible outline using tokens */
:focus-visible {
  outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border);
  outline-offset: 1px;
}

/* Remove default focus outline for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}

/* Selection color using tokens */
::selection {
  background-color: var(--ant-color-primary-bg);
  color: var(--ant-color-text);
}

/* Utility: visually hidden */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Base anticon styles (from @ant-design/icons CSS-in-JS) */
.anticon {
  display: inline-flex;
  align-items: center;
  color: inherit;
  font-style: normal;
  line-height: 0;
  text-align: center;
  text-transform: none;
  vertical-align: -0.125em;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.anticon > * {
  line-height: 1;
}

.anticon svg {
  display: inline-block;
}

.anticon::before {
  display: none;
}
`;

/**
 * Generate base.css file
 */
export async function generateBaseCss(): Promise<void> {
  await initBiome();

  // Read Ant Design's official reset.css
  const antdResetPath = join(process.cwd(), 'node_modules/antd/dist/reset.css');
  const antdReset = await readFile(antdResetPath, 'utf-8');

  // Extract keyframes from Ant Design CSS-in-JS
  const keyframes = extractKeyframesFromCss();

  // Combine: Ant Design reset + token enhancements + keyframes
  const fullCss = `/**
 * Base styles for Ant Design Web Components
 * - Reset from antd/dist/reset.css
 * - Token-based enhancements
 * - Keyframe animations extracted from Ant Design
 */

${antdReset}
${TOKEN_ENHANCEMENTS}
${keyframes}`;

  const formattedCss = formatCss(fullCss, 'base.css');
  const outputPath = join(OUTPUT_DIR, 'base.css');
  await writeFile(outputPath, formattedCss);

  console.log(`    base.css (${formatSize(formattedCss.length)})`);
}
