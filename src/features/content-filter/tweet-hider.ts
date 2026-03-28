// src/features/content-filter/tweet-hider.ts
const ORIGINAL_CONTENT_KEY = 'data-bbr-original';
const COLLAPSED_ATTR = 'data-bbr-collapsed';

export function hideTweet(element: HTMLElement, mode: 'remove' | 'collapse'): void {
  if (mode === 'remove') {
    element.style.display = 'none';
    element.setAttribute(ORIGINAL_CONTENT_KEY, 'hidden');
    return;
  }

  element.setAttribute(ORIGINAL_CONTENT_KEY, 'collapsed');
  const originalChildren = Array.from(element.childNodes);
  originalChildren.forEach((child) => {
    if (child instanceof HTMLElement) {
      child.style.display = 'none';
    }
  });

  const placeholder = document.createElement('div');
  placeholder.setAttribute(COLLAPSED_ATTR, 'true');
  placeholder.textContent = '숨겨진 트윗 (클릭하여 펼치기)';
  placeholder.style.cssText = 'padding:12px;color:#71767b;cursor:pointer;text-align:center;';
  placeholder.addEventListener('click', () => showTweet(element), { once: true });
  element.appendChild(placeholder);
}

export function showTweet(element: HTMLElement): void {
  element.style.display = '';
  element.removeAttribute(ORIGINAL_CONTENT_KEY);

  const placeholder = element.querySelector(`[${COLLAPSED_ATTR}]`);
  placeholder?.remove();

  Array.from(element.childNodes).forEach((child) => {
    if (child instanceof HTMLElement) {
      child.style.display = '';
    }
  });
}
