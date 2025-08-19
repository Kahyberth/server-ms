import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ServerService } from './server.service';
import { CreateServerDto } from './dto/create-server.dto';
import { LoadMessagesDto } from './dto/load-message.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { CreateChannelDto } from './dto/create-channel.dto';
import { GetChannelsDto } from './dto/get-channels.dto';

@Controller()
export class ServerController {
  constructor(private readonly serverService: ServerService) { }

  @MessagePattern('server.create.server')
  createRoom(@Payload() createServerDto: CreateServerDto) {
    return this.serverService.createServer(createServerDto);
  }

  @MessagePattern('server.load.messages')
  loadMessages(@Payload() loadMessagesDto: LoadMessagesDto) {
    return this.serverService.loadMessage(loadMessagesDto);
  }

  @MessagePattern('server.load.messages.by.channel')
  loadMessagesByChannel(@Payload() payload: { channelId: string; limit?: number; before?: string }) {
    const { channelId, limit = 20, before } = payload;
    return this.serverService.loadMessage({ channelId, limit, before });
  }

  @MessagePattern('server.send.message')
  sendMessage(@Payload() sendMessageDto: SendMessageDto, @Payload() room: string) {
    return this.serverService.sendMessage(sendMessageDto, room);
  }

  @MessagePattern('server.create.channel')
  createChannel(@Payload() createChannelDto: CreateChannelDto) {
    return this.serverService.createChannel(createChannelDto);
  }


  @MessagePattern('server.get.channels')
  getChannels(@Payload() payload: { serverId: string; pagination?: GetChannelsDto }) {
    const { serverId, pagination = {} } = payload;
    return this.serverService.getChannels(serverId, pagination);
  }

  @MessagePattern('server.get.channels.by.team')
  getChannelsByTeamId(@Payload() payload: { teamId: string; pagination?: GetChannelsDto }) {
    const { teamId, pagination = {} } = payload;
    return this.serverService.getChannels(teamId, pagination);
  }

  @MessagePattern('server.ping')
  ping() {
    return { message: 'pong' };
  }

  @MessagePattern('server.test.connection')
  testConnection() {
    return { message: 'Server service is connected and working' };
  }


}
