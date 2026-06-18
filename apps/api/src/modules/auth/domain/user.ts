import { type Role } from "@atlas/contracts";
import { AggregateRoot } from "../../../shared/domain/aggregate-root.js";
import { type Email } from "./value-objects/email.js";
import { UserId } from "./user-id.js";
import { UserRegistered } from "./events.js";

interface UserProps {
  readonly email: Email;
  readonly passwordHash: string;
  displayName: string;
  roles: Role[];
  readonly createdAt: Date;
}

/**
 * User aggregate root (blueprint/12, 13, 15). Owns its own consistency:
 * credentials are stored only as an opaque hash; the aggregate never sees or
 * keeps plaintext. Identity is the opaque `UserId`, never the email.
 */
export class User extends AggregateRoot<UserId> {
  private readonly props: UserProps;

  private constructor(id: UserId, props: UserProps) {
    super(id);
    this.props = props;
  }

  /** Rehydrate an existing user from persistence (no events emitted). */
  static restore(id: UserId, props: UserProps): User {
    return new User(id, props);
  }

  /**
   * Register a brand-new user. Every new account starts with the least
   * privilege: the `user` role only (blueprint/15 "Least Privilege").
   */
  static register(params: { email: Email; passwordHash: string; displayName: string }): User {
    const user = new User(UserId.generate(), {
      email: params.email,
      passwordHash: params.passwordHash,
      displayName: params.displayName.trim(),
      roles: ["user"],
      createdAt: new Date(),
    });
    user.addDomainEvent(new UserRegistered(user.id.toString(), params.email.value));
    return user;
  }

  get email(): Email {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get displayName(): string {
    return this.props.displayName;
  }

  get roles(): readonly Role[] {
    return this.props.roles;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
