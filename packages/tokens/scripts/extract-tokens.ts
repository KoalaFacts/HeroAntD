/**
 * Token extraction from Ant Design v6
 * Extracts design tokens for light, dark, and compact themes
 */

import { join } from "path";
import { mkdir, writeFile } from "fs/promises";
import { theme } from "antd";
import { Biome } from "@biomejs/js-api/nodejs";
import { OUTPUT_DIR } from "./config";
import { formatSize } from "./helpers";

const { defaultAlgorithm, darkAlgorithm, compactAlgorithm, defaultSeed } =
  theme;

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
 * Convert camelCase to kebab-case
 */
function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

/**
 * Token names that should NOT have px units appended
 */
const UNITLESS_TOKENS = new Set([
  "zIndexBase",
  "zIndexPopupBase",
  "opacityLoading",
  "opacityImage",
  "lineHeight",
  "lineHeightLG",
  "lineHeightSM",
  "lineHeightHeading1",
  "lineHeightHeading2",
  "lineHeightHeading3",
  "lineHeightHeading4",
  "lineHeightHeading5",
  "fontWeightStrong",
  "motionUnit",
  "motionBase",
]);

/**
 * Convert token value to CSS value
 */
function toCssValue(value: unknown, key: string): string {
  if (typeof value === "number") {
    // Check if this token should be unitless
    if (UNITLESS_TOKENS.has(key)) {
      return String(value);
    }
    // z-index values
    if (key.toLowerCase().includes("zindex")) {
      return String(value);
    }
    // Opacity values
    if (key.toLowerCase().includes("opacity")) {
      return String(value);
    }
    // Line height values (usually ratios)
    if (key.toLowerCase().includes("lineheight")) {
      return String(value);
    }
    // Font weight
    if (key.toLowerCase().includes("fontweight")) {
      return String(value);
    }
    // Motion unit/base are multipliers
    if (key === "motionUnit" || key === "motionBase") {
      return String(value);
    }
    // Everything else gets px
    return `${value}px`;
  }
  return String(value);
}

/**
 * Generate tokens using Ant Design's theme algorithm
 */
function generateTokens(
  algorithm: typeof defaultAlgorithm | typeof darkAlgorithm | typeof compactAlgorithm | Array<typeof defaultAlgorithm | typeof darkAlgorithm | typeof compactAlgorithm>
): Record<string, unknown> {
  const algorithms = Array.isArray(algorithm) ? algorithm : [algorithm];
  return theme.getDesignToken({
    algorithm: algorithms,
    token: defaultSeed,
  });
}

/**
 * Convert tokens to CSS custom properties
 */
function tokensToCss(
  tokens: Record<string, unknown>,
  selector: string
): string {
  const lines: string[] = [`${selector} {`];

  for (const [key, value] of Object.entries(tokens)) {
    // Skip internal/complex tokens
    if (
      typeof value === "object" ||
      typeof value === "function" ||
      key.startsWith("_")
    ) {
      continue;
    }

    const cssVar = `--ant-${toKebabCase(key)}`;
    const cssValue = toCssValue(value, key);
    lines.push(`  ${cssVar}: ${cssValue};`);
  }

  lines.push("}");
  return lines.join("\n");
}

/**
 * Convert tokens to JSON (only primitive values)
 */
function tokensToJson(tokens: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(tokens)) {
    if (
      typeof value === "object" ||
      typeof value === "function" ||
      key.startsWith("_")
    ) {
      continue;
    }
    result[key] = value;
  }

  return result;
}

/**
 * Theme configurations
 */
const THEMES = [
  {
    name: "light",
    algorithm: defaultAlgorithm,
    selector: ":root",
    description: "Light theme (default)",
  },
  {
    name: "dark",
    algorithm: darkAlgorithm,
    selector: '[data-theme="dark"]',
    description: "Dark theme",
  },
  {
    name: "compact",
    algorithm: compactAlgorithm,
    selector: '[data-theme="compact"]',
    description: "Compact theme",
  },
] as const;

/**
 * Extract and write token files
 */
export async function extractTokens(): Promise<void> {
  const tokensDir = join(OUTPUT_DIR, "tokens");
  await mkdir(tokensDir, { recursive: true });

  await initBiome();

  console.log("  Extracting design tokens...\n");

  for (const themeConfig of THEMES) {
    const tokens = generateTokens(themeConfig.algorithm);

    // Generate CSS
    const cssContent = `/* ${themeConfig.description} */\n${tokensToCss(tokens, themeConfig.selector)}`;
    const formattedCss = formatCss(cssContent, `${themeConfig.name}-tokens.css`);
    const cssPath = join(tokensDir, `${themeConfig.name}-tokens.css`);
    await writeFile(cssPath, formattedCss);

    // Generate JSON
    const jsonContent = tokensToJson(tokens);
    const jsonPath = join(tokensDir, `${themeConfig.name}-tokens.json`);
    await writeFile(jsonPath, JSON.stringify(jsonContent, null, 2));

    const tokenCount = Object.keys(jsonContent).length;
    console.log(
      `    ${themeConfig.name}-tokens.css (${tokenCount} vars, ${formatSize(formattedCss.length)})`
    );
    console.log(
      `    ${themeConfig.name}-tokens.json (${formatSize(JSON.stringify(jsonContent).length)})`
    );
  }

  console.log("");
}
