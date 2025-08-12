import { Inject, Injectable } from '@nestjs/common';
import { CreateServerDto } from './dto/create-server.dto';
import { DataSource, LessThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Server } from 'src/channels/entities/server.entity';
import { Channel } from 'src/channels/entities/channel.entity';
import { Message } from 'src/channels/entities/message.entity';
import { ClientProxy } from '@nestjs/microservices';
import { BaseTransactionService } from 'src/common/base-transaction.service';
import { LoadMessagesDto } from './dto/load-message.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { CreateChannelDto } from './dto/create-channel.dto';
import { GetChannelsDto } from './dto/get-channels.dto';
import { PaginatedResponseDto } from './dto/paginated-response.dto';

@Injectable()
export class ServerService extends BaseTransactionService {

  constructor(
    @InjectRepository(Channel)
    private readonly channelService: Repository<Channel>,
    @InjectRepository(Message)
    private readonly messageService: Repository<Message>,
    dataSource: DataSource,
    @Inject('NATS_SERVICE') private readonly client: ClientProxy,
  ) {
    super(dataSource);
  }

  async createServer(createServerDto: CreateServerDto) {
    console.log('createServerDto', createServerDto);
    return this.runInTransaction(
      async (manager) => {

        const serverEntity = manager.create(Server, createServerDto);
        const savedServer = await manager.save(Server, serverEntity);

        const defaultChannel = manager.create(Channel, {
          name: 'General',
          description: 'Canal general del servidor',
          created_by: createServerDto.created_by,
          server: savedServer,
          parent: undefined,
        });
        const savedChannel = await manager.save(Channel, defaultChannel);

        return { server: savedServer, defaultChannel: savedChannel };
      },

      async ({ server }) => {
        this.client.emit('server.create.channel.success', {
          teamId: server.teamId,
          leaderId: server.created_by,
        });
      },

      async (error) => {
        this.client.emit('server.create.channel.error', {
          teamId: createServerDto.teamId,
          reason: error.message,
        });
      },
    );
  }



  async createChannel(createChannelDto: CreateChannelDto) {
    return this.runInTransaction(async (manager) => {
      const server = await manager.findOne(Server, {
        where: { server_id: createChannelDto.serverId },
      });
      if (!server) throw new Error('Server not found');

      let parentChannel: Channel | null = null;
      if (createChannelDto.parentId) {
        parentChannel = await manager.findOne(Channel, {
          where: { channel_id: createChannelDto.parentId },
        });
        if (!parentChannel) throw new Error('Parent channel not found');
      }

      const channel = manager.create(Channel, {
        name: createChannelDto.name,
        description: createChannelDto.description,
        created_by: createChannelDto.created_by,
        server,
        parent: parentChannel ?? undefined,
      });

      return await manager.save(Channel, channel);
    });
  }

  async loadMessage(loadMessagDto: LoadMessagesDto) {
    const { channelId, limit = 20, before } = loadMessagDto;
    const where: any = { channel: { channel_id: channelId } };

    if (before) {
      where.createdAt = LessThan(new Date(before));
    }

    const messages = await this.messageService.find({
      where,
      relations: ['channel'],
      order: { createdAt: 'DESC', message_id: 'DESC' },
      take: limit,
    });

    // Limpiar los mensajes para reducir el payload
    const cleanedMessages = messages.map(msg => ({
      message_id: msg.message_id,
      userName: msg.userName,
      avatar: '', // Siempre vacío para reducir payload
      value: msg.value.length > 500 ? msg.value.substring(0, 500) + '...' : msg.value, // Truncar mensajes muy largos
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
      channel: {
        channel_id: msg.channel.channel_id,
        name: msg.channel.name,
        description: msg.channel.description,
        created_by: msg.channel.created_by,
        createdAt: msg.channel.createdAt,
        updatedAt: msg.channel.updatedAt
      }
    }));

    console.log('messages', cleanedMessages);
    return cleanedMessages.reverse();
  }

  async sendMessage(sendMessageDto: SendMessageDto, room: string) {
    const currentRoom = await this.channelService.findOneBy({ channel_id: room });
    if (!currentRoom) return;

    const messageEntity = this.messageService.create({
      avatar: sendMessageDto.avatar || '',
      channel: currentRoom,
      userName: sendMessageDto.userName,
      value: sendMessageDto.value,
    });

    return await this.messageService.save(messageEntity);
  }


  async getServerByTeamId(teamId: string): Promise<Server | null> {
    const server = await this.channelService.findOne({
      where: { server: { teamId } },
      relations: ['server']
    });
    return server?.server || null;
  }


  async getChannels(teamId: string, getChannelsDto: GetChannelsDto): Promise<PaginatedResponseDto<any>> {
    const { page = 1, limit = 20, orderBy = 'name', order = 'ASC' } = getChannelsDto;

    const offset = (page - 1) * limit;

    const server = await this.getServerByTeamId(teamId);
    if (!server) return {
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };

    const total = await this.channelService.count({
      where: { server: { server_id: server.server_id } },
    });

    const channels = await this.channelService.find({
      where: { server: { server_id: server.server_id } },
      relations: ['server'],
      order: { [orderBy]: order },
      skip: offset,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data: channels.map(channel => ({
        id: channel.channel_id,
        name: channel.name,
        description: channel.description,
        serverId: channel.server?.server_id,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }

}
