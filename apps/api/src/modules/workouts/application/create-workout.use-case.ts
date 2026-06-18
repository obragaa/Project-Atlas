import { Inject, Injectable } from "@nestjs/common";
import { type CreateWorkoutRequest, type WorkoutView } from "@atlas/contracts";
import {
  DOMAIN_EVENT_PUBLISHER,
  type DomainEventPublisher,
} from "../../../shared/domain/domain-event-publisher.js";
import { WORKOUT_REPOSITORY, type WorkoutRepository } from "../domain/workout.repository.js";
import { Workout } from "../domain/workout.js";
import { WorkoutName } from "../domain/value-objects/workout-name.js";
import { assembleItems } from "./workout-assembler.js";
import { toWorkoutView } from "./workout.mapper.js";

export interface CreateWorkoutCommand {
  readonly userId: string;
  readonly request: CreateWorkoutRequest;
}

/**
 * Creates a workout owned by the caller (blueprint/07 "Criar treino", 13
 * Ownership). The use case owns the rule; the controller only delegates.
 */
@Injectable()
export class CreateWorkoutUseCase {
  constructor(
    @Inject(WORKOUT_REPOSITORY) private readonly workouts: WorkoutRepository,
    @Inject(DOMAIN_EVENT_PUBLISHER) private readonly events: DomainEventPublisher,
  ) {}

  async execute(command: CreateWorkoutCommand): Promise<WorkoutView> {
    const name = WorkoutName.create(command.request.name);
    const items = assembleItems(command.request.items ?? []);
    const workout = Workout.create({ userId: command.userId, name, items });

    await this.workouts.save(workout);
    await this.events.publishFor(workout);

    return toWorkoutView(workout);
  }
}
