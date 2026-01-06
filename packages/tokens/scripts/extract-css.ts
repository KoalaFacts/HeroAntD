/**
 * Component CSS extraction using @ant-design/static-style-extract
 */

import { join } from "path";
import { writeFile } from "fs/promises";
import React from "react";
import { ConfigProvider } from "antd";
import { extractStyle } from "@ant-design/static-style-extract";
import { Biome } from "@biomejs/js-api/nodejs";
import { OUTPUT_DIR, ANTD_COMPONENTS, getCssPrefix } from "./config";
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

/**
 * Clean up CSS selectors - remove .css-var-xxx and .antd prefixes
 * Converts: ".css-var-_R_295_.ant-btn" → ".ant-btn"
 * Converts: ".antd.ant-btn" → ".ant-btn"
 */
function cleanCssSelectors(css: string): string {
  // Process CSS rule by rule to avoid breaking structure
  const result: string[] = [];
  let depth = 0;
  let currentRule = "";

  for (let i = 0; i < css.length; i++) {
    const char = css[i];
    currentRule += char;

    if (char === "{") {
      depth++;
    } else if (char === "}") {
      depth--;
      if (depth === 0) {
        // Process complete rule
        let cleanedRule = currentRule
          // Remove .css-var-xxx prefixes (e.g., ".css-var-_R_295_.ant-" → ".ant-")
          .replace(/\.css-var-[^.\s{,]+\./g, ".")
          // Remove .antd prefix (e.g., ".antd.ant-" → ".ant-")
          .replace(/\.antd\./g, ".");

        // Extract selector (everything before first {)
        const braceIndex = cleanedRule.indexOf("{");
        if (braceIndex > 0) {
          const selector = cleanedRule.substring(0, braceIndex).trim();
          // Skip rules with only .css-var selectors or empty selectors
          if (selector && !selector.match(/^\.css-var-[^\s{,]+$/) && selector !== "") {
            result.push(cleanedRule);
          }
        }
        currentRule = "";
      }
    }
  }

  return result.join("\n");
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
          cssVar: { key: "antd" },
          hashed: false,
        },
      },
      node
    )
  );
}

/**
 * Extract styles for a specific component from full CSS
 */
function extractComponentFromCss(
  fullCss: string,
  componentName: string
): string {
  const cssPrefix = getCssPrefix(componentName);
  const prefix = `.ant-${cssPrefix}`;

  const rules: string[] = [];
  let depth = 0;
  let currentRule = "";
  let inRule = false;

  for (let i = 0; i < fullCss.length; i++) {
    const char = fullCss[i];

    if (char === "{") {
      depth++;
      inRule = true;
    } else if (char === "}") {
      depth--;
      if (depth === 0) {
        currentRule += char;
        if (currentRule.includes(prefix)) {
          rules.push(currentRule.trim());
        }
        currentRule = "";
        inRule = false;
        continue;
      }
    }

    if (inRule || char !== "\n" || currentRule.trim()) {
      currentRule += char;
    }
  }

  if (rules.length === 0) return "";

  return `/* ${componentName} - .ant-${cssPrefix} */\n\n${rules.join("\n\n")}\n`;
}

/**
 * Main extraction function
 */
export async function extractComponentCss(): Promise<void> {
  // Initialize formatter
  await initBiome();

  // Extract full CSS for splitting
  console.log("  Extracting component styles...");
  const rawCss = extractFullCss();
  const cleanedCss = cleanCssSelectors(rawCss);

  // Split per-component
  console.log("\n  Per-component CSS:");
  let successCount = 0;
  let totalSize = 0;

  for (const componentName of ANTD_COMPONENTS) {
    const cssPrefix = getCssPrefix(componentName);
    const css = extractComponentFromCss(cleanedCss, componentName);

    if (css && css.length > 100) {
      const fileName = `${cssPrefix}.css`;
      const formattedCss = formatCss(css, fileName);
      await writeFile(join(OUTPUT_DIR, "components", fileName), formattedCss);
      successCount++;
      totalSize += formattedCss.length;
      console.log(`    ✓ ${fileName} (${formatSize(formattedCss.length)})`);
    }
  }

  console.log(
    `\n  Summary: ${successCount} components (${formatSize(totalSize)} total)`
  );
}
