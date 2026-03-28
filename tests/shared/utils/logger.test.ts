import { describe, it, expect, vi } from 'vitest';
import { logger } from '@shared/utils/logger';

describe('logger', () => {
  it('should log structured info message', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    logger.info('test message', { key: 'value' });
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('"level":"info"'),
    );
    spy.mockRestore();
  });

  it('should log structured warn message', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    logger.warn('warning');
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('"level":"warn"'),
    );
    spy.mockRestore();
  });
});
