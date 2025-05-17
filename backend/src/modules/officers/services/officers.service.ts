import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Officer } from '../entities/officer.entity';
import * as argon2 from 'argon2';

@Injectable()
export class OfficersService {
  constructor(
    @InjectRepository(Officer)
    private officersRepository: Repository<Officer>,
  ) {}

  /**
   * Find an officer by email
   * @param email The officer's email
   * @param includePassword Whether to include the password hash in the result
   * @returns The officer or null if not found
   */
  async findByEmail(email: string, includePassword = false): Promise<Officer | null> {
    const query = this.officersRepository.createQueryBuilder('officer')
      .where('officer.email = :email', { email });
    
    if (includePassword) {
      query.addSelect('officer.passwordHash');
    }
    
    return query.getOne();
  }

  /**
   * Find an officer by email with all relations for authentication
   * @param email The officer's email
   * @param password The officer's password
   * @returns The officer with related entities or null if authentication fails
   */
  async findByEmailWithRelations(email: string, password: string): Promise<Officer | null> {
    // First, get the officer with password hash
    const officer = await this.findByEmail(email, true);
    if (!officer) {
      return null;
    }

    // Verify password
    const isPasswordValid = await argon2.verify(officer.passwordHash, password);
    if (!isPasswordValid) {
      return null;
    }

    // Now fetch the officer with relations
    const officerWithRelations = await this.officersRepository.findOne({
      where: { id: officer.id },
      relations: {
        rank: true,
        organization: true,
        primaryUnit: true,
        department: true
      }
    });

    // Remove sensitive information
    if (officerWithRelations) {
      // Create a new object without sensitive fields
      const { passwordHash, salt, ...safeOfficer } = officerWithRelations;
      return safeOfficer as Officer;
    }

    return null;
  }

  /**
   * Find an officer by ID
   * @param id The officer's ID
   * @returns The officer or throws NotFoundException if not found
   */
  async findById(id: string): Promise<Officer> {
    const officer = await this.officersRepository.findOne({ where: { id } });
    if (!officer) {
      throw new NotFoundException(`Officer with ID ${id} not found`);
    }
    return officer;
  }
}
