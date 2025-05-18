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

    // Verify password - argon2.verify automatically uses the parameters encoded in the hash
    const isPasswordValid = await argon2.verify(officer.passwordHash, pass);
    
    if (!isPasswordValid) {
      return null;
    }

    // Remove sensitive information
    const { passwordHash, salt, ...result } = officer;
    return result;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Use either email or username
    const userIdentifier = loginDto.email || loginDto.username;
    
    if (!userIdentifier) {
      throw new UnauthorizedException('Email or username is required');
    }
    
    // Find officer by email
    const officer = await this.officersService.findByEmail(userIdentifier, true);
    
    if (!officer) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Verify password
    const isPasswordValid = await argon2.verify(officer.passwordHash, loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Fetch officer with relations
    const officerWithRelations = await this.officersService.findByIdWithRelations(officer.id);
    
    if (!officerWithRelations) {
      throw new UnauthorizedException('Officer not found');
    }

    // Generate JWT token
    const payload = { sub: officer.id, email: officer.email, type: officer.userType };
    
    return {
      accessToken: this.jwtService.sign(payload),
      officer: {
        id: officerWithRelations.id,
        firstName: officerWithRelations.firstName,
        lastName: officerWithRelations.lastName,
        email: officerWithRelations.email,
        badgeNumber: officerWithRelations.badgeNumber,
        userType: officerWithRelations.userType,
        gender: officerWithRelations.gender,
        profilePhotoUrl: officerWithRelations.profilePhotoUrl,
        // Include basic information about rank
        rank: officerWithRelations.rank ? {
          id: officerWithRelations.rank.id,
          name: officerWithRelations.rank.name,
          abbreviation: officerWithRelations.rank.abbreviation,
          level: officerWithRelations.rank.level
        } : null,
        // Include basic information about organization
        organization: officerWithRelations.organization ? {
          id: officerWithRelations.organization.id,
          name: officerWithRelations.organization.name,
          code: officerWithRelations.organization.code,
          type: officerWithRelations.organization.type
        } : null,
        // Include basic information about primary unit
        primaryUnit: officerWithRelations.primaryUnit ? {
          id: officerWithRelations.primaryUnit.id,
          name: officerWithRelations.primaryUnit.name,
          code: officerWithRelations.primaryUnit.code,
          type: officerWithRelations.primaryUnit.type
        } : null,
        // Include basic information about department if applicable
        department: officerWithRelations.department ? {
          id: officerWithRelations.department.id,
          name: officerWithRelations.department.name
        } : null
      }
    };
  }
}
