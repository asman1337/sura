export class ShelfResponseDto {
  id: string;
  name: string;
  location: string;
  category?: string;
  qrCodeUrl?: string;
  itemCount?: number;
  createdAt: Date;
  updatedAt: Date;
} 