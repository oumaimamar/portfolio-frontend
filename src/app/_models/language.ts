export interface Language {
  id?: number;
  profileId: number;
  name: string;
  proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'FLUENT' | 'NATIVE';
  certification?: string;
  certificateUrl?: string;
}
