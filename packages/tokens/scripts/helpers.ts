/**
 * Shared utility functions
 */

/**
 * Format file size for display
 */
export function formatSize(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)}KB`;
}
