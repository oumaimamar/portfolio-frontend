export enum MediaType {
  IMAGE='IMAGE',
  DOCUMENT='DOCUMENT',
  VIDEO='VIDEO',
  PRESENTATION='PRESENTATION',
  CODE='CODE'
}

export interface UserMediaRequest {
  name: string;
  mediaType: MediaType;
  filePath :string
  description:string;

  category: string;
  verified: boolean;
}

export interface UserMediaResponse {
  id: number;
  name: string;
  mediaType: MediaType;
  filePath :string
  description:string;

  category: string;
  verified: boolean;
}
