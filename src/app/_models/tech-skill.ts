// tech-skill-request.model.ts
export interface TechSkillRequest {
  name: string;
  level?: number;  // Add other fields that match your TechSkillRequest DTO
  category?: string;
}

// tech-skill-response.model.ts
export interface TechSkillResponse {
  id: number;
  name: string;
  level?: number;
  category?: string;
  profileId: number;
  // Add other fields that match your TechSkillResponse DTO
}
