import { STORAGE_KEYS } from '@shared/constants';
import { logger } from '@shared/utils/logger';

chrome.runtime.onInstalled.addListener(async () => {
  logger.info('Blue Badge Remover installed');
  await syncFollowList();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SYNC_FOLLOW_LIST') {
    syncFollowList().then(() => sendResponse({ success: true })).catch((err) => {
      logger.error('Follow sync failed', { error: String(err) });
      sendResponse({ success: false, error: String(err) });
    });
    return true;
  }
});

async function syncFollowList(): Promise<void> {
  const stored = await chrome.storage.local.get([STORAGE_KEYS.TOKEN, STORAGE_KEYS.CURRENT_USER_ID, STORAGE_KEYS.CSRF_TOKEN]);
  const token = stored[STORAGE_KEYS.TOKEN] as string | null;
  const userId = stored[STORAGE_KEYS.CURRENT_USER_ID] as string | null;
  const csrfToken = (stored[STORAGE_KEYS.CSRF_TOKEN] as string | null) ?? '';

  if (!token || !userId) {
    logger.warn('Cannot sync: no token or userId');
    return;
  }

  const { fetchFollowList } = await import('@features/follow-list/follow-sync');
  const followIds = await fetchFollowList(token, userId, csrfToken);
  await chrome.storage.local.set({
    [STORAGE_KEYS.FOLLOW_LIST]: followIds,
    [STORAGE_KEYS.LAST_SYNC_AT]: new Date().toISOString(),
  });
  logger.info('Follow list synced', { count: followIds.length });
}
