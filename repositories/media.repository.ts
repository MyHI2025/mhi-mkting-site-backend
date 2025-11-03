import type {
  MediaPosition,
  InsertMediaPosition,
  VideoContent,
  InsertVideoContent,
} from "@myhi2025/shared";

/**
 * Media Repository Interface
 * Handles all media-related data operations
 */
export interface IMediaRepository {
  // Media Positions
  findMediaPositionById(id: string): Promise<MediaPosition | null>;
  findMediaPositionByKey(positionKey: string): Promise<MediaPosition | null>;
  getAllMediaPositions(): Promise<MediaPosition[]>;
  getPublicMediaPositions(): Promise<MediaPosition[]>;
  createMediaPosition(data: InsertMediaPosition): Promise<MediaPosition>;
  updateMediaPosition(
    id: string,
    data: Partial<MediaPosition>
  ): Promise<MediaPosition>;
  deleteMediaPosition(
    id: string
  ): Promise<{ success: boolean; message: string }>;

  // Videos
  findVideoById(id: string): Promise<VideoContent | null>;
  getAllVideos(): Promise<VideoContent[]>;
  getPublishedVideos(): Promise<VideoContent[]>;
  createVideo(data: InsertVideoContent): Promise<VideoContent>;
  updateVideo(id: string, data: Partial<VideoContent>): Promise<VideoContent>;
  deleteVideo(id: string): Promise<{ success: boolean; message: string }>;
  incrementVideoViews(id: string): Promise<VideoContent>;
}
