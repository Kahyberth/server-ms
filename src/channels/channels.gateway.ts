import { WebSocketGateway, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { ChannelsService } from './channels.service';
import { Socket } from 'socket.io';
import { UserProfile } from './types/userProfile';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SendMessageDto } from './dto/send-message.dto';


interface HandshakeAuth {
  room: string;
  user: UserProfile;
}



@WebSocketGateway()
export class ChannelsGateway implements OnGatewayConnection, OnGatewayDisconnect {


  onlineUsers = new Map<string, Map<string, UserProfile>>();
  offlineUsers = new Map<string, Map<string, UserProfile>>();

  constructor(private readonly channelsService: ChannelsService, @Inject(CACHE_MANAGER) private cacheManager: Cache) { }


  handleConnection(client: Socket) {
    console.log("Online user!")
  }

  async handleDisconnect(client: Socket) {
    const { room } = client.handshake.auth as HandshakeAuth;
    if (!this.offlineUsers.has(room)) this.offlineUsers.set(room, new Map());
    this.toggleUserStatus(false, client);
    await this.cacheManager.del(room);
    await this.cacheManager.clear();
    this.emitParticipants(client);
  }



  @SubscribeMessage('join-channel')
  async joinChannel(client: Socket) {

    const { room, user } = client.handshake.auth as HandshakeAuth;

    if (!room || !user)
      return;

    if (!this.onlineUsers.has(room)) this.onlineUsers.set(room, new Map());
    this.toggleUserStatus(true, client);

    client.join(room);

    this.emitParticipants(client);

    const value = await this.cacheManager.get(room);

    if (!value) {
      const messages = await this.channelsService.loadMessage({ channelId: room })
      await this.cacheManager.set(room, messages);
    }
  }





  @SubscribeMessage('send-message')
  async sendMessage(client: Socket, message: SendMessageDto) {
    const { room } = client.handshake.auth as HandshakeAuth;
    await this.channelsService.sendMessage(message, room)
  }




  emitParticipants(client: Socket) {

    const { room } = client.handshake.auth as HandshakeAuth;
    
    const onlineMap = this.onlineUsers.get(room);
    const onlineList = onlineMap ? Array.from(onlineMap.values()) : [];
    client.emit('online-users', onlineList);

    const offlineMap = this.offlineUsers.get(room);
    const offlineList = offlineMap ? Array.from(offlineMap.values()) : [];
    client.emit('offline-users', offlineList);
  }


  toggleUserStatus(isOnline: boolean, client: Socket) {

    const { room, user } = client.handshake.auth as HandshakeAuth;

    if (isOnline) {

      if (!this.offlineUsers.has(room)) return;
      const usersInRoom = this.offlineUsers.get(room);
      usersInRoom?.delete(user.id);

      if (this.onlineUsers.has(room)) return;
      const currentRoom = this.onlineUsers.get(room);
      currentRoom?.set(user.id, user);

    } else {

      if (!this.onlineUsers.has(room)) return;
      const usersInRoom = this.onlineUsers.get(room);
      usersInRoom?.delete(user.id);

      if (this.offlineUsers.has(room)) return;
      const currentRoom = this.offlineUsers.get(room);
      currentRoom?.set(user.id, user);

      if (this.onlineUsers.get(room)?.size === 0) this.onlineUsers.delete(room);
      if (this.offlineUsers.get(room)?.size === 0) this.offlineUsers.delete(room);
    }
  }


}
