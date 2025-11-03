import { mediaRepository } from "../../repositories/implementations";
import { logUserAction } from "../../auth";
import { Request } from "express";
import type { InsertVideoContent } from "@myhi2025/shared";
import { notFound } from "../common/errorHandlers";

export class VideosService {
  async getAllVideos() {
    return await mediaRepository.getAllVideos();
  }

  async getPublishedVideos() {
    return await mediaRepository.getPublishedVideos();
  }

  async getVideo(id: string) {
    const video = await mediaRepository.findVideoById(id);
    if (!video) {
      throw notFound("Video", id);
    }
    return video;
  }

  async createVideo(
    data: InsertVideoContent,
    currentUserId: string,
    req: Request
  ) {
    const newVideo = await mediaRepository.createVideo({
      ...data,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });

    await logUserAction(
      currentUserId,
      "create",
      "video",
      newVideo.id,
      {
        video_title: newVideo.title,
        category: newVideo.category,
      },
      req
    );

    return newVideo;
  }

  async updateVideo(
    id: string,
    data: Partial<InsertVideoContent>,
    currentUserId: string,
    req: Request
  ) {
    const updatedVideo = await mediaRepository.updateVideo(id, {
      ...data,
      updatedBy: currentUserId,
    });

    await logUserAction(
      currentUserId,
      "update",
      "video",
      id,
      {
        video_title: updatedVideo.title,
      },
      req
    );

    return updatedVideo;
  }

  async deleteVideo(id: string, currentUserId: string, req: Request) {
    const video = await mediaRepository.findVideoById(id);
    if (!video) {
      throw notFound("Video", id);
    }

    await mediaRepository.deleteVideo(id);

    await logUserAction(
      currentUserId,
      "delete",
      "video",
      id,
      {
        video_title: video.title,
      },
      req
    );

    return { message: "Video deleted successfully" };
  }

  async incrementVideoViews(id: string) {
    return await mediaRepository.incrementVideoViews(id);
  }
}

export const videosService = new VideosService();
