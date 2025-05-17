import { Module } from '@nestjs/common';
import { OfficersController } from './controllers/officers.controller';
import { OfficersService } from './services/officers.service';

@Module({
  controllers: [OfficersController],
  providers: [OfficersService]
})
export class OfficersModule {}
