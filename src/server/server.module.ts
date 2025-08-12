import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { ServerService } from './server.service';
import { ServerController } from './server.controller';
import { Channel } from 'src/channels/entities/channel.entity';
import { Message } from 'src/channels/entities/message.entity'
import { Server } from 'src/channels/entities/server.entity';
import { envs } from 'src/common/envs';

@Module({
  controllers: [ServerController],
  providers: [ServerService],
  imports: [TypeOrmModule.forFeature([Server, Channel, Message]), ClientsModule.register([
    {
      name: 'NATS_SERVICE',
      transport: Transport.NATS,
      options: {
        servers: envs.NATS_SERVERS,
      },
    },
  ])],
  exports: [ServerService, TypeOrmModule],
})
export class ServerModule {}
