// project-status.enum.ts
export enum ProjectStatus {
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD'
}

// project-request.model.ts
export interface ProjectRequest {
  title: string;
  description: string;
  startDate?: string;  // ISO format (YYYY-MM-DD)
  endDate?: string;    // ISO format (YYYY-MM-DD)
  status: ProjectStatus;
  technologies?: string[];
  projectUrl?: string;
  repositoryUrl?: string;
}

// project-response.model.ts
export interface ProjectResponse {
  id: number;
  title: string;
  description: string;
  startDate?: string;
  endDate?: string;
  status: ProjectStatus;
  technologies?: string[];
  projectUrl?: string;
  repositoryUrl?: string;
  profileId: number;
}
