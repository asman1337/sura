import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MalkhanaItem } from './entities/malkhana-item.entity';
import { Shelf } from './entities/shelf.entity';
import { RedInkHistory } from './entities/red-ink-history.entity';
import { MalkhanaController } from './controllers/malkhana.controller';
import { ShelvesController } from './controllers/shelves.controller';
import { MalkhanaService } from './services/malkhana.service';
import { ShelvesService } from './services/shelves.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MalkhanaItem, Shelf, RedInkHistory])
  ],
  controllers: [MalkhanaController, ShelvesController],
  providers: [MalkhanaService, ShelvesService],
  exports: [MalkhanaService, ShelvesService]
})
export class MalkhanaModule {} 