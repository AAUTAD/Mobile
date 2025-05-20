/**
 * Instagram API Service for posting content to Instagram
 * Documentation: https://developers.facebook.com/docs/instagram-api/guides/content-publishing
 */

import { env } from "~/env";

interface InstagramPost {
  caption: string;
  imageUrl: string;
}

class InstagramAPIService {
  private accessToken: string;
  private igUserId: string;

  constructor() {
    // These would come from environment variables in a real implementation
    this.accessToken = env.INSTAGRAM_ACCESS_TOKEN || "";
    this.igUserId = env.INSTAGRAM_USER_ID || "";
  }

  /**
   * Publishes a post to Instagram
   * @param post The post data including caption and image URL
   * @returns The result of the post operation
   */
  async publishPost(post: InstagramPost): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      if (!this.accessToken || !this.igUserId) {
        throw new Error("Instagram API credentials are not configured");
      }

      // Step 1: Create a container for the image
      const containerResponse = await this.createMediaContainer(post.imageUrl, post.caption);
      
      if (!containerResponse.id) {
        throw new Error("Failed to create media container: " + containerResponse.error);
      }

      // Step 2: Publish the container
      const publishResponse = await this.publishMedia(containerResponse.id);
      
      return {
        success: true,
        id: publishResponse.id
      };
    } catch (error) {
      console.error("Instagram publishing error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }

  /**
   * Creates a media container for the image
   * @param imageUrl The URL of the image to post
   * @param caption The caption for the post
   * @returns The container ID or error message
   */
  private async createMediaContainer(imageUrl: string, caption: string): Promise<{ id?: string; error?: string }> {
    try {
      const url = `https://graph.facebook.com/v19.0/${this.igUserId}/media`;
      
      const params = new URLSearchParams({
        image_url: imageUrl,
        caption: caption,
        access_token: this.accessToken
      });

      const response = await fetch(`${url}?${params.toString()}`, {
        method: 'POST',
      });

      const data = await response.json();
      
      if (data.error) {
        return { error: data.error.message };
      }
      
      return { id: data.id };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unknown error creating media container" };
    }
  }

  /**
   * Publishes the media container to Instagram
   * @param creationId The ID of the container to publish
   * @returns The published media ID or error message
   */
  private async publishMedia(creationId: string): Promise<{ id?: string; error?: string }> {
    try {
      const url = `https://graph.facebook.com/v19.0/${this.igUserId}/media_publish`;
      
      const params = new URLSearchParams({
        creation_id: creationId,
        access_token: this.accessToken
      });

      const response = await fetch(`${url}?${params.toString()}`, {
        method: 'POST',
      });

      const data = await response.json();
      
      if (data.error) {
        return { error: data.error.message };
      }
      
      return { id: data.id };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Unknown error publishing media" };
    }
  }
}

export const instagramAPI = new InstagramAPIService();