import { NotFoundError } from "../../../../shared/domain/errors.js";
import { type WorkoutSessionRepository } from "../../domain/sessions/workout-session.repository.js";
import { type WorkoutSession } from "../../domain/sessions/workout-session.js";
import { WorkoutSessionId } from "../../domain/sessions/session-id.js";

/**
 * Loads a session and enforces ownership (blueprint/13 Ownership, 15 Least
 * Privilege). A session that does not exist OR is not owned by the caller yields
 * the SAME not-found error, so the endpoint never reveals other users' ids
 * (no enumeration — doc 16).
 */
export async function loadOwnedSession(
  sessions: WorkoutSessionRepository,
  rawId: string,
  userId: string,
): Promise<WorkoutSession> {
  const id = parseId(rawId);
  const session = id ? await sessions.findById(id) : null;
  if (!session || !session.isOwnedBy(userId)) {
    throw new NotFoundError("Sessão de treino não encontrada.", "session.not_found");
  }
  return session;
}

/** A malformed id is treated as "not found", never a 500 (defensive). */
function parseId(rawId: string): WorkoutSessionId | null {
  try {
    return WorkoutSessionId.create(rawId);
  } catch {
    return null;
  }
}
