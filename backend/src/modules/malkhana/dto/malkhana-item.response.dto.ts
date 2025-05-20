import { MalkhanaItemStatus, RegistryType } from '../entities/malkhana-item.entity';
import { ShelfResponseDto } from './shelf.response.dto';

export class RedInkHistoryDto {
  id: string;
  year: number;
  redInkId: number;
}

export class MalkhanaItemResponseDto {
  id: string;
  registryNumber: number;
  motherNumber: string;
  caseNumber: string;
  description: string;
  category: string;
  dateReceived: Date;
  receivedFrom: string;
  condition: string;
  status: MalkhanaItemStatus;
  disposalDate?: Date;
  disposalReason?: string;
  disposalApprovedBy?: string;
  notes?: string;
  registryType: RegistryType;
  registryYear: number;
  photos?: string[];
  shelfId?: string;
  shelf?: ShelfResponseDto;
  qrCodeUrl?: string;
  redInkHistory?: RedInkHistoryDto[];
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
} 