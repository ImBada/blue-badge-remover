// src/content/index.ts
import { BadgeCache, parseBadgeInfo, detectBadgeSvg } from '@features/badge-detection';
import { FeedObserver, shouldHideTweet, shouldHideRetweet, getQuoteAction, hideTweet, type PageType } from '@features/content-filter';
import { getSettings, getWhitelist } from '@features/settings';
import { MESSAGE_TYPES, STORAGE_KEYS } from '@shared/constants';
import type { Settings } from '@shared/types';
import { logger } from '@shared/utils/logger';

const badgeCache = new BadgeCache();
let currentSettings: Settings;
let followSet = new Set<string>();
let whitelistSet = new Set<string>();
let feedObserver: FeedObserver;

async function init(): Promise<void> {
  currentSettings = await getSettings();

  const stored = await chrome.storage.local.get([STORAGE_KEYS.FOLLOW_LIST, STORAGE_KEYS.WHITELIST]);
  followSet = new Set((stored[STORAGE_KEYS.FOLLOW_LIST] as string[] | undefined) ?? []);
  const whitelist = (stored[STORAGE_KEYS.WHITELIST] as string[] | undefined) ?? [];
  whitelistSet = new Set(whitelist);

  injectFetchInterceptor();
  listenForMessages();
  listenForSettingsChanges();

  feedObserver = new FeedObserver(processTweet);
  startObserving();
  listenForNavigation();

  logger.info('Blue Badge Remover initialized');
}

function injectFetchInterceptor(): void {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('src/injected/fetch-interceptor.ts');
  (document.head ?? document.documentElement).appendChild(script);
  script.onload = () => script.remove();
}

function listenForMessages(): void {
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;

    if (event.data?.type === MESSAGE_TYPES.BADGE_DATA) {
      for (const userData of event.data.users) {
        const badge = parseBadgeInfo(userData);
        if (badge) {
          badgeCache.set(badge.userId, badge.isBluePremium);
        }
      }
    }

    if (event.data?.type === MESSAGE_TYPES.TOKEN_DATA) {
      chrome.storage.local.set({ [STORAGE_KEYS.TOKEN]: event.data.token });
    }

    if (event.data?.type === MESSAGE_TYPES.CSRF_TOKEN) {
      chrome.storage.local.set({ [STORAGE_KEYS.CSRF_TOKEN]: event.data.csrfToken });
    }

    if (event.data?.type === MESSAGE_TYPES.USER_ID) {
      handleUserIdMessage(event.data.userId as string);
    }
  });
}

async function handleUserIdMessage(newUserId: string): Promise<void> {
  if (!newUserId) return;

  const stored = await chrome.storage.local.get([STORAGE_KEYS.CURRENT_USER_ID]);
  const currentUserId = stored[STORAGE_KEYS.CURRENT_USER_ID] as string | null;

  if (currentUserId !== newUserId) {
    await chrome.storage.local.set({ [STORAGE_KEYS.CURRENT_USER_ID]: newUserId });
    chrome.runtime.sendMessage({ type: 'SYNC_FOLLOW_LIST' });
    logger.info('Account switched, re-syncing follow list', { newUserId });
  }
}

function listenForSettingsChanges(): void {
  chrome.storage.onChanged.addListener((changes) => {
    const settingsChange = changes[STORAGE_KEYS.SETTINGS];
    if (settingsChange) {
      currentSettings = settingsChange.newValue as Settings;
    }
    const followChange = changes[STORAGE_KEYS.FOLLOW_LIST];
    if (followChange) {
      followSet = new Set(followChange.newValue as string[]);
    }
    const whitelistChange = changes[STORAGE_KEYS.WHITELIST];
    if (whitelistChange) {
      whitelistSet = new Set(whitelistChange.newValue as string[]);
    }
  });
}

function getPageType(): PageType {
  const path = window.location.pathname;
  if (path.includes('/search')) return 'search';
  if (path.includes('/status/')) return 'replies';
  return 'timeline';
}

function processTweet(tweetEl: HTMLElement): void {
  const handleEl = tweetEl.querySelector('a[href^="/"]');
  const handle = handleEl?.getAttribute('href')?.slice(1);
  if (!handle) return;

  const userId = tweetEl.getAttribute('data-user-id') ?? handle;

  let isFadak = badgeCache.get(userId);
  if (isFadak === undefined) {
    isFadak = detectBadgeSvg(tweetEl);
    badgeCache.set(userId, isFadak);
  }

  const hide = shouldHideTweet({
    settings: currentSettings,
    followList: followSet,
    whitelist: whitelistSet,
    isFadak,
    userId,
    handle: `@${handle}`,
    pageType: getPageType(),
  });

  if (hide) {
    hideTweet(tweetEl, currentSettings.hideMode);
    return;
  }

  // Check if this is a retweet of a fadak account
  const isRetweet = tweetEl.querySelector('[data-testid="socialContext"]') !== null;
  if (isRetweet && isFadak) {
    const hideRetweet = shouldHideRetweet({
      settings: currentSettings,
      isFadak: true,
      isRetweet: true,
    });
    if (hideRetweet) {
      hideTweet(tweetEl, currentSettings.hideMode);
      return;
    }
  }

  // Check for quote tweets containing fadak content
  const quoteBlock = tweetEl.querySelector('[data-testid="quoteTweet"]') as HTMLElement | null;
  if (quoteBlock) {
    // Check if the quoted tweet's author is fadak
    const quoteBadge = detectBadgeSvg(quoteBlock);
    const quoteAction = getQuoteAction(currentSettings, quoteBadge);
    if (quoteAction === 'hide-entire') {
      hideTweet(tweetEl, currentSettings.hideMode);
      return;
    }
    if (quoteAction === 'hide-quote') {
      hideTweet(quoteBlock, currentSettings.hideMode);
      return;
    }
  }
}

function startObserving(): void {
  const feed = document.querySelector('main') ?? document.body;
  feedObserver.observe(feed);
}

function listenForNavigation(): void {
  const originalPushState = history.pushState;
  history.pushState = function (...args: Parameters<typeof history.pushState>) {
    originalPushState.apply(this, args);
    onNavigate();
  };
  window.addEventListener('popstate', onNavigate);
}

function onNavigate(): void {
  feedObserver.disconnect();
  requestAnimationFrame(() => startObserving());
}

init();
