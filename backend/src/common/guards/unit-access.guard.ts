import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const UNIT_ACCESS_KEY = 'unitAccess';

export const UnitAccess = (resource: string) => SetMetadata(UNIT_ACCESS_KEY, resource);

@Injectable()
export class UnitAccessGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resource = this.reflector.get<string>(UNIT_ACCESS_KEY, context.getHandler());
    
    if (!resource) {
      // No metadata defined, allow access
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!user.primaryUnitId) {
      throw new ForbiddenException('User does not have an associated unit');
    }

    // In the future, this can be expanded to check if the user has permission
    // to access the specific resource in their unit
    
    // For now, we just verify they have a unitId
    return true;
  }
} 