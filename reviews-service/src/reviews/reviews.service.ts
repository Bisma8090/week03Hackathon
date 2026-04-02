import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { User, UserDocument } from './schemas/user.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  private async getUserName(userId: string): Promise<string> {
    const user = await this.userModel.findById(userId).select('name').lean() as any;
    return user?.name || 'User';
  }

  // ─── GET /api/reviews/product/:productId ────────────────────────────────────
  async getProductReviews(productId: string) {
    return this.reviewModel
      .find({ productId: new Types.ObjectId(productId), isFlagged: false })
      .sort({ createdAt: -1 })
      .lean();
  }

  // ─── POST /api/reviews ───────────────────────────────────────────────────────
  async addReview(dto: CreateReviewDto, user: any) {
    const existing = await this.reviewModel.findOne({
      productId: new Types.ObjectId(dto.productId),
      userId: new Types.ObjectId(user._id),
    });
    if (existing) {
      throw new BadRequestException('You have already reviewed this product');
    }

    const userName = await this.getUserName(user._id);

    const review = await this.reviewModel.create({
      productId: new Types.ObjectId(dto.productId),
      userId: new Types.ObjectId(user._id),
      userName,
      rating: dto.rating,
      comment: dto.comment,
    });

    // DIRECT → notify the poster: "Your review was submitted"
    this.notificationsGateway.notifyUser(user._id.toString(), {
      type: 'review_submitted',
      message: 'Your review was submitted successfully',
      reviewId: review._id.toString(),
      productId: dto.productId,
    });

    // BROADCAST → all other users + admin see "user1 added a review"
    this.notificationsGateway.broadcastNewReview({
      reviewId: review._id.toString(),
      productId: dto.productId,
      userId: user._id.toString(),
      userName,
      rating: review.rating,
      comment: review.comment,
    });

    return review;
  }

  // ─── POST /api/reviews/:reviewId/reply ──────────────────────────────────────
  async addReply(reviewId: string, dto: CreateReplyDto, user: any) {
    const review = await this.reviewModel.findById(reviewId);
    if (!review) throw new NotFoundException('Review not found');

    const userName = await this.getUserName(user._id);

    const reply = {
      userId: new Types.ObjectId(user._id),
      userName,
      text: dto.text,
      createdAt: new Date(),
    };

    review.replies.push(reply as any);
    await review.save();

    // BROADCAST → all clients on this product page get real-time reply update
    const savedReply = review.replies[review.replies.length - 1] as any;
    this.notificationsGateway.broadcastReplyAdded({
      reviewId,
      productId: review.productId.toString(),
      repliedBy: userName,
      replyId: savedReply?._id?.toString(),
      replierId: user._id.toString(),
    });

    // DIRECT → only the review owner gets notified (skip if replying to own review)
    if (review.userId.toString() !== user._id.toString()) {
      this.notificationsGateway.notifyUser(review.userId.toString(), {
        type: 'reply',
        message: `${userName} replied to your review`,
        reviewId,
        replyId: savedReply?._id?.toString(),
        productId: review.productId.toString(),
        repliedBy: userName,
      });
    }

    // DIRECT → notify all admins about the new reply (skip if admin is the replier)
    this.notificationsGateway.notifyAdmins({
      type: 'reply',
      message: `${userName} replied to a review`,
      reviewId,
      replyId: savedReply?._id?.toString(),
      productId: review.productId.toString(),
      repliedBy: userName,
      replierId: user._id.toString(),
    });

    return review;
  }

  // ─── DELETE /api/reviews/:reviewId/reply/:replyId ───────────────────────────
  async deleteReply(reviewId: string, replyId: string, user: any) {
    const review = await this.reviewModel.findById(reviewId);
    if (!review) throw new NotFoundException('Review not found');

    const replyIndex = review.replies.findIndex(
      (r: any) => r._id?.toString() === replyId,
    );
    if (replyIndex === -1) throw new NotFoundException('Reply not found');

    const reply = review.replies[replyIndex] as any;
    const isAdmin = user.role === 'admin' || user.role === 'superadmin';
    const isOwner = reply.userId?.toString() === user._id.toString();

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You can only delete your own replies');
    }

    review.replies.splice(replyIndex, 1);
    await review.save();

    return { message: 'Reply deleted' };
  }

  // ─── PATCH /api/reviews/:reviewId/like ──────────────────────────────────────
  async toggleLike(reviewId: string, user: any) {
    const review = await this.reviewModel.findById(reviewId);
    if (!review) throw new NotFoundException('Review not found');

    const userId = new Types.ObjectId(user._id);
    const alreadyLiked = review.likes.some((id) => id.equals(userId));

    if (alreadyLiked) {
      review.likes = review.likes.filter((id) => !id.equals(userId));

      // DIRECT → notify review author about unlike (skip self)
      if (review.userId.toString() !== user._id.toString()) {
        const userName = await this.getUserName(user._id);
        this.notificationsGateway.notifyUser(review.userId.toString(), {
          type: 'unlike',
          message: `${userName} unliked your review`,
          reviewId,
          productId: review.productId.toString(),
          likesCount: review.likes.length,
        });
      }
    } else {
      review.likes.push(userId);

      // DIRECT → notify review author (skip self-like)
      if (review.userId.toString() !== user._id.toString()) {
        const userName = await this.getUserName(user._id);
        this.notificationsGateway.notifyUser(review.userId.toString(), {
          type: 'like',
          message: `Your review was liked by ${userName}`,
          reviewId,
          productId: review.productId.toString(),
          likesCount: review.likes.length,
          likedBy: userName,
        });
      }
    }

    await review.save();

    // Broadcast updated like count to all clients viewing this product
    this.notificationsGateway.broadcastLikeUpdate({
      reviewId,
      likesCount: review.likes.length,
    });

    return { liked: !alreadyLiked, likesCount: review.likes.length };
  }

  // ─── PATCH /api/reviews/:reviewId/flag (admin) ──────────────────────────────
  async flagReview(reviewId: string) {
    const review = await this.reviewModel.findByIdAndUpdate(
      reviewId,
      { isFlagged: true },
      { new: true },
    );
    if (!review) throw new NotFoundException('Review not found');

    // DIRECT → notify review author (with productId so it's clickable)
    this.notificationsGateway.notifyUser(review.userId.toString(), {
      type: 'flagged',
      message: 'Your review has been flagged by an admin for moderation',
      reviewId,
      productId: review.productId.toString(),
    });

    return review;
  }

  // ─── DELETE /api/reviews/:reviewId (admin) ──────────────────────────────────
  async deleteReview(reviewId: string) {
    const review = await this.reviewModel.findByIdAndDelete(reviewId);
    if (!review) throw new NotFoundException('Review not found');

    // DIRECT → notify review author (productId included for reference)
    this.notificationsGateway.notifyUser(review.userId.toString(), {
      type: 'deleted',
      message: 'Your review has been removed by an admin',
      reviewId,
      productId: review.productId.toString(),
    });

    return { message: 'Review deleted' };
  }

  // ─── GET /api/reviews/admin/product/:productId (admin — includes flagged) ───
  async getProductReviewsAdmin(productId: string) {
    return this.reviewModel
      .find({ productId: new Types.ObjectId(productId) })
      .sort({ createdAt: -1 })
      .lean();
  }

  // ─── GET /api/reviews/admin/all (admin — all reviews) ───────────────────────
  async getAllReviewsAdmin() {
    return this.reviewModel
      .find({})
      .sort({ createdAt: -1 })
      .lean();
  }

  // ─── POST /api/reviews/notify-product-update (bonus) ────────────────────────
  // Called by Express when price/stock changes — notifies all past reviewers
  async notifyProductUpdate(productId: string, changes: { field: string; value: any }) {
    const reviews = await this.reviewModel
      .find({ productId: new Types.ObjectId(productId) })
      .select('userId')
      .lean();

    const uniqueUserIds = [...new Set(reviews.map((r) => r.userId.toString()))];

    uniqueUserIds.forEach((userId) => {
      this.notificationsGateway.notifyUser(userId, {
        type: 'product_update',
        message: `A product you reviewed had a ${changes.field} update`,
        productId,
      });
    });

    return { notified: uniqueUserIds.length };
  }
}
