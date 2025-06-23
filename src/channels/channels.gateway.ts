import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { ChannelsService } from './channels.service';
import { Socket } from 'socket.io';
import { UserProfile } from './types/userProfile';


interface HandshakeAuth {
  room: string;
  user: UserProfile;
}



@WebSocketGateway()
export class ChannelsGateway implements OnGatewayConnection, OnGatewayDisconnect {


  onlineUsers = new Map<string, Map<string, UserProfile>>();
  offlineUsers = new Map<string, Map<string, UserProfile>>();

  constructor(private readonly channelsService: ChannelsService) { }





  handleConnection(client: Socket) {
    console.log("Online user!")
  }

  handleDisconnect(client: Socket) {
    console.log("Offline user!")
  }



  @SubscribeMessage('join-channel')
  async joinChannel(client: Socket) {

    const { room, user } = client.handshake.auth as HandshakeAuth;

    if (!room || !user)
      return;


    if (!this.onlineUsers.has(room)) this.onlineUsers.set(room, new Map());

    this.setUserOnlineStatus(true, client);


    client.join(room);



  }



  setUserOnlineStatus(isOnline: boolean, client: Socket) {

    const { room, user } = client.handshake.auth as HandshakeAuth;

    if (isOnline) {

      if (!this.offlineUsers.has(room)) return;

      const usersInRoom = this.offlineUsers.get(room);
      if (!usersInRoom) return;
      usersInRoom.delete(user.id);

      if (this.onlineUsers.has(room)) return;

      const currentRoom = this.onlineUsers.get(room);
      if (!currentRoom) return;
      currentRoom.set(user.id, user);
    } else {

      if (!this.onlineUsers.has(room)) return;

      const usersInRoom = this.onlineUsers.get(room);
      if (!usersInRoom) return;
      usersInRoom.delete(user.id);

      if (this.offlineUsers.has(room)) return;

      const currentRoom = this.offlineUsers.get(room);
      if (!currentRoom) return;
      currentRoom.set(user.id, user);


      if (this.onlineUsers.get(room)?.size === 0) this.onlineUsers.delete(room);
      if (this.offlineUsers.get(room)?.size === 0) this.offlineUsers.delete(room);

    }

  }


}
