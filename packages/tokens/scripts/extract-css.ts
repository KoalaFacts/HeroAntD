/**
 * Component CSS extraction using @ant-design/static-style-extract
 */

import { extractStyle } from '@ant-design/static-style-extract';
import { Biome } from '@biomejs/js-api/nodejs';
import { ConfigProvider } from 'antd';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import React from 'react';
import { ANTD_COMPONENTS, getCssPrefix, OUTPUT_DIR } from './config';
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
 * Clean up CSS selectors - remove .css-var-xxx and .antd prefixes
 * Converts: ".css-var-_R_295_.ant-btn" → ".ant-btn"
 * Converts: ".antd.ant-btn" → ".ant-btn"
 */
function cleanCssSelectors(css: string): string {
  // Process CSS rule by rule to avoid breaking structure
  const result: string[] = [];
  let depth = 0;
  let currentRule = '';

  for (let i = 0; i < css.length; i++) {
    const char = css[i];
    currentRule += char;

    if (char === '{') {
      depth++;
    } else if (char === '}') {
      depth--;
      if (depth === 0) {
        // Process complete rule
        const cleanedRule = currentRule
          // Remove .css-var-xxx prefixes (e.g., ".css-var-_R_295_.ant-" → ".ant-")
          .replace(/\.css-var-[^.\s{,]+\./g, '.')
          // Remove .antd prefix (e.g., ".antd.ant-" → ".ant-")
          .replace(/\.antd\./g, '.');

        // Extract selector (everything before first {)
        const braceIndex = cleanedRule.indexOf('{');
        if (braceIndex > 0) {
          const selector = cleanedRule.substring(0, braceIndex).trim();
          // Skip rules with only .css-var selectors or empty selectors
          if (selector && !selector.match(/^\.css-var-[^\s{,]+$/) && selector !== '') {
            result.push(cleanedRule);
          }
        }
        currentRule = '';
      }
    }
  }

  return result.join('\n');
}

/**
 * Extract full component CSS
 */
function extractFullCss(): string {
  return extractStyle((node) =>
    React.createElement(
      ConfigProvider,
      {
        theme: {
          cssVar: { key: 'antd' },
          hashed: false,
        },
      },
      node
    )
  );
}

/**
 * Extract @keyframes rules from CSS using brace-counting parser
 * Handles nested braces properly (e.g., 0% { ... } 100% { ... })
 */
function extractKeyframes(fullCss: string): string {
  const keyframeRules: string[] = [];
  const keyframeStart = /@keyframes\s+[\w-]+\s*\{/g;

  let startMatch: RegExpExecArray | null;
  while ((startMatch = keyframeStart.exec(fullCss)) !== null) {
    const startIndex = startMatch.index;
    let depth = 1;
    let i = startMatch.index + startMatch[0].length;

    // Find the matching closing brace by counting depth
    while (i < fullCss.length && depth > 0) {
      if (fullCss[i] === '{') depth++;
      else if (fullCss[i] === '}') depth--;
      i++;
    }

    if (depth === 0) {
      const rule = fullCss.substring(startIndex, i).trim();
      keyframeRules.push(rule);
    }
  }

  if (keyframeRules.length === 0) return '';

  return `/* Keyframe animations extracted from Ant Design */\n\n${keyframeRules.join('\n\n')}\n`;
}

/**
 * Extract styles for a specific component from full CSS
 */
function extractComponentFromCss(fullCss: string, componentName: string): string {
  const cssPrefix = getCssPrefix(componentName);
  const prefix = `.ant-${cssPrefix}`;

  const rules: string[] = [];
  let depth = 0;
  let currentRule = '';
  let inRule = false;

  for (let i = 0; i < fullCss.length; i++) {
    const char = fullCss[i];

    if (char === '{') {
      depth++;
      inRule = true;
    } else if (char === '}') {
      depth--;
      if (depth === 0) {
        currentRule += char;
        if (currentRule.includes(prefix)) {
          rules.push(currentRule.trim());
        }
        currentRule = '';
        inRule = false;
        continue;
      }
    }

    if (inRule || char !== '\n' || currentRule.trim()) {
      currentRule += char;
    }
  }

  if (rules.length === 0) return '';

  return `/* ${componentName} - .ant-${cssPrefix} */\n\n${rules.join('\n\n')}\n`;
}

/**
 * Main extraction function
 */
export async function extractComponentCss(): Promise<void> {
  // Initialize formatter
  await initBiome();

  // Extract full CSS for splitting
  console.log('  Extracting component styles...');
  const rawCss = extractFullCss();
  const cleanedCss = cleanCssSelectors(rawCss);

  // Split per-component
  console.log('\n  Per-component CSS:');
  let successCount = 0;
  let totalSize = 0;

  for (const componentName of ANTD_COMPONENTS) {
    const cssPrefix = getCssPrefix(componentName);
    const css = extractComponentFromCss(cleanedCss, componentName);

    if (css && css.length > 100) {
      const fileName = `${cssPrefix}.css`;
      const formattedCss = formatCss(css, fileName);
      await writeFile(join(OUTPUT_DIR, 'components', fileName), formattedCss);
      successCount++;
      totalSize += formattedCss.length;
      console.log(`    ✓ ${fileName} (${formatSize(formattedCss.length)})`);
    }
  }

  // Generate icon CSS (from @ant-design/icons - CSS-in-JS, so we write it manually)
  const iconCss = generateIconCss();
  const iconFileName = 'icon.css';
  const formattedIconCss = formatCss(iconCss, iconFileName);
  await writeFile(join(OUTPUT_DIR, 'components', iconFileName), formattedIconCss);
  successCount++;
  totalSize += formattedIconCss.length;
  console.log(`    ✓ ${iconFileName} (${formatSize(formattedIconCss.length)})`);

  // Generate wave effect CSS (from @ant-design/cssinjs-utils Wave)
  const waveCss = generateWaveCss();
  const waveFileName = 'wave.css';
  const formattedWaveCss = formatCss(waveCss, waveFileName);
  await writeFile(join(OUTPUT_DIR, 'components', waveFileName), formattedWaveCss);
  successCount++;
  totalSize += formattedWaveCss.length;
  console.log(`    ✓ ${waveFileName} (${formatSize(formattedWaveCss.length)})`);

  console.log(`\n  Summary: ${successCount} components (${formatSize(totalSize)} total)`);
}

/**
 * Generate wave/ripple effect CSS (from @ant-design/cssinjs-utils Wave)
 * This creates the click ripple effect for buttons and other interactive elements
 */
function generateWaveCss(): string {
  return `/**
 * Ant Design Wave Effect Styles
 * Based on @ant-design/cssinjs-utils Wave component
 */

/* Wave effect - expands box-shadow from button border */
.ant-wave {
  position: absolute;
  pointer-events: none;
  inset: 0;
  border-radius: inherit;
  box-shadow: 0 0 0 0 var(--ant-color-primary);
  opacity: 0.2;
  animation: antWaveEffect 0.4s cubic-bezier(0.08, 0.82, 0.17, 1);
  animation-fill-mode: forwards;
}

@keyframes antWaveEffect {
  100% {
    box-shadow: 0 0 0 6px var(--ant-color-primary);
    opacity: 0;
  }
}
`;
}

/**
 * Generate icon CSS (from @ant-design/icons CSS-in-JS)
 */
function generateIconCss(): string {
  return `/**
 * Ant Design Icon Styles
 * Based on @ant-design/icons CSS-in-JS
 */

/* Base icon styles */
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

.anticon .anticon-icon {
  display: block;
}

.anticon[tabindex] {
  cursor: pointer;
}

/* Spin animation */
.anticon-spin,
.anticon-spin::before {
  display: inline-block;
  animation: antRotate 1s infinite linear;
}

@keyframes antRotate {
  100% {
    transform: rotate(360deg);
  }
}

/* Icon inside button alignment */
.ant-btn .anticon {
  line-height: 1;
}

/* Right-to-left support */
.anticon.anticon-rtl {
  transform: scaleX(-1);
}
`;
}

/**
 * Extract keyframes from the raw CSS (before cleaning)
 * Returns the keyframes CSS string
 */
export function extractKeyframesFromCss(): string {
  const rawCss = extractFullCss();
  return extractKeyframes(rawCss);
}
