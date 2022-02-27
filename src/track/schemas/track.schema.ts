import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as mongooseSchema } from 'mongoose';
import { Album } from '../../album/schemas/album.schema';

const types = mongooseSchema.Types;

export type TrackDocument = Track & Document;

@Schema()
export class Track {
  @Prop()
  name: string;

  @Prop()
  artist: string;

  @Prop()
  text: string;

  @Prop()
  listens: number;

  @Prop()
  picture: string;

  @Prop()
  audio: string;

  @Prop({ type: [{ type: types.ObjectId, ref: 'Comment' }] })
  comments: Comment[];

  @Prop({ type: types.ObjectId, ref: 'Album' })
  album: Album;
}

export const TrackSchema = SchemaFactory.createForClass(Track);
