/**
 * Configuration for Ant Design v6 CSS extraction
 */

import * as antd from "antd";

// Output directory for generated files
export const OUTPUT_DIR = "./generated";

// Component name to CSS class prefix mapping
// AntD uses abbreviated or different class names for some components
export const CSS_PREFIX_MAP: Record<string, string> = {
  Button: "btn",
  ColorPicker: "color-picker",
  FloatButton: "float-btn",
  InputNumber: "input-number",
  DatePicker: "picker",
  TimePicker: "picker",
  QRCode: "qrcode",
  BackTop: "back-top",
  TreeSelect: "tree-select",
  AutoComplete: "select", // uses select styles
};

// Components to skip (no dedicated CSS or shares with parent)
const SKIP_COMPONENTS = new Set([
  "ConfigProvider",
  "App",
  "theme",
  "version",
  "Grid",
  "AutoComplete", // uses Select CSS
]);

/**
 * Get CSS class prefix for a component
 */
export function getCssPrefix(componentName: string): string {
  if (CSS_PREFIX_MAP[componentName]) {
    return CSS_PREFIX_MAP[componentName];
  }
  // Default: convert PascalCase to kebab-case
  return componentName
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

/**
 * Check if a value is a React component
 */
function isReactComponent(value: unknown): boolean {
  if (typeof value === "function") return true;
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    if (obj.$$typeof) return true;
    if (typeof obj.render === "function") return true;
  }
  return false;
}

/**
 * Get component names from antd package
 */
function getAntdComponents(): string[] {
  return Object.entries(antd)
    .filter(([name, value]) => {
      if (!/^[A-Z]/.test(name)) return false;
      if (SKIP_COMPONENTS.has(name)) return false;
      if (!isReactComponent(value)) return false;
      return true;
    })
    .map(([name]) => name)
    .sort();
}

export const ANTD_COMPONENTS = getAntdComponents();
