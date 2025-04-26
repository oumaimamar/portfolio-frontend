export interface Formation {
  id?: number;
  profileId: number;
  degree: string;
  institution: string;
  fieldOfStudy?: string;
  startDate: Date | string;
  endDate?: Date | string;
  diplomaUrl?: string;
}
