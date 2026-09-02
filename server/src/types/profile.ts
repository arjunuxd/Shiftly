export interface ProfilePersonalInfo {
  fullName: string;
  bio: string;
  phone: string;
}

export interface ProfileSkill {
  name: string;
  category: string;
}

export interface ProfileExperience {
  id: string;
  role: string;
  organization: string;
  description: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
}

export interface ProfileEducation {
  id: string;
  institution: string;
  qualification: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number;
}

export interface ProfileAvailabilityDay {
  day: string;
  startTime: string;
  endTime: string;
}

export interface ProfileWorkPreferences {
  jobCategories: string[];
  workTypes: string[];
}

export interface ProfileLocation {
  city: string;
  state: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
}

export interface ProfileDocument {
  personalInfo: ProfilePersonalInfo;
  skills: ProfileSkill[];
  experience: ProfileExperience[];
  education: ProfileEducation[];
  availability: ProfileAvailabilityDay[];
  workPreferences: ProfileWorkPreferences;
  location: ProfileLocation;
  createdAt: unknown;
  updatedAt: unknown;
}

export interface ProfileResponse extends Omit<ProfileDocument, "createdAt" | "updatedAt"> {
  id: string;
  completeness: number;
}
