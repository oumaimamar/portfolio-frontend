// project-media-request.model.ts
export interface ProjectMediaRequest {
  mediaUrl: string;
  mediaType: string;  // e.g., 'IMAGE', 'VIDEO', 'DOCUMENT'
  caption?: string;
  isFeatured?: boolean;
}

// project-media-response.model.ts
export interface ProjectMediaResponse {
  id: number;
  mediaUrl: string;
  mediaType: string;
  caption?: string;
  isFeatured: boolean;
  projectId: number;
  createdAt: string;
  updatedAt: string;
}
