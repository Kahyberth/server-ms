import { Module } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { ChannelsGateway } from './channels.gateway';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Server } from './entities/server.entity';
import { Channel } from './entities/channel.entity';
import { Message } from './entities/message.entity';

@Module({
  providers: [ChannelsGateway, ChannelsService],
  imports: [CacheModule.register(), TypeOrmModule.forFeature([Server, Channel, Message])]
})
export class ChannelsModule {}
