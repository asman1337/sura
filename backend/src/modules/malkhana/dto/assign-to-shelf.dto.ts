import { IsNotEmpty, IsString } from 'class-validator';

export class AssignToShelfDto {
  @IsNotEmpty()
  @IsString()
  shelfId: string;
} 