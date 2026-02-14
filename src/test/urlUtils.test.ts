import { describe, it, expect } from 'vitest';
import { getSafeImageUrl, isValidImageUrl } from '../utils/urlUtils';

describe('getSafeImageUrl', () => {
  it('should return sanitized URL for valid http/https', () => {
    // URL href normalization adds trailing slash if path is empty
    expect(getSafeImageUrl('https://example.com/image.png')).toBe('https://example.com/image.png');
    // http://example.com/image.jpg is fine.
    
    // Note: new URL('http://example.com') -> 'http://example.com/'
    // But our test case 'http://example.com/image.jpg' already has a path.
  });

  it('should return sanitized URL for valid data URIs', () => {
    const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    // data URIs might be slightly normalized by URL object (e.g. spaces removed)
    // but this simple one should be fine.
    expect(getSafeImageUrl(dataUrl)).toBe(dataUrl);
  });

  it('should return sanitized URL for valid relative paths', () => {
    // encodeURI shouldn't change these simple paths
    expect(getSafeImageUrl('/home/user/images/photo.jpg')).toBe('/home/user/images/photo.jpg');
    expect(getSafeImageUrl('./assets/logo.png')).toBe('./assets/logo.png');
    expect(getSafeImageUrl('../shared/background.png')).toBe('../shared/background.png');
    expect(getSafeImageUrl('assets/image.png')).toBe('assets/image.png');
  });

  it('should return encoded URL for paths with spaces', () => {
    expect(getSafeImageUrl('My Folder/My Image.png')).toBe('My%20Folder/My%20Image.png');
  });

  it('should return null for javascript: protocol', () => {
    expect(getSafeImageUrl('javascript:alert(1)')).toBe(null);
    expect(getSafeImageUrl('JAVASCRIPT:alert(1)')).toBe(null);
    // Control characters check
    expect(getSafeImageUrl('java\0script:alert(1)')).toBe(null);
    expect(getSafeImageUrl('java\x1Fscript:alert(1)')).toBe(null);
  });

  it('should return null for vbscript: protocol', () => {
    expect(getSafeImageUrl('vbscript:msgbox "hello"')).toBe(null);
  });

  it('should allow data: protocol if parsed correctly', () => {
    // Note: Our logic allows data: if it parses as URL.
    expect(getSafeImageUrl('data:text/html,<script>alert(1)</script>')).toBe('data:text/html,<script>alert(1)</script>');
  });

  it('should return null for arbitrary schemes', () => {
    expect(getSafeImageUrl('malicious:payload')).toBe(null);
  });

  it('should return null for strings with colons that are not valid URLs and look like schemas', () => {
    expect(getSafeImageUrl('weird:entry')).toBe(null);
  });

  it('should allow simple filenames', () => {
    expect(getSafeImageUrl('photo.jpg')).toBe('photo.jpg');
    expect(getSafeImageUrl('my_image.png')).toBe('my_image.png');
  });

  it('should return null for null/undefined input', () => {
    expect(getSafeImageUrl(null)).toBe(null);
    expect(getSafeImageUrl(undefined)).toBe(null);
  });
});

describe('isValidImageUrl (Legacy)', () => {
  it('should return true for valid URLs', () => {
    expect(isValidImageUrl('https://example.com/image.png')).toBe(true);
  });
  
  it('should return false for malicious URLs', () => {
    expect(isValidImageUrl('javascript:alert(1)')).toBe(false);
  });
});
