import redis from "@/lib/redis";

export const CacheKeys = {
  user: (id: string) => `user:${id}`,
  list: (resource: string) => `list:${resource}`,
  single: (resource: string, id: string) => `single:${resource}:${id}`,
  userScoped: (resource: string, userId: string) =>
    `user:${userId}:${resource}`,
  adminScoped: (resource: string) => `admin:${resource}`,
};

export const CacheTTL = {
  SHORT: 30, // 30 seconds → for very frequent / rapidly changing data
  MEDIUM: 60 * 5, // 5 minutes → for semi-dynamic data (e.g. user session, small updates)
  LONG: 60 * 60, // 1 hour → for stable data (e.g. dashboard stats, configs)
  DAY: 60 * 60 * 24, // 24 hours → for rarely changing data (e.g. static content)
};

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data as string) as T;
  } catch {
    return null;
  }
}

export async function setCache<T>(
  key: string,
  data: T,
  ttl: number = CacheTTL.MEDIUM,
): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(data), { ex: ttl });
  } catch {}
}

export async function deleteCache(...keys: string[]): Promise<void> {
  try {
    if (keys.length > 0) await redis.del(...keys);
  } catch {}
}

export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CacheTTL.MEDIUM,
): Promise<T> {
  const cached = await getCache<T>(key);
  if (cached !== null) return cached;

  const data = await fetcher();
  await setCache(key, data, ttl);

  return data;
}
