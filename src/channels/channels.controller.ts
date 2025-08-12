import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from './entities/channel.entity';

@Controller('channels')
export class ChannelsController {
  constructor(
    @InjectRepository(Channel)
    private readonly channelRepository: Repository<Channel>,
  ) {}

  @Get()
  async getAllChannels() {
    const channels = await this.channelRepository.find({
      relations: ['server'],
      order: { name: 'ASC' },
    });

    return channels.map(channel => ({
      id: channel.channel_id,
      name: channel.name,
      description: channel.description,
      serverId: channel.server?.server_id,
    }));
  }


}
