import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// Minimal User schema — mirrors the Express app's User model
// We only need _id and name for lookups
export type UserDocument = User & Document;

@Schema({ collection: 'users' })
export class User {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
