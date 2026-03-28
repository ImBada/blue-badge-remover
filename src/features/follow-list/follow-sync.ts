// src/features/follow-list/follow-sync.ts
import { logger } from '@shared/utils/logger';

const FOLLOWING_ENDPOINT = 'https://api.x.com/graphql/';
const MAX_PAGES = 25; // Safety limit to prevent infinite loops

export async function fetchFollowList(token: string, userId: string, csrfToken: string = ''): Promise<string[]> {
  const allUserIds: string[] = [];
  let cursor: string | null = null;

  for (let page = 0; page < MAX_PAGES; page++) {
    const variables: Record<string, unknown> = { userId, count: 200 };
    if (cursor) {
      variables['cursor'] = cursor;
    }

    const response = await fetch(
      `${FOLLOWING_ENDPOINT}Following?variables=${encodeURIComponent(JSON.stringify(variables))}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
      },
    );

    if (!response.ok) {
      logger.error('Follow list fetch failed', { status: response.status, page });
      throw new Error(`Follow list API error: ${response.status}`);
    }

    const data = await response.json();
    let nextCursor: string | null = null;

    try {
      const instructions = data.data.user.result.timeline.timeline.instructions;
      for (const instruction of instructions) {
        const entries = instruction.entries ?? [];
        for (const entry of entries) {
          const restId = entry.content?.itemContent?.user_results?.result?.rest_id;
          if (typeof restId === 'string') {
            allUserIds.push(restId);
          }
          // Look for cursor entry
          const cursorValue = entry.content?.value;
          const cursorType = entry.content?.cursorType;
          if (cursorType === 'Bottom' && typeof cursorValue === 'string') {
            nextCursor = cursorValue;
          }
        }
      }
    } catch {
      logger.warn('Unexpected follow list response structure', { page });
    }

    if (!nextCursor || allUserIds.length === 0) break;
    cursor = nextCursor;
  }

  logger.info('Follow list fetched', { total: allUserIds.length });
  return allUserIds;
}
