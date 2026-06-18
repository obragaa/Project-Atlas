import { type CanActivate, type ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthenticationError } from "../../../shared/domain/errors.js";
import { TOKEN_SERVICE, type TokenService } from "../domain/ports.js";
import { type AuthenticatedRequest } from "./authenticated-request.js";
import { IS_PUBLIC_KEY } from "./public.decorator.js";

/**
 * Global authentication guard (blueprint/15: authentication never implies
 * authorization, but every non-public request must first prove identity).
 * Reads the Bearer access token, verifies it, and attaches the principal.
 * Secure by default — only `@Public()` routes are exempt.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearer(request.headers.authorization);
    if (!token) {
      throw new AuthenticationError();
    }

    try {
      const claims = await this.tokens.verifyAccessToken(token);
      request.principal = { id: claims.sub, roles: claims.roles };
      return true;
    } catch {
      throw new AuthenticationError("Sessão inválida ou expirada.", "auth.invalid_token");
    }
  }

  private extractBearer(header: string | undefined): string | null {
    if (!header) {
      return null;
    }
    const [scheme, value] = header.split(" ");
    return scheme === "Bearer" && value ? value : null;
  }
}
