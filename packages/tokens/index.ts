/**
 * Ant Design v6 Design Tokens & Component CSS Extractor
 *
 * Run: bun run build
 *
 * Outputs to ./dist/:
 * - index.css              (Entry point with imports)
 * - base.css               (Reset & global styles)
 * - dark.css               (Dark theme entry point)
 * - compact.css            (Compact theme entry point)
 * - tokens/
 *   - light-tokens.css     (CSS vars for :root)
 *   - light-tokens.json    (JSON for tooling)
 *   - dark-tokens.css      ([data-theme="dark"])
 *   - dark-tokens.json
 *   - compact-tokens.css   ([data-theme="compact"])
 *   - compact-tokens.json
 * - components/
 *   - button.css           (Individual component CSS)
 *   - input.css
 *   - ...
 */

import { rm, mkdir } from "fs/promises";
import { OUTPUT_DIR } from "./scripts/config";
import { extractTokens } from "./scripts/extract-tokens";
import { generateBaseCss } from "./scripts/generate-base";
import { extractComponentCss } from "./scripts/extract-css";
import {
  generateIndexCss,
  generateDarkIndexCss,
  generateCompactIndexCss,
} from "./scripts/generate-index";

async function cleanOutputDir(): Promise<void> {
  console.log("  Cleaning output directory...");
  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(OUTPUT_DIR, { recursive: true });
  await mkdir(`${OUTPUT_DIR}/tokens`, { recursive: true });
  await mkdir(`${OUTPUT_DIR}/components`, { recursive: true });
}

async function main() {
  console.log("Extracting Ant Design v6 design tokens & component CSS...\n");

  // Step 1: Clean output directory
  await cleanOutputDir();

  // Step 2: Extract design tokens (light, dark, compact)
  console.log("Step 1: Design Tokens");
  await extractTokens();

  // Step 3: Generate base.css with reset styles
  console.log("Step 2: Base Styles");
  await generateBaseCss();

  // Step 4: Extract component CSS
  console.log("\nStep 3: Component CSS");
  await extractComponentCss();

  // Step 5: Generate entry point CSS files
  console.log("\nStep 4: Entry Points");
  await generateIndexCss();
  await generateDarkIndexCss();
  await generateCompactIndexCss();

  console.log("\nBuild complete!");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
