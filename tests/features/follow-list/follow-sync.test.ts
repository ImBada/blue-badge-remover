// tests/features/follow-list/follow-sync.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchFollowList } from '@features/follow-list/follow-sync';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('fetchFollowList', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should return user IDs from API response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: {
          user: {
            result: {
              timeline: {
                timeline: {
                  instructions: [{
                    entries: [
                      {
                        content: {
                          itemContent: {
                            user_results: {
                              result: { rest_id: '111' },
                            },
                          },
                        },
                      },
                      {
                        content: {
                          itemContent: {
                            user_results: {
                              result: { rest_id: '222' },
                            },
                          },
                        },
                      },
                    ],
                  }],
                },
              },
            },
          },
        },
      }),
    });

    const result = await fetchFollowList('test-token', 'user123');
    expect(result).toContain('111');
    expect(result).toContain('222');
  });

  it('should throw on API error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 });
    await expect(fetchFollowList('bad-token', 'user123')).rejects.toThrow();
  });

  it('should handle pagination with cursor', async () => {
    // Page 1
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: {
          user: {
            result: {
              timeline: {
                timeline: {
                  instructions: [{
                    entries: [
                      { content: { itemContent: { user_results: { result: { rest_id: '111' } } } } },
                      { content: { value: 'cursor-abc', cursorType: 'Bottom' } },
                    ],
                  }],
                },
              },
            },
          },
        },
      }),
    });
    // Page 2 (no more cursor)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        data: {
          user: {
            result: {
              timeline: {
                timeline: {
                  instructions: [{
                    entries: [
                      { content: { itemContent: { user_results: { result: { rest_id: '222' } } } } },
                    ],
                  }],
                },
              },
            },
          },
        },
      }),
    });

    const result = await fetchFollowList('token', 'user123', 'csrf-token');
    expect(result).toEqual(['111', '222']);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
