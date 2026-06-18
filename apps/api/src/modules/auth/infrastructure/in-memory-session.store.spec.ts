import { InMemorySessionStore } from "./in-memory-session.store";

/**
 * Unit tests for the highest-risk part of the session subsystem: refresh-token
 * rotation with reuse detection (blueprint/15 "Token Rotation"). The in-memory
 * store mirrors the Redis adapter's semantics, so these assertions document the
 * contract both implementations must honor: only the most recent refresh hash
 * rotates; replaying a superseded hash is treated as theft and revokes the whole
 * family (fail-secure); a revoked family never rotates again.
 */
describe("InMemorySessionStore — rotation & reuse", () => {
  const TTL = 2_592_000;

  const openSession = async (store: InMemorySessionStore, userId = "user-1") => {
    const { sessionId, familyId } = await store.createSession({
      userId,
      deviceId: "device-1",
      riskLevel: "low",
      ttlSeconds: TTL,
    });
    await store.bindRefreshHash(sessionId, "hash-0", TTL);
    return { sessionId, familyId };
  };

  it("rotates when the presented hash is the current one", async () => {
    const store = new InMemorySessionStore();
    const { sessionId, familyId } = await openSession(store);

    const outcome = await store.rotate({
      sessionId,
      familyId,
      presentedHash: "hash-0",
      nextHash: "hash-1",
      ttlSeconds: TTL,
    });

    expect(outcome).toEqual({ kind: "rotated" });
  });

  it("rotates repeatedly as long as each presents the latest hash", async () => {
    const store = new InMemorySessionStore();
    const { sessionId, familyId } = await openSession(store);

    const first = await store.rotate({
      sessionId,
      familyId,
      presentedHash: "hash-0",
      nextHash: "hash-1",
      ttlSeconds: TTL,
    });
    const second = await store.rotate({
      sessionId,
      familyId,
      presentedHash: "hash-1",
      nextHash: "hash-2",
      ttlSeconds: TTL,
    });

    expect(first).toEqual({ kind: "rotated" });
    expect(second).toEqual({ kind: "rotated" });
  });

  it("flags reuse and revokes the family when a superseded hash is replayed", async () => {
    const store = new InMemorySessionStore();
    const { sessionId, familyId } = await openSession(store);

    // Legitimate rotation: hash-0 -> hash-1.
    await store.rotate({
      sessionId,
      familyId,
      presentedHash: "hash-0",
      nextHash: "hash-1",
      ttlSeconds: TTL,
    });

    // Attacker replays the now-superseded hash-0.
    const reuse = await store.rotate({
      sessionId,
      familyId,
      presentedHash: "hash-0",
      nextHash: "hash-evil",
      ttlSeconds: TTL,
    });
    expect(reuse).toEqual({ kind: "reuse_detected" });

    // The family is revoked, so even the legitimate latest hash is now dead.
    const afterRevocation = await store.rotate({
      sessionId,
      familyId,
      presentedHash: "hash-1",
      nextHash: "hash-2",
      ttlSeconds: TTL,
    });
    expect(afterRevocation).toEqual({ kind: "invalid" });
  });

  it("treats an explicitly revoked family as invalid", async () => {
    const store = new InMemorySessionStore();
    const { sessionId, familyId } = await openSession(store);

    await store.revokeFamily(familyId, TTL);

    const outcome = await store.rotate({
      sessionId,
      familyId,
      presentedHash: "hash-0",
      nextHash: "hash-1",
      ttlSeconds: TTL,
    });
    expect(outcome).toEqual({ kind: "invalid" });
  });

  it("treats unknown session/family ids as invalid (never throws)", async () => {
    const store = new InMemorySessionStore();

    const outcome = await store.rotate({
      sessionId: "nope",
      familyId: "nope",
      presentedHash: "hash-0",
      nextHash: "hash-1",
      ttlSeconds: TTL,
    });
    expect(outcome).toEqual({ kind: "invalid" });
  });

  it("revokeAllForUser kills every session for that user", async () => {
    const store = new InMemorySessionStore();
    const a = await openSession(store, "user-1");
    const b = await openSession(store, "user-1");
    const other = await openSession(store, "user-2");

    await store.revokeAllForUser("user-1", TTL);

    expect(
      await store.rotate({
        sessionId: a.sessionId,
        familyId: a.familyId,
        presentedHash: "hash-0",
        nextHash: "hash-1",
        ttlSeconds: TTL,
      }),
    ).toEqual({ kind: "invalid" });
    expect(
      await store.rotate({
        sessionId: b.sessionId,
        familyId: b.familyId,
        presentedHash: "hash-0",
        nextHash: "hash-1",
        ttlSeconds: TTL,
      }),
    ).toEqual({ kind: "invalid" });

    // A different user's session is untouched.
    expect(
      await store.rotate({
        sessionId: other.sessionId,
        familyId: other.familyId,
        presentedHash: "hash-0",
        nextHash: "hash-1",
        ttlSeconds: TTL,
      }),
    ).toEqual({ kind: "rotated" });
  });

  it("revokeSession ends a single session without revoking its family", async () => {
    const store = new InMemorySessionStore();
    const { sessionId, familyId } = await openSession(store);

    await store.revokeSession(sessionId);

    const outcome = await store.rotate({
      sessionId,
      familyId,
      presentedHash: "hash-0",
      nextHash: "hash-1",
      ttlSeconds: TTL,
    });
    // The session record is gone, so rotation finds nothing usable.
    expect(outcome).toEqual({ kind: "invalid" });
  });
});
