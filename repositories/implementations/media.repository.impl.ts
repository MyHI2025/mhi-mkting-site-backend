import { IMediaRepository } from '../media.repository';
import { NotFoundError, DuplicateError } from '../base.repository';
import type { 
  MediaPosition, InsertMediaPosition,
  VideoContent, InsertVideoContent
} from '@myhealthintegral/shared';
import { randomUUID } from 'crypto';

export class MediaRepositoryImpl implements IMediaRepository {
  private mediaPositions: Map<string, MediaPosition>;
  private videoContent: Map<string, VideoContent>;

  constructor() {
    this.mediaPositions = new Map();
    this.videoContent = new Map();
  }

  async findMediaPositionById(id: string): Promise<MediaPosition | null> {
    return this.mediaPositions.get(id) || null;
  }

  async findMediaPositionByKey(positionKey: string): Promise<MediaPosition | null> {
    return Array.from(this.mediaPositions.values()).find(position => position.positionKey === positionKey) || null;
  }

  async getAllMediaPositions(): Promise<MediaPosition[]> {
    return Array.from(this.mediaPositions.values())
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async getPublicMediaPositions(): Promise<MediaPosition[]> {
    return Array.from(this.mediaPositions.values())
      .filter(position => position.isActive)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async createMediaPosition(data: InsertMediaPosition): Promise<MediaPosition> {
    const existing = await this.findMediaPositionByKey(data.positionKey);
    if (existing) {
      throw new DuplicateError('MediaPosition', 'positionKey');
    }

    const id = randomUUID();
    const now = new Date();
    const newPosition: MediaPosition = {
      positionKey: data.positionKey,
      label: data.label,
      category: data.category,
      id,
      description: data.description ?? null,
      mediaUrl: data.mediaUrl ?? null,
      mediaAlt: data.mediaAlt ?? null,
      mediaAssetId: data.mediaAssetId ?? null,
      isActive: data.isActive ?? true,
      displayOrder: data.displayOrder ?? 0,
      createdAt: now,
      updatedAt: now,
      updatedBy: null,
    };
    this.mediaPositions.set(id, newPosition);
    return newPosition;
  }

  async updateMediaPosition(id: string, data: Partial<MediaPosition>): Promise<MediaPosition> {
    const position = this.mediaPositions.get(id);
    if (!position) {
      throw new NotFoundError('MediaPosition', id);
    }
    
    const updatedPosition: MediaPosition = {
      ...position,
      ...data,
      id,
      updatedAt: new Date(),
    };
    this.mediaPositions.set(id, updatedPosition);
    return updatedPosition;
  }

  async deleteMediaPosition(id: string): Promise<{ success: boolean; message: string }> {
    const position = this.mediaPositions.get(id);
    if (!position) {
      throw new NotFoundError('MediaPosition', id);
    }

    this.mediaPositions.delete(id);
    return { success: true, message: 'Media position deleted successfully' };
  }

  async findVideoById(id: string): Promise<VideoContent | null> {
    return this.videoContent.get(id) || null;
  }

  async getAllVideos(): Promise<VideoContent[]> {
    return Array.from(this.videoContent.values())
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async getPublishedVideos(): Promise<VideoContent[]> {
    return Array.from(this.videoContent.values())
      .filter(video => video.isPublished)
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }

  async createVideo(data: InsertVideoContent): Promise<VideoContent> {
    const id = randomUUID();
    const now = new Date();
    const newVideo: VideoContent = {
      ...data,
      id,
      description: data.description ?? null,
      thumbnailUrl: data.thumbnailUrl ?? null,
      duration: data.duration ?? null,
      category: data.category ?? 'Webinar',
      isPublished: data.isPublished ?? false,
      views: data.views ?? 0,
      displayOrder: data.displayOrder ?? 0,
      createdAt: now,
      updatedAt: now,
      createdBy: null,
      updatedBy: null,
    };
    this.videoContent.set(id, newVideo);
    return newVideo;
  }

  async updateVideo(id: string, data: Partial<VideoContent>): Promise<VideoContent> {
    const video = this.videoContent.get(id);
    if (!video) {
      throw new NotFoundError('VideoContent', id);
    }
    
    const updatedVideo: VideoContent = {
      ...video,
      ...data,
      id,
      updatedAt: new Date(),
    };
    this.videoContent.set(id, updatedVideo);
    return updatedVideo;
  }

  async deleteVideo(id: string): Promise<{ success: boolean; message: string }> {
    const video = this.videoContent.get(id);
    if (!video) {
      throw new NotFoundError('VideoContent', id);
    }

    this.videoContent.delete(id);
    return { success: true, message: 'Video deleted successfully' };
  }

  async incrementVideoViews(id: string): Promise<VideoContent> {
    const video = this.videoContent.get(id);
    if (!video) {
      throw new NotFoundError('VideoContent', id);
    }

    const updatedVideo: VideoContent = {
      ...video,
      views: (video.views ?? 0) + 1,
      updatedAt: new Date(),
    };
    this.videoContent.set(id, updatedVideo);
    return updatedVideo;
  }
}

export const mediaRepository = new MediaRepositoryImpl();
