import { dayRange, weekRange } from "./period-range";

describe("period-range", () => {
  it("dayRange is the single reference day", () => {
    expect(dayRange("2026-06-18")).toEqual({ fromIso: "2026-06-18", toIso: "2026-06-18" });
  });

  it("weekRange spans Monday to Sunday containing the date", () => {
    // 2026-06-18 is a Thursday → week is Mon 15th to Sun 21st.
    expect(weekRange("2026-06-18")).toEqual({ fromIso: "2026-06-15", toIso: "2026-06-21" });
  });

  it("weekRange on a Monday starts that Monday", () => {
    expect(weekRange("2026-06-15")).toEqual({ fromIso: "2026-06-15", toIso: "2026-06-21" });
  });

  it("weekRange on a Sunday ends that Sunday", () => {
    expect(weekRange("2026-06-21")).toEqual({ fromIso: "2026-06-15", toIso: "2026-06-21" });
  });

  it("weekRange handles a month boundary", () => {
    // 2026-07-01 is a Wednesday → week Mon 2026-06-29 to Sun 2026-07-05.
    expect(weekRange("2026-07-01")).toEqual({ fromIso: "2026-06-29", toIso: "2026-07-05" });
  });
});
