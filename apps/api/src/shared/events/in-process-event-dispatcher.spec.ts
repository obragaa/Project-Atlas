import { InProcessEventDispatcher } from "./in-process-event-dispatcher";
import { AggregateRoot } from "../domain/aggregate-root";
import { Identifier } from "../domain/identifier";
import { type DomainEvent } from "../domain/domain-event";

const AGG_UUID = "11111111-1111-4111-8111-111111111111";

class TestId extends Identifier<string> {
  static of(value: string): TestId {
    return new TestId(value);
  }
}

class Thing extends AggregateRoot<TestId> {
  static create(id: TestId, event: DomainEvent): Thing {
    const thing = new Thing(id);
    thing.addDomainEvent(event);
    return thing;
  }
}

const makeEvent = (name: string, aggregateId = AGG_UUID): DomainEvent => ({
  name,
  aggregateId,
  occurredAt: new Date(0),
});

// Minimal PinoLogger stand-in — only `warn` is used by the dispatcher.
const fakeLogger = { warn: () => undefined } as unknown as ConstructorParameters<
  typeof InProcessEventDispatcher
>[0];

describe("InProcessEventDispatcher", () => {
  it("invokes every handler registered for an event name", async () => {
    const dispatcher = new InProcessEventDispatcher(fakeLogger);
    const seen: string[] = [];
    dispatcher.on("Created", () => void seen.push("a"));
    dispatcher.on("Created", () => void seen.push("b"));
    dispatcher.on("Other", () => void seen.push("c"));

    await dispatcher.publish([makeEvent("Created")]);

    expect(seen).toEqual(["a", "b"]);
  });

  it("isolates a throwing handler so later handlers and the caller are unaffected", async () => {
    const dispatcher = new InProcessEventDispatcher(fakeLogger);
    const seen: string[] = [];
    dispatcher.on("Created", () => {
      throw new Error("handler boom");
    });
    dispatcher.on("Created", () => void seen.push("after"));

    await expect(dispatcher.publish([makeEvent("Created")])).resolves.toBeUndefined();
    expect(seen).toEqual(["after"]);
  });

  it("publishFor drains the aggregate's events and dispatches them once", async () => {
    const dispatcher = new InProcessEventDispatcher(fakeLogger);
    let count = 0;
    dispatcher.on("Created", () => void (count += 1));
    const thing = Thing.create(TestId.of(AGG_UUID), makeEvent("Created"));

    await dispatcher.publishFor(thing);
    expect(count).toBe(1);
    expect(thing.domainEvents).toHaveLength(0);

    // A second publish has nothing left to dispatch (no double-fire).
    await dispatcher.publishFor(thing);
    expect(count).toBe(1);
  });
});
