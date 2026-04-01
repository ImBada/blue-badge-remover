import { logger } from '@shared/utils/logger';

chrome.runtime.onInstalled.addListener(() => {
  logger.info('Blue Badge Remover installed');
});

// Firefox for Android: 팝업 대신 새 탭으로 열기
// Firefox 모바일에서는 팝업 내 버튼 클릭 시 탭 이동이 비정상적으로 동작하는 문제가 있음
if (navigator.userAgent.includes('Firefox') && navigator.userAgent.includes('Android')) {
  chrome.action.setPopup({ popup: '' });
  chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/popup/index.html') });
  });
}
