import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Officer } from './entities/officer.entity';
import { OfficersController } from './controllers/officers.controller';
import { OfficersService } from './services/officers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Officer])],
  controllers: [OfficersController],
  providers: [OfficersService],
  exports: [OfficersService]
})
export class OfficersModule {}
