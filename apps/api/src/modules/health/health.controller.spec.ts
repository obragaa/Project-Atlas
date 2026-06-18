import { type HealthReport } from "@atlas/contracts";
import { HealthController } from "./health.controller";
import { type ReadinessService } from "./readiness.service";

/** Minimal Express Response double capturing status + json body. */
function fakeResponse() {
  const captured: { status?: number; body?: unknown } = {};
  const res = {
    status(code: number) {
      captured.status = code;
      return res;
    },
    json(body: unknown) {
      captured.body = body;
      return res;
    },
  };
  return { res, captured };
}

describe("HealthController", () => {
  const buildController = (report: HealthReport) =>
    new HealthController({ check: () => Promise.resolve(report) } as unknown as ReadinessService);

  it("liveness is dependency-free and ok", () => {
    const report = buildController(okReport()).liveness();
    expect(report.status).toBe("ok");
    expect(report.checks).toBeUndefined();
  });

  it("startup is dependency-free and ok", () => {
    expect(buildController(okReport()).startup().status).toBe("ok");
  });

  it("readiness returns 200 when all critical dependencies are up", async () => {
    const { res, captured } = fakeResponse();
    await buildController(okReport()).readinessProbe(res as never);
    expect(captured.status).toBe(200);
    expect((captured.body as HealthReport).status).toBe("ok");
    expect((captured.body as HealthReport).checks).toHaveLength(2);
  });

  it("readiness returns 503 when a critical dependency is down", async () => {
    const down: HealthReport = {
      status: "down",
      checkedAt: new Date().toISOString(),
      version: "0.1.0",
      checks: [{ name: "postgres", status: "down", durationMs: 5, detail: "database unreachable" }],
    };
    const { res, captured } = fakeResponse();
    await buildController(down).readinessProbe(res as never);
    expect(captured.status).toBe(503);
    expect((captured.body as HealthReport).status).toBe("down");
  });
});

function okReport(): HealthReport {
  return {
    status: "ok",
    checkedAt: new Date().toISOString(),
    version: "0.1.0",
    checks: [
      { name: "postgres", status: "ok", durationMs: 2 },
      { name: "redis", status: "ok", durationMs: 1 },
    ],
  };
}
