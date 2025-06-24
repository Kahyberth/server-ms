import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { CreateServerDto } from './dto/create-server.dto';

import { Server } from './entities/server.entity';
import { Message } from './entities/message.entity';
import { Channel } from './entities/channel.entity';
import { logger } from 'src/common/logger';
import { LoadMessagesDto } from './dto/load-message.dto';
import { SendMessageDto } from './dto/send-message.dto';


@Injectable()
export class ChannelsService {

  constructor(
    @InjectRepository(Server)
    private readonly serverService: Repository<Server>,
    @InjectRepository(Message)
    private readonly messageService: Repository<Message>,
    @InjectRepository(Channel)
    private readonly channelService: Repository<Channel>,

  ) { }


  async createServer(createServerDto: CreateServerDto) {

    const queryRunner = this.serverService.manager.connection.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {

      await queryRunner.manager.createQueryBuilder()
        .insert()
        .into(Server)
        .values([
          createServerDto
        ])
        .execute();
    }
    catch (error: any) {
      logger.error(error);
      await queryRunner.rollbackTransaction();
    }
    finally {
      await queryRunner.release();
    }
  }


  async loadMessage(loadMessagDto: LoadMessagesDto){

    const { channelId, limit = 20, before } = loadMessagDto;

    const where: any = {channel: { id: channelId }};

    if (before) {
      where.createdAt = LessThan(new Date(before));
    }

    const messages = await this.messageService.find({
      where,
      relations: ['channel'],
      order: {
        createdAt: 'DESC',
        message_id: 'DESC'
      },
      take: limit,
    });

    return messages.reverse();
  }


  async sendMessage(sendMessageDto: SendMessageDto, room: string) {


   const currentRoom = await this.channelService.findOneBy({ channel_id: room });

    if(!currentRoom) return;

    this.messageService.create({
      avatar: sendMessageDto.avatar,
      channel: currentRoom,
      userName:sendMessageDto.userName,
      value: sendMessageDto.value
    })

  }




}
