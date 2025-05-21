import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

/**
 * Extracts the user ID from the authenticated user in the request
 * Usage: @UserId() userId: string
 */
export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return user.id || user.sub; // Support both id and sub (subject) from JWT
  },
);

/**
 * Extracts the entire user object from the authenticated request
 * Usage: @CurrentUser() user: Officer
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    return user;
  },
); 