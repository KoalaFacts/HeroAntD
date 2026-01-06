/**
 * Generate base.css with reset and global styles using Ant Design tokens
 */

import { join } from "path";
import { writeFile } from "fs/promises";
import { Biome } from "@biomejs/js-api/nodejs";
import { OUTPUT_DIR } from "./config";
import { formatSize } from "./helpers";

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
        indentStyle: "space",
        indentWidth: 2,
      },
      css: {
        formatter: {
          enabled: true,
          indentStyle: "space",
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

const BASE_CSS = `/**
 * Base styles for Ant Design Web Components
 * Reset and global styles using design tokens
 */

/* Box sizing reset */
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* Remove default margin and padding */
html,
body {
  margin: 0;
  padding: 0;
}

/* Base body styles using Ant Design tokens */
body {
  font-family: var(--ant-font-family);
  font-size: var(--ant-font-size);
  line-height: var(--ant-line-height);
  color: var(--ant-color-text);
  background-color: var(--ant-color-bg-container);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Typography reset */
h1,
h2,
h3,
h4,
h5,
h6 {
  margin: 0;
  font-weight: var(--ant-font-weight-strong);
  color: var(--ant-color-text-heading);
}

h1 {
  font-size: var(--ant-font-size-heading-1);
  line-height: var(--ant-line-height-heading-1);
}

h2 {
  font-size: var(--ant-font-size-heading-2);
  line-height: var(--ant-line-height-heading-2);
}

h3 {
  font-size: var(--ant-font-size-heading-3);
  line-height: var(--ant-line-height-heading-3);
}

h4 {
  font-size: var(--ant-font-size-heading-4);
  line-height: var(--ant-line-height-heading-4);
}

h5 {
  font-size: var(--ant-font-size-heading-5);
  line-height: var(--ant-line-height-heading-5);
}

p {
  margin: 0 0 var(--ant-margin) 0;
}

/* Link styles */
a {
  color: var(--ant-color-link);
  text-decoration: none;
  cursor: pointer;
  transition: color var(--ant-motion-duration-mid);
}

a:hover {
  color: var(--ant-color-link-hover);
}

a:active {
  color: var(--ant-color-link-active);
}

/* List reset */
ul,
ol {
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Image reset */
img {
  max-width: 100%;
  height: auto;
  vertical-align: middle;
}

/* Table reset */
table {
  border-collapse: collapse;
  border-spacing: 0;
}

/* Form elements reset */
input,
button,
textarea,
select {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
}

button {
  cursor: pointer;
}

/* Focus visible outline */
:focus-visible {
  outline: var(--ant-line-width-focus) solid var(--ant-color-primary-border);
  outline-offset: 1px;
}

/* Remove default focus outline for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}

/* Selection color */
::selection {
  background-color: var(--ant-color-primary-bg);
  color: var(--ant-color-text);
}

/* Scrollbar styling (webkit) */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--ant-color-bg-container);
}

::-webkit-scrollbar-thumb {
  background: var(--ant-color-border);
  border-radius: var(--ant-border-radius);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--ant-color-border-secondary);
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
`;

/**
 * Generate base.css file
 */
export async function generateBaseCss(): Promise<void> {
  await initBiome();

  const formattedCss = formatCss(BASE_CSS, "base.css");
  const outputPath = join(OUTPUT_DIR, "base.css");
  await writeFile(outputPath, formattedCss);

  console.log(`    base.css (${formatSize(formattedCss.length)})`);
}
