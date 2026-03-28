import { describe, it, expect } from 'vitest';
import { parseBadgeInfo } from '@features/badge-detection/api-parser';

describe('parseBadgeInfo', () => {
  it('should detect Premium subscriber (fadak)', () => {
    const userData = {
      rest_id: '12345',
      is_blue_verified: true,
      legacy: { verified: false },
    };
    const result = parseBadgeInfo(userData);
    expect(result).toEqual({
      userId: '12345',
      isBluePremium: true,
      isLegacyVerified: false,
      isBusiness: false,
    });
  });

  it('should detect legacy verified account', () => {
    const userData = {
      rest_id: '67890',
      is_blue_verified: true,
      legacy: { verified: true },
    };
    const result = parseBadgeInfo(userData);
    expect(result?.isBluePremium).toBe(false);
    expect(result?.isLegacyVerified).toBe(true);
  });

  it('should detect business account', () => {
    const userData = {
      rest_id: '11111',
      is_blue_verified: true,
      verified_type: 'Business',
      legacy: { verified: false },
    };
    const result = parseBadgeInfo(userData);
    expect(result?.isBusiness).toBe(true);
    expect(result?.isBluePremium).toBe(false);
  });

  it('should return null for non-verified user', () => {
    const userData = {
      rest_id: '99999',
      is_blue_verified: false,
      legacy: { verified: false },
    };
    const result = parseBadgeInfo(userData);
    expect(result).toBeNull();
  });

  it('should return null for malformed data', () => {
    const result = parseBadgeInfo({});
    expect(result).toBeNull();
  });
});
