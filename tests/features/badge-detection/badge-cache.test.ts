import { describe, it, expect, beforeEach } from 'vitest';
import { BadgeCache } from '@features/badge-detection/badge-cache';

describe('BadgeCache', () => {
  let cache: BadgeCache;

  beforeEach(() => {
    cache = new BadgeCache();
  });

  it('should return undefined for unknown user', () => {
    expect(cache.get('unknown')).toBeUndefined();
  });

  it('should store and retrieve badge status', () => {
    cache.set('12345', true);
    expect(cache.get('12345')).toBe(true);
  });

  it('should return false for non-fadak user', () => {
    cache.set('67890', false);
    expect(cache.get('67890')).toBe(false);
  });

  it('should check if user is cached', () => {
    expect(cache.has('12345')).toBe(false);
    cache.set('12345', true);
    expect(cache.has('12345')).toBe(true);
  });
});
