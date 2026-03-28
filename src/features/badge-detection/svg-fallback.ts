const VERIFIED_BADGE_SELECTOR = '[data-testid="icon-verified"]';

export function detectBadgeSvg(tweetElement: Element): boolean {
  const badge = tweetElement.querySelector(VERIFIED_BADGE_SELECTOR);
  if (!badge) return false;

  // Check if it's a blue badge (not gold/grey)
  // Gold badges are used for businesses, grey for government
  const svg = badge.closest('svg') ?? badge;
  const fill = svg.getAttribute('fill') ?? '';
  const style = svg.getAttribute('style') ?? '';
  const computedColor = (svg as HTMLElement).style?.color ?? '';

  // Gold badge color
  if (fill.includes('#E8B829') || fill.includes('#F4D03F') || style.includes('gold')) return false;
  // Grey badge color
  if (fill.includes('#829AAB') || fill.includes('grey') || fill.includes('gray')) return false;

  return true;
}
