import { IsString } from 'class-validator';

export class CreateReplyDto {
  @IsString()
  text: string;
}
