import type { BadgeInfo } from '@shared/types';

interface XUserData {
  rest_id?: string;
  is_blue_verified?: boolean;
  verified_type?: string;
  legacy?: {
    verified?: boolean;
  };
}

export function parseBadgeInfo(userData: unknown): BadgeInfo | null {
  const data = userData as XUserData;
  if (!data?.rest_id || typeof data.is_blue_verified !== 'boolean') {
    return null;
  }

  if (!data.is_blue_verified) {
    return null;
  }

  const isBusiness = data.verified_type === 'Business';
  const isLegacyVerified = data.legacy?.verified === true;
  const isBluePremium = !isBusiness && !isLegacyVerified;

  return {
    userId: data.rest_id,
    isBluePremium,
    isLegacyVerified,
    isBusiness,
  };
}
