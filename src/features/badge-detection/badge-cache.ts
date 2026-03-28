export class BadgeCache {
  private cache = new Map<string, boolean>();

  get(userId: string): boolean | undefined {
    return this.cache.get(userId);
  }

  set(userId: string, isFadak: boolean): void {
    this.cache.set(userId, isFadak);
  }

  has(userId: string): boolean {
    return this.cache.has(userId);
  }
}
