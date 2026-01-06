/**
 * Generate index.css entry point with all imports
 */

import { join } from "path";
import { readdir, writeFile } from "fs/promises";
import { OUTPUT_DIR } from "./config";
import { formatSize } from "./helpers";

/**
 * Generate index.css with imports for all CSS files
 */
export async function generateIndexCss(): Promise<void> {
  const componentsDir = join(OUTPUT_DIR, "components");

  // Get all component CSS files
  let componentFiles: string[] = [];
  try {
    const files = await readdir(componentsDir);
    componentFiles = files
      .filter((f) => f.endsWith(".css"))
      .sort();
  } catch {
    // Components directory might not exist yet
  }

  const lines: string[] = [
    "/**",
    " * Ant Design Web Components - Main Entry Point",
    " * Import this file to include all styles",
    " */",
    "",
    "/* Design Tokens (light theme by default) */",
    '@import "./tokens/light-tokens.css";',
    "",
    "/* Base/Reset Styles */",
    '@import "./base.css";',
    "",
  ];

  if (componentFiles.length > 0) {
    lines.push("/* Component Styles */");
    for (const file of componentFiles) {
      lines.push(`@import "./components/${file}";`);
    }
  }

  lines.push("");

  const content = lines.join("\n");
  const outputPath = join(OUTPUT_DIR, "index.css");
  await writeFile(outputPath, content);

  console.log(`    index.css (${formatSize(content.length)})`);
}

/**
 * Generate dark theme index.css
 */
export async function generateDarkIndexCss(): Promise<void> {
  const content = `/**
 * Dark theme entry point
 * Import this after index.css to enable dark theme
 */

@import "./tokens/dark-tokens.css";
`;

  const outputPath = join(OUTPUT_DIR, "dark.css");
  await writeFile(outputPath, content);

  console.log(`    dark.css (${formatSize(content.length)})`);
}

/**
 * Generate compact theme index.css
 */
export async function generateCompactIndexCss(): Promise<void> {
  const content = `/**
 * Compact theme entry point
 * Import this after index.css to enable compact theme
 */

@import "./tokens/compact-tokens.css";
`;

  const outputPath = join(OUTPUT_DIR, "compact.css");
  await writeFile(outputPath, content);

  console.log(`    compact.css (${formatSize(content.length)})`);
}
