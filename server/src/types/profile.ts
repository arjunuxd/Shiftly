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
  currentlyStudying?: boolean;
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

export interface ProfileCertificate {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string;
  credentialUrl: string;
}

export interface ProfilePortfolioLink {
  id: string;
  title: string;
  url: string;
  description: string;
}

export interface ProfileDocument {
  headline?: string;
  personalInfo: ProfilePersonalInfo;
  skills: ProfileSkill[];
  experience: ProfileExperience[];
  education: ProfileEducation[];
  availability: ProfileAvailabilityDay[];
  workPreferences: ProfileWorkPreferences;
  location: ProfileLocation;
  photoUrl: string | null;
  resumeUrl: string | null;
  resumeName: string | null;
  certificates: ProfileCertificate[];
  portfolioLinks: ProfilePortfolioLink[];
  createdAt: unknown;
  updatedAt: unknown;
}

export interface ProfileResponse extends Omit<ProfileDocument, "createdAt" | "updatedAt"> {
  id: string;
  completeness: number;
}
