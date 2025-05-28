import { IsNotEmpty, IsNumber } from 'class-validator';

export class YearTransitionDto {
  @IsNotEmpty()
  @IsNumber()
  newYear: number;
}

export class YearTransitionResponseDto {
  success: boolean;
  message: string;
  itemsTransitioned: number;
  previousYear: number;
  newYear: number;
} 