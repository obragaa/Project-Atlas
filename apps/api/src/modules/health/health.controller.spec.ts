import { HealthController } from "./health.controller.js";

describe("HealthController", () => {
  const controller = new HealthController();

  it("reports liveness as ok with a timestamp and version", () => {
    const report = controller.liveness();
    expect(report.status).toBe("ok");
    expect(report.version).toBeTruthy();
    expect(() => new Date(report.checkedAt)).not.toThrow();
  });

  it("reports readiness as ok", () => {
    expect(controller.readiness().status).toBe("ok");
  });
});
