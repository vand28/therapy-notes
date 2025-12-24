export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  name: string;
  role: string;
  subscriptionTier: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Client {
  id: string;
  therapistId: string;
  name: string;
  dateOfBirth: string | null;
  diagnosis: string[];
  diagnosisNotes: string;
  parentUserIds: string[];
  goals: ClientGoal[];
  createdAt: string;
}

export interface ClientGoal {
  goalId: string;
  description: string;
  targetDate: string | null;
  currentLevel: number;
  createdAt: string;
}

export interface Session {
  id: string;
  clientId: string;
  therapistId: string;
  sessionDate: string;
  durationMinutes: number;
  template: string;
  activitiesDone: string[];
  goalsWorkedOn: GoalProgress[];
  observations: string;
  nextSteps: string;
  homeActivities: HomeActivity[];
  mediaAttachments: MediaAttachment[];
  sharedWithParents: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GoalProgress {
  goalId: string;
  progressNotes: string;
  levelUpdate: number;
}

export interface HomeActivity {
  activity: string;
  instructions: string;
  completedByParent: boolean;
  parentNotes: string;
}

export interface MediaAttachment {
  fileKey: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  activities: string[];
  commonGoals: string[];
  usageCount: number;
  isSystemTemplate: boolean;
  createdAt: string;
}

export interface UsageMetrics {
  clientCount: number;
  sessionsThisMonth: number;
  storageUsedMB: number;
}

export interface UsageSummary {
  subscriptionTier: string;
  current: UsageMetrics;
  limits: UsageMetrics;
  canCreateClient: boolean;
  canCreateSession: boolean;
  canUploadFile: boolean;
}

export interface CreateClientRequest {
  name: string;
  dateOfBirth?: string;
  diagnosis?: string[];
  diagnosisNotes?: string;
}

export interface CreateSessionRequest {
  clientId: string;
  sessionDate: string;
  durationMinutes: number;
  template?: string;
  activitiesDone?: string[];
  goalsWorkedOn?: GoalProgress[];
  observations?: string;
  nextSteps?: string;
  homeActivities?: HomeActivity[];
  sharedWithParents: boolean;
}

export interface OAuthAuthResponse {
  token: string;
  userId: string;
  email: string;
  name: string;
  role: string;
  subscriptionTier: string;
  requiresMfa: boolean;
  tempToken?: string;
}

export interface MfaSetupResponse {
  secret: string;
  qrCodeUri: string;
  qrCodeImage: string; // base64 encoded image
  backupCodes: string[];
}

export interface AccessRequest {
  id: string;
  parentUserId: string;
  parentEmail: string;
  parentName: string;
  childFirstName: string;
  childLastName: string;
  childDateOfBirth: string;
  therapistEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  linkedClientId?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccessRequestData {
  childFirstName: string;
  childLastName: string;
  childDateOfBirth: string;
  therapistEmail: string;
}

