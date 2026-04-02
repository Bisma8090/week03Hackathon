import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // userId -> Set<socketId> — supports multiple tabs per user
  private userSocketMap = new Map<string, Set<string>>();
  // track admin userIds for targeted admin notifications
  private adminUserIds = new Set<string>();

  handleConnection(client: Socket) {
    console.log(`Connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Disconnected: ${client.id}`);
    for (const [userId, socketIds] of this.userSocketMap.entries()) {
      if (socketIds.has(client.id)) {
        socketIds.delete(client.id);
        if (socketIds.size === 0) {
          this.userSocketMap.delete(userId);
          this.adminUserIds.delete(userId);
        }
        break;
      }
    }
  }

  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() data: { userId: string; role?: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (data?.userId) {
      if (!this.userSocketMap.has(data.userId)) {
        this.userSocketMap.set(data.userId, new Set());
      }
      this.userSocketMap.get(data.userId)!.add(client.id);
      if (data.role === 'admin' || data.role === 'superadmin') {
        this.adminUserIds.add(data.userId);
      }
      console.log(`Registered user ${data.userId} (role: ${data.role}) -> socket ${client.id}`);
    }
  }

  // DIRECT: notify all connected admins
  notifyAdmins(payload: any) {
    for (const adminId of this.adminUserIds) {
      this.notifyUser(adminId, payload);
    }
  }

  // BROADCAST: new review — all clients (poster filtered on frontend)
  broadcastNewReview(payload: any) {
    this.server.emit('new_review', {
      type: 'new_review',
      message: `${payload.userName} added a new review`,
      productId: payload.productId,
      reviewId: payload.reviewId,
      userId: payload.userId,
      userName: payload.userName,
      rating: payload.rating,
      comment: payload.comment,
    });
  }

  // BROADCAST: like count updated
  broadcastLikeUpdate(payload: { reviewId: string; likesCount: number }) {
    this.server.emit('like_update', payload);
  }

  // BROADCAST: reply added — all clients viewing this product refresh
  broadcastReplyAdded(payload: { reviewId: string; productId: string; repliedBy?: string; replyId?: string; replierId?: string }) {
    this.server.emit('reply_added', {
      ...payload,
      type: 'reply_added',
      message: payload.repliedBy ? `${payload.repliedBy} added a reply` : 'A reply was added',
    });
  }

  // DIRECT: emit to all sockets of a specific user
  notifyUser(userId: string, payload: any) {
    const socketIds = this.userSocketMap.get(userId);
    if (socketIds && socketIds.size > 0) {
      for (const socketId of socketIds) {
        this.server.to(socketId).emit('notification', payload);
      }
      console.log(`Notified user ${userId} on ${socketIds.size} socket(s)`);
    } else {
      console.log(`User ${userId} not connected — notification dropped`);
    }
  }
}
