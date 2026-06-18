import { InMemoryCache } from "./in-memory-cache.adapter";

describe("InMemoryCache", () => {
  it("stores and retrieves a value before expiry", async () => {
    const cache = new InMemoryCache();
    await cache.set("user:profile:1", { name: "Atlas" }, 60);
    expect(await cache.get<{ name: string }>("user:profile:1")).toEqual({ name: "Atlas" });
  });

  it("returns null on a miss", async () => {
    const cache = new InMemoryCache();
    expect(await cache.get("absent")).toBeNull();
  });

  it("expires entries after their ttl", async () => {
    const cache = new InMemoryCache();
    const realNow = Date.now;
    let clock = 1_000_000;
    Date.now = () => clock;
    try {
      await cache.set("k", "v", 1); // 1s ttl
      clock += 2_000; // advance 2s
      expect(await cache.get("k")).toBeNull();
    } finally {
      Date.now = realNow;
    }
  });

  it("deletes a key", async () => {
    const cache = new InMemoryCache();
    await cache.set("k", "v", 60);
    await cache.delete("k");
    expect(await cache.get("k")).toBeNull();
  });
});
