import { MeasurementEntry } from "./measurement-entry";
import { MeasurementDate } from "./value-objects/measurement-date";
import { BodyMeasurements } from "./value-objects/body-measurements";

const USER = "11111111-1111-4111-8111-111111111111";
const date = (iso = "2026-06-18") => MeasurementDate.create(iso);
const noMeasures = () => BodyMeasurements.create({});

describe("MeasurementEntry", () => {
  it("records an entry with weight and emits MeasurementRecorded", () => {
    const entry = MeasurementEntry.record({
      userId: USER,
      recordedOn: date(),
      weightKg: 80.4,
      measurements: noMeasures(),
    });

    expect(entry.weightKg).toBe(80.4);
    expect(entry.recordedOn.value).toBe("2026-06-18");
    expect(entry.isOwnedBy(USER)).toBe(true);
    const events = entry.pullDomainEvents();
    expect(events.map((e) => e.name)).toEqual(["MeasurementRecorded"]);
  });

  it("records an entry with only measurements (no weight)", () => {
    const entry = MeasurementEntry.record({
      userId: USER,
      recordedOn: date(),
      weightKg: null,
      measurements: BodyMeasurements.create({ waist: 82, arm: 38 }),
    });
    expect(entry.weightKg).toBeNull();
    expect(entry.measurements.fields.waist).toBe(82);
    expect(entry.measurements.fields.arm).toBe(38);
    expect(entry.measurements.fields.chest).toBeNull();
  });

  it("rejects an empty entry (no weight and no measurements)", () => {
    expect(() =>
      MeasurementEntry.record({ userId: USER, recordedOn: date(), measurements: noMeasures() }),
    ).toThrowError(/peso ou ao menos uma medida/i);
  });

  it("rounds weight to one decimal", () => {
    const entry = MeasurementEntry.record({
      userId: USER,
      recordedOn: date(),
      weightKg: 80.456,
      measurements: noMeasures(),
    });
    expect(entry.weightKg).toBe(80.5);
  });

  it("rejects an invalid weight", () => {
    expect(() =>
      MeasurementEntry.record({
        userId: USER,
        recordedOn: date(),
        weightKg: -5,
        measurements: noMeasures(),
      }),
    ).toThrowError(/peso inv/i);
  });

  it("is not owned by another user", () => {
    const entry = MeasurementEntry.record({
      userId: USER,
      recordedOn: date(),
      weightKg: 80,
      measurements: noMeasures(),
    });
    expect(entry.isOwnedBy("22222222-2222-4222-8222-222222222222")).toBe(false);
  });
});

describe("MeasurementDate", () => {
  it("accepts a valid ISO date", () => {
    expect(MeasurementDate.create("2026-01-15").value).toBe("2026-01-15");
  });
  it("rejects a malformed date", () => {
    expect(() => MeasurementDate.create("15/01/2026")).toThrowError(/data inv/i);
  });
  it("rejects an impossible date", () => {
    expect(() => MeasurementDate.create("2026-02-30")).toThrowError(/data inv/i);
  });
});

describe("BodyMeasurements", () => {
  it("treats absent fields as null and reports empty", () => {
    const m = BodyMeasurements.create({});
    expect(m.isEmpty()).toBe(true);
    expect(m.fields.waist).toBeNull();
  });
  it("is not empty when a field is present", () => {
    expect(BodyMeasurements.create({ chest: 100 }).isEmpty()).toBe(false);
  });
  it("rejects an out-of-range measurement", () => {
    expect(() => BodyMeasurements.create({ waist: 0 })).toThrowError(/medida/i);
    expect(() => BodyMeasurements.create({ waist: 999 })).toThrowError(/medida/i);
  });
});
