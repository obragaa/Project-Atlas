import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "atlas:isPublic";

/**
 * Marks a route as publicly accessible, bypassing the global auth guard.
 * Secure by default: routes are protected unless explicitly made `@Public()`
 * (blueprint/16 - Security.md "Secure by Default").
 */
export const Public = (): MethodDecorator & ClassDecorator => SetMetadata(IS_PUBLIC_KEY, true);
