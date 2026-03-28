import { describe, it, expect } from 'vitest';
import { detectBadgeSvg } from '@features/badge-detection/svg-fallback';

describe('detectBadgeSvg', () => {
  it('should detect blue badge SVG in tweet element', () => {
    const el = document.createElement('div');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('data-testid', 'icon-verified');
    el.appendChild(svg);
    expect(detectBadgeSvg(el)).toBe(true);
  });

  it('should return false when no badge SVG', () => {
    const el = document.createElement('div');
    el.innerHTML = '<span>no badge</span>';
    expect(detectBadgeSvg(el)).toBe(false);
  });

  it('should return false for gold badge (business)', () => {
    const el = document.createElement('div');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('data-testid', 'icon-verified');
    svg.setAttribute('fill', '#E8B829');
    el.appendChild(svg);
    expect(detectBadgeSvg(el)).toBe(false);
  });

  it('should return false for grey badge (government)', () => {
    const el = document.createElement('div');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('data-testid', 'icon-verified');
    svg.setAttribute('fill', '#829AAB');
    el.appendChild(svg);
    expect(detectBadgeSvg(el)).toBe(false);
  });
});
