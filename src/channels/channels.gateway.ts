import { WebSocketGateway, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UserProfile } from './types/userProfile';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { SendMessageDto } from '../server/dto/send-message.dto';
import { ServerService } from '../server/server.service';
import { envs } from '../common/envs';



interface HandshakeAuth {
  room: string;
  user: UserProfile;
}



@WebSocketGateway({
  cors: {
    origin: envs.FRONTEND_URL,
    credetials: true
  }
})
export class ChannelsGateway implements OnGatewayConnection, OnGatewayDisconnect {


  onlineUsers = new Map<string, Map<string, UserProfile>>();
  offlineUsers = new Map<string, Map<string, UserProfile>>();

  constructor(private readonly serverService: ServerService, @Inject(CACHE_MANAGER) private cacheManager: Cache) { }


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

    console.log(`Join channel request for room: ${room}`);

    if (!room || !user) {
      console.log('Missing room or user data');
      return;
    }

    if (!this.onlineUsers.has(room)) this.onlineUsers.set(room, new Map());
    this.toggleUserStatus(true, client);

    client.join(room);
    console.log(`User ${user.name} ${user.lastName} joined room ${room}`);

    this.emitParticipants(client);

    const value = await this.cacheManager.get(room);

    if (!value) {
      const messages = await this.serverService.loadMessage({ channelId: room })
      await this.cacheManager.set(room, messages);
    }
  }

  
  @SubscribeMessage('send-message')
  async sendMessage(client: Socket, message: SendMessageDto) {
    const { room } = client.handshake.auth as HandshakeAuth;
    const savedMessage = await this.serverService.sendMessage(message, room);
    if (savedMessage) {
      client.to(room).emit('new-message', {
        id: savedMessage.message_id,
        roomId: room,
        text: savedMessage.value,
        time: savedMessage.createdAt,
        fromMe: false,
        userName: savedMessage.userName,
        avatar: savedMessage.avatar || '',
      });
    }
  }




  emitParticipants(client: Socket) {
    const { room } = client.handshake.auth as HandshakeAuth;

    const onlineMap = this.onlineUsers.get(room);
    const onlineList = onlineMap ? Array.from(onlineMap.values()) : [];
    
    const offlineMap = this.offlineUsers.get(room);
    const offlineList = offlineMap ? Array.from(offlineMap.values()) : [];
    
    console.log(`Emitting participants for room ${room}:`);
    console.log(`Online users:`, onlineList);
    console.log(`Offline users:`, offlineList);
    
    client.emit('online-users', onlineList);
    client.emit('offline-users', offlineList);
  }


  toggleUserStatus(isOnline: boolean, client: Socket) {
    const { room, user } = client.handshake.auth as HandshakeAuth;

    if (isOnline) {
      // Asegurar que el mapa de usuarios en línea existe
      if (!this.onlineUsers.has(room)) {
        this.onlineUsers.set(room, new Map());
      }
      
      // Agregar usuario a la lista de usuarios en línea
      const onlineRoom = this.onlineUsers.get(room);
      onlineRoom?.set(user.id, user);
      
      // Remover usuario de la lista de usuarios desconectados si existe
      if (this.offlineUsers.has(room)) {
        const offlineRoom = this.offlineUsers.get(room);
        offlineRoom?.delete(user.id);
      }
      
      console.log(`User ${user.name} ${user.lastName} is now online in room ${room}`);
      console.log(`Online users in room ${room}:`, Array.from(this.onlineUsers.get(room)?.values() || []));
      
    } else {
      // Asegurar que el mapa de usuarios desconectados existe
      if (!this.offlineUsers.has(room)) {
        this.offlineUsers.set(room, new Map());
      }
      
      // Agregar usuario a la lista de usuarios desconectados
      const offlineRoom = this.offlineUsers.get(room);
      offlineRoom?.set(user.id, user);
      
      // Remover usuario de la lista de usuarios en línea si existe
      if (this.onlineUsers.has(room)) {
        const onlineRoom = this.onlineUsers.get(room);
        onlineRoom?.delete(user.id);
      }
      
      console.log(`User ${user.name} ${user.lastName} is now offline in room ${room}`);
      console.log(`Offline users in room ${room}:`, Array.from(this.offlineUsers.get(room)?.values() || []));
    }
  }


}
