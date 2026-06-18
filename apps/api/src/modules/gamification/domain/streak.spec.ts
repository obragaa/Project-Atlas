import { computeStreak } from "./streak";

describe("computeStreak", () => {
  it("returns zero for no activity", () => {
    expect(computeStreak([], "2026-06-18")).toEqual({ current: 0, longest: 0, activeToday: false });
  });

  it("counts a single active day today", () => {
    expect(computeStreak(["2026-06-18"], "2026-06-18")).toEqual({
      current: 1,
      longest: 1,
      activeToday: true,
    });
  });

  it("counts consecutive days ending today", () => {
    const dates = ["2026-06-16", "2026-06-17", "2026-06-18"];
    expect(computeStreak(dates, "2026-06-18")).toEqual({
      current: 3,
      longest: 3,
      activeToday: true,
    });
  });

  it("keeps the current run when the last active day was yesterday (grace)", () => {
    const dates = ["2026-06-16", "2026-06-17"];
    // Today is the 18th, last activity the 17th → streak not broken yet.
    expect(computeStreak(dates, "2026-06-18")).toEqual({
      current: 2,
      longest: 2,
      activeToday: false,
    });
  });

  it("resets the current run when a full day was missed", () => {
    const dates = ["2026-06-14", "2026-06-15"];
    // Today is the 18th; last activity the 15th → current 0, but longest stays.
    expect(computeStreak(dates, "2026-06-18")).toEqual({
      current: 0,
      longest: 2,
      activeToday: false,
    });
  });

  it("computes the longest run across a gap", () => {
    const dates = ["2026-06-01", "2026-06-02", "2026-06-03", "2026-06-10", "2026-06-11"];
    const r = computeStreak(dates, "2026-06-18");
    expect(r.longest).toBe(3);
    expect(r.current).toBe(0);
  });

  it("dedupes repeated dates and ignores order", () => {
    const dates = ["2026-06-18", "2026-06-16", "2026-06-18", "2026-06-17"];
    expect(computeStreak(dates, "2026-06-18")).toEqual({
      current: 3,
      longest: 3,
      activeToday: true,
    });
  });
});
