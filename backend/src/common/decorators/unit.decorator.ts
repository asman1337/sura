import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

/**
 * Extracts the unitId from the authenticated user in the request
 * Usage: @UnitId() unitId: string
 * 
 * For admin users, this can be null - you may need to handle that in your service/controller
 */
export const UnitId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // For system administrators or specific test scenarios, we may allow null units
    if (user.userType === 'ADMIN' && !user.primaryUnitId) {
      console.warn('Admin user without primary unit is accessing unit-scoped resource');
      // For admin users, use a special "admin" unit ID or create a system-wide view
      // Here we return null, but services should handle this special case
      return null;
    }

    if (!user.primaryUnitId) {
      throw new UnauthorizedException('User does not have an associated unit');
    }

    return user.primaryUnitId;
  },
);

/**
 * Extracts the entire unit object from the authenticated user in the request
 * Usage: @UserUnit() unit: Unit
 */
export const UserUnit = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // For system administrators, we may allow null units
    if (user.userType === 'ADMIN' && !user.primaryUnit) {
      console.warn('Admin user without primary unit is accessing unit-scoped resource');
      return null;
    }

    if (!user.primaryUnit) {
      throw new UnauthorizedException('User does not have an associated unit');
    }

    return user.primaryUnit;
  },
); 