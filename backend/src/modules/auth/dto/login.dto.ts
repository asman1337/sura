import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @IsOptional()
  @IsEmail()
  email?: string;
  
  @IsOptional()
  @IsString()
  username?: string;
  
  @IsNotEmpty()
  @IsString()
  password: string;
  
  // Getter to handle both email and username inputs
  get userIdentifier(): string {
    return this.email || this.username || '';
  }
} 