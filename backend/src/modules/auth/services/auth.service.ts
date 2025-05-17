import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { OfficersService } from '../../officers/services/officers.service';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private officersService: OfficersService,
    private jwtService: JwtService,
  ) {}

  async validateOfficer(email: string, pass: string): Promise<any> {
    const officer = await this.officersService.findByEmail(email, true);
    if (!officer) {
      return null;
    }

    const isPasswordValid = await argon2.verify(officer.passwordHash, pass);
    if (!isPasswordValid) {
      return null;
    }

    // Remove sensitive information
    const { passwordHash, salt, ...result } = officer;
    return result;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const officer = await this.officersService.findByEmailWithRelations(loginDto.email, loginDto.password);
    
    if (!officer) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { sub: officer.id, email: officer.email, type: officer.userType };
    
    return {
      accessToken: this.jwtService.sign(payload),
      officer: {
        id: officer.id,
        firstName: officer.firstName,
        lastName: officer.lastName,
        email: officer.email,
        badgeNumber: officer.badgeNumber,
        userType: officer.userType,
        gender: officer.gender,
        profilePhotoUrl: officer.profilePhotoUrl,
        // Include basic information about rank
        rank: officer.rank ? {
          id: officer.rank.id,
          name: officer.rank.name,
          abbreviation: officer.rank.abbreviation,
          level: officer.rank.level
        } : null,
        // Include basic information about organization
        organization: officer.organization ? {
          id: officer.organization.id,
          name: officer.organization.name,
          code: officer.organization.code,
          type: officer.organization.type
        } : null,
        // Include basic information about primary unit
        primaryUnit: officer.primaryUnit ? {
          id: officer.primaryUnit.id,
          name: officer.primaryUnit.name,
          code: officer.primaryUnit.code,
          type: officer.primaryUnit.type
        } : null,
        // Include basic information about department if applicable
        department: officer.department ? {
          id: officer.department.id,
          name: officer.department.name
        } : null
      }
    };
  }
}
