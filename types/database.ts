// Database Types
export type UserRole = 'admin' | 'supervisor' | 'trainee';
export type UserStatus = 'active' | 'inactive' | 'suspended';
export type TraineeStatus = 'active' | 'completed' | 'suspended' | 'transferred' | 'withdrawn';
export type ReportType = 'daily' | 'weekly' | 'monthly';
export type ReportStatus = 'pending' | 'approved' | 'rejected' | 'revision_required';
export type TaskStatus = 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type EvaluationType = 'monthly' | 'quarterly' | 'final' | 'mid_term';
export type AttendanceStatus = 'present' | 'absent' | 'excused' | 'late' | 'half_day';
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

// Database Tables
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  role: UserRole;
  status: UserStatus;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Institution {
  id: string;
  name: string;
  name_ar?: string;
  location?: string;
  description?: string;
  focal_point_name?: string;
  focal_point_phone?: string;
  focal_point_email?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supervisor {
  id: string;
  user_id: string;
  institution_id?: string;
  position_title?: string;
  position_title_ar?: string;
  specialization?: string;
  years_of_experience?: number;
  bio?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  user?: User;
  institution?: Institution;
}

export interface Trainee {
  id: string;
  user_id: string;
  institution_id?: string;
  
  // Personal Information
  national_id?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female';
  address?: string;
  
  // Education
  university?: string;
  major?: string;
  graduation_year?: number;
  gpa?: number;
  
  // Training Details
  start_date: string;
  end_date?: string;
  expected_end_date?: string;
  status: TraineeStatus;
  
  // Additional Info
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  user?: User;
  institution?: Institution;
  supervisors?: Supervisor[];
}

export interface SupervisorTrainee {
  id: string;
  supervisor_id: string;
  trainee_id: string;
  is_primary: boolean;
  assigned_date: string;
  notes?: string;
  created_at: string;
}

export interface Report {
  id: string;
  trainee_id: string;
  report_type: ReportType;
  title: string;
  content: string;
  attachments: string[];
  
  // Date tracking
  report_date: string;
  submitted_at: string;
  
  // Approval workflow
  status: ReportStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  supervisor_comment?: string;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  trainee?: Trainee;
  reviewer?: Supervisor;
}

export interface Task {
  id: string;
  title: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  
  // Assignment
  assigned_to: string;
  assigned_by?: string;
  institution_id?: string;
  
  // Task details
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string;
  
  // Completion
  completion_notes?: string;
  attachments: string[];
  submitted_at?: string;
  
  // Review
  reviewed_by?: string;
  reviewed_at?: string;
  review_comment?: string;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  trainee?: Trainee;
  institution?: Institution;
}

export interface Evaluation {
  id: string;
  trainee_id: string;
  supervisor_id: string;
  
  // Evaluation details
  evaluation_type: EvaluationType;
  evaluation_date: string;
  period_start?: string;
  period_end?: string;
  
  // Scoring
  technical_skills_score?: number;
  communication_score?: number;
  teamwork_score?: number;
  initiative_score?: number;
  professionalism_score?: number;
  overall_score?: number;
  
  // Feedback
  strengths?: string;
  areas_for_improvement?: string;
  recommendations?: string;
  notes?: string;
  
  created_at: string;
  updated_at: string;
  
  // Relations
  trainee?: Trainee;
  supervisor?: Supervisor;
}

export interface Attendance {
  id: string;
  trainee_id: string;
  date: string;
  status: AttendanceStatus;
  check_in_time?: string;
  check_out_time?: string;
  notes?: string;
  recorded_by?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  title_ar?: string;
  message: string;
  message_ar?: string;
  type: NotificationType;
  link?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// View Types
export interface TraineeOverview {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  status: TraineeStatus;
  institution_name?: string;
  start_date: string;
  end_date?: string;
  total_reports: number;
  total_tasks: number;
  average_evaluation_score?: number;
}

// Form Types
export interface CreateTraineeInput {
  full_name: string;
  email: string;
  phone_number?: string;
  institution_id?: string;
  start_date: string;
  expected_end_date?: string;
  university?: string;
  major?: string;
  graduation_year?: number;
}

export interface CreateReportInput {
  trainee_id: string;
  report_type: ReportType;
  title: string;
  content: string;
  report_date: string;
  attachments?: string[];
}

export interface CreateTaskInput {
  title: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  assigned_to: string;
  institution_id?: string;
  priority: TaskPriority;
  due_date?: string;
}

export interface CreateEvaluationInput {
  trainee_id: string;
  evaluation_type: EvaluationType;
  evaluation_date: string;
  period_start?: string;
  period_end?: string;
  technical_skills_score?: number;
  communication_score?: number;
  teamwork_score?: number;
  initiative_score?: number;
  professionalism_score?: number;
  overall_score?: number;
  strengths?: string;
  areas_for_improvement?: string;
  recommendations?: string;
}

// Dashboard Statistics
export interface DashboardStats {
  total_trainees: number;
  active_trainees: number;
  total_institutions: number;
  total_supervisors: number;
  pending_reports: number;
  pending_tasks: number;
  average_evaluation_score: number;
}

export interface InstitutionStats {
  institution_id: string;
  institution_name: string;
  total_trainees: number;
  active_trainees: number;
  completed_trainees: number;
  average_score: number;
}
