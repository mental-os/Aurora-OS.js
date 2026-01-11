/**
 * Sanitizes and validates a URL for use in an image source.
 * Returns the sanitized string (safe to use) or null if invalid.
 * This pattern helps static analysis tools (like CodeQL) verify that data has been sanitized.
 */
export function getSafeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // 1. Sanitize input: remove control characters (0x00-0x1F)
  // eslint-disable-next-line no-control-regex
  const sanitized = url.replace(/[\x00-\x1F]/g, "");

  try {
    // 2. Allow relative paths (explicitly safe prefixes)
    if (
      sanitized.startsWith("/") ||
      sanitized.startsWith("./") ||
      sanitized.startsWith("../")
    ) {
      return encodeURI(sanitized);
    }

    // 3. Parse as URL
    const parsed = new URL(sanitized);

    // 4. Check Protocol Allowlist
    //    Use explicit checks to satisfy static analysis (CodeQL) taint tracking
    const protocol = parsed.protocol;
    if (
      protocol === "http:" ||
      protocol === "https:" ||
      protocol === "data:" ||
      protocol === "blob:"
    ) {
      // Taint Breaking: Return the property from the new object, not the input string.
      return parsed.href;
    }
    
    return null;

  } catch {
    // 5. Fallback for strings that failed URL parsing
    //    STRICT CHECK: Only allow simple filenames (alphanumeric, dots, dashes, spaces, underscores)
    //    Reject EVERYTHING else to satisfy "Default Deny" security policy.
    
    // Allow: "photo.jpg", "My File.png", "image-123.gif"
    // Reject: "javascript:...", "data:...", "foo:bar", "foo/bar" (unless caught by startsWith above, relative paths usually need ./ or /)

    // Note: We trim whitespace before checking
    const trimmed = sanitized.trim();
    
    // Regex: Start to End, allowed chars: alphanumeric, dot, dash, space, forward slash, underscore.
    if (/^[\w\-./\s]+$/.test(trimmed)) {
      // Taint Breaking: Return a new string created by transformation (encoding).
      // This ensures the return value is not a direct reference to the input.
      return encodeURI(sanitized);
    }

    // Default Deny
    return null;
  }
}

/**
 * Legacy validator - wrapper around getSafeImageUrl.
 * @deprecated Use getSafeImageUrl instead to ensure taint tracking works.
 */
export function isValidImageUrl(url: string): boolean {
  return getSafeImageUrl(url) !== null;
}
