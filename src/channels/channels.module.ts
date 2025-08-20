import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { Server } from './entities/server.entity';
import { Channel } from './entities/channel.entity';
import { Message } from './entities/message.entity';
import { ChannelsGateway } from './channels.gateway';
import { ChannelsController } from './channels.controller';
import { BaseTransactionService } from '../common/base-transaction.service';
import { ServerModule } from '../server/server.module';

@Module({
  controllers: [ChannelsController],
  providers: [ChannelsGateway, BaseTransactionService],
  imports: [CacheModule.register(), TypeOrmModule.forFeature([Server, Channel, Message]), ServerModule],
  exports: [ChannelsGateway, TypeOrmModule],
})
export class ChannelsModule {}
