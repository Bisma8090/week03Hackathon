import {
  Controller, Get, Post, Delete, Patch,
  Param, Body, UseGuards, Request
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // ─── STATIC ROUTES FIRST (before :reviewId param routes) ───────────────────

  // GET /api/reviews/product/:productId — public (excludes flagged)
  @Get('product/:productId')
  getProductReviews(@Param('productId') productId: string) {
    return this.reviewsService.getProductReviews(productId);
  }

  // ─── GET /api/reviews/admin/product/:productId — admin only (includes flagged)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Get('admin/product/:productId')
  getProductReviewsAdmin(@Param('productId') productId: string) {
    return this.reviewsService.getProductReviewsAdmin(productId);
  }

  // GET /api/reviews/admin/all — admin only (all reviews across all products)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Get('admin/all')
  getAllReviewsAdmin() {
    return this.reviewsService.getAllReviewsAdmin();
  }

  // POST /api/reviews/notify-product-update — internal (called by Express backend)
  // No auth guard — internal service-to-service call from localhost
  @Post('notify-product-update')
  notifyProductUpdate(@Body() body: { productId: string; field: string; value: any }) {
    return this.reviewsService.notifyProductUpdate(body.productId, {
      field: body.field,
      value: body.value,
    });
  }

  // ─── PARAM ROUTES ───────────────────────────────────────────────────────────

  // POST /api/reviews — auth required
  @UseGuards(JwtAuthGuard)
  @Post()
  addReview(@Body() dto: CreateReviewDto, @Request() req) {
    return this.reviewsService.addReview(dto, req.user);
  }

  // POST /api/reviews/:reviewId/reply — auth required
  @UseGuards(JwtAuthGuard)
  @Post(':reviewId/reply')
  addReply(
    @Param('reviewId') reviewId: string,
    @Body() dto: CreateReplyDto,
    @Request() req,
  ) {
    return this.reviewsService.addReply(reviewId, dto, req.user);
  }

  // DELETE /api/reviews/:reviewId/reply/:replyId — auth required (own reply or admin)
  @UseGuards(JwtAuthGuard)
  @Delete(':reviewId/reply/:replyId')
  deleteReply(
    @Param('reviewId') reviewId: string,
    @Param('replyId') replyId: string,
    @Request() req,
  ) {
    return this.reviewsService.deleteReply(reviewId, replyId, req.user);
  }

  // PATCH /api/reviews/:reviewId/like — auth required (toggle)
  @UseGuards(JwtAuthGuard)
  @Patch(':reviewId/like')
  toggleLike(@Param('reviewId') reviewId: string, @Request() req) {
    return this.reviewsService.toggleLike(reviewId, req.user);
  }

  // PATCH /api/reviews/:reviewId/flag — admin only
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Patch(':reviewId/flag')
  flagReview(@Param('reviewId') reviewId: string) {
    return this.reviewsService.flagReview(reviewId);
  }

  // DELETE /api/reviews/:reviewId — admin only
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'superadmin')
  @Delete(':reviewId')
  deleteReview(@Param('reviewId') reviewId: string) {
    return this.reviewsService.deleteReview(reviewId);
  }
}
