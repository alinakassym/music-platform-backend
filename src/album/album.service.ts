import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Track, TrackDocument } from '../track/schemas/track.schema';
import { FileService, FileType } from '../file/file.service';
import { CreateAlbumDto } from './dto/create-album.dto';
import { Album, AlbumDocument } from './schemas/album.schema';

@Injectable()
export class AlbumService {
  constructor(
    @InjectModel(Track.name) private trackModel: Model<TrackDocument>,
    @InjectModel(Album.name) private albumModel: Model<AlbumDocument>,
    private fileService: FileService,
  ) {}

  async create(dto: CreateAlbumDto, picture): Promise<Album> {
    const picturePath = this.fileService.createFile(FileType.IMAGE, picture);
    const [album] = await Promise.all([
      this.albumModel.create({
        ...dto,
        picture: picturePath,
      }),
    ]);
    return album;
  }

  async getAll(count = 10, offset = 0): Promise<Album[]> {
    const [albums] = await Promise.all([
      this.albumModel.find().skip(offset).limit(count),
    ]);
    return albums;
  }

  async getOne(id: ObjectId): Promise<Album> {
    const [album] = await Promise.all([
      this.albumModel.findById(id).populate('tracks'),
    ]);
    return album;
  }

  async delete(id: ObjectId): Promise<ObjectId> {
    const album = await this.albumModel.findByIdAndDelete(id);

    this.fileService.removeFile(album.picture);
    return album._id;
  }

  async addTrack(id: ObjectId, trackId: ObjectId): Promise<Album> {
    const album = await this.albumModel.findById(id);
    const track = await this.trackModel.findById(trackId);
    album.tracks.push(track._id);

    track.album = album;
    await album.save();
    await track.save();
    return album;
  }

  async search(query: string): Promise<Album[]> {
    const [albums] = await Promise.all([
      this.albumModel.find({
        $or: [
          { name: { $regex: new RegExp(query, 'i') } },
          { author: { $regex: new RegExp(query, 'i') } },
        ],
      }),
    ]);
    return albums;
  }
}
