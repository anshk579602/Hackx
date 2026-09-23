export type UserRole = "ORGANIZER" | "JUDGE" | "PARTICIPANT";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  organization?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Hackathon {
  id: string;
  title: string;
  tagline?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status: string;
  is_published: boolean;
  active_rubric_id?: string;
  created_at: string;
}

export interface RubricCategory {
  id: string;
  rubric_id: string;
  name: string;
  max_score: number;
  weight: number;
  evaluation_criteria: string;
  ai_evidence_checklist: string[];
  is_active: boolean;
  order_index: number;
}

export interface Rubric {
  id: string;
  hackathon_id: string;
  version: string;
  title: string;
  description?: string;
  is_active: boolean;
  is_immutable: boolean;
  created_at: string;
  categories: RubricCategory[];
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role_in_team: string;
  joined_at: string;
  user?: User;
}

export interface EvidenceItem {
  source_type: string;
  source_name: string;
  url?: string | null;
  excerpt: string;
  stance: "supporting" | "neutral" | "contradicting";
}

export interface Claim {
  id: string;
  submission_id?: string;
  claim: string;
  claim_text?: string;
  subclaims: string[];
  category: string;
  status: "Supported" | "Partially Supported" | "Unsupported" | "Contradicted" | "Needs Human Review";
  confidence: number;
  reasoning?: string;
  evidence: EvidenceItem[];
}

export interface Submission {
  id: string;
  team_id: string;
  project_title: string;
  problem_statement: string;
  project_description: string;
  github_url?: string;
  live_demo_url?: string;
  ppt_url?: string;
  architecture_url?: string;
  screenshots: string[];
  demo_video_url?: string;
  tech_stack: string[];
  raw_claims: string[];
  ai_analysis_status: "SUBMITTED" | "EXTRACTING" | "CLAIMS_IDENTIFIED" | "VERIFYING" | "READY";
  ai_status_message?: string;
  project_summary?: string;
  evidence_bundle_hash?: string;
  submitted_at: string;
  updated_at: string;
  claims?: Claim[];
}

export interface Team {
  id: string;
  hackathon_id: string;
  name: string;
  join_code: string;
  created_at: string;
  members: TeamMember[];
  submission?: Submission | null;
}

export interface BlockchainRecord {
  id: string;
  evaluation_id: string;
  network: string;
  tx_hash: string;
  block_number: number;
  evaluation_hash: string;
  anchored_by_address: string;
  status: string;
  explorer_url?: string;
  timestamp: string;
}

export interface Evaluation {
  id: string;
  hackathon_id: string;
  team_id: string;
  judge_id: string;
  rubric_version: string;
  category_scores: Record<string, number>;
  final_score: number;
  category_comments: Record<string, string>;
  overall_feedback?: string;
  justification?: string;
  justification_hash?: string;
  evidence_bundle_hash?: string;
  canonical_hash?: string;
  status: "DRAFT" | "SUBMITTED";
  is_tampered_demo: boolean;
  original_score_before_tamper?: number;
  created_at: string;
  updated_at: string;
  judge?: User;
  judge_name?: string;
  team?: Team;
  team_name?: string;
  blockchain_record?: BlockchainRecord;
}

export interface GuardrailCheckResult {
  requires_justification: boolean;
  reasons: string[];
  suggested_questions: string[];
  discrepant_categories: string[];
  has_valid_justification: boolean;
}

export interface IntegrityItem {
  evaluation_id: string;
  team_id: string;
  team_name: string;
  judge_id: string;
  judge_name: string;
  rubric_version: string;
  status: "VERIFIED" | "TAMPERED" | "NOT_FOUND" | "UNFINALIZED" | "NOT_ANCHORED";
  is_verified: boolean;
  database_score: number;
  anchored_score: number;
  database_hash: string;
  anchored_hash: string;
  tx_hash?: string;
  block_number?: number;
  network?: string;
  timestamp?: string;
  explorer_url?: string;
  message: string;
  is_tampered_demo: boolean;
}

export interface IntegrityOverview {
  total_evaluations: number;
  verified_count: number;
  tampered_count: number;
  system_status: "ALL_VERIFIED" | "INTEGRITY_VIOLATION";
  evaluations: IntegrityItem[];
}

export interface AnomalyDetail {
  team_id: string;
  team_name: string;
  project_title: string;
  category: string;
  outlier_judge_id: string;
  outlier_judge_name: string;
  judge_score: number;
  other_judges_average: number;
  deviation: number;
  recommendation: string;
}

export interface TeamScoreStat {
  team_id: string;
  team_name: string;
  project_title: string;
  evaluation_count: number;
  mean_score: number;
  median_score: number;
  std_deviation: number;
  category_averages: Record<string, number>;
  scores_by_judge: Array<{
    judge_id: string;
    judge_name: string;
    final_score: number;
    category_scores: Record<string, number>;
  }>;
  has_anomaly: boolean;
  anomaly_details: AnomalyDetail[];
  integrity_status: "VERIFIED" | "TAMPERED" | "PENDING";
}

export interface AnomalyDashboardData {
  total_teams: number;
  teams_with_anomalies: number;
  team_statistics: TeamScoreStat[];
  summary_recommendation: string;
}

export interface AuditTimelineEvent {
  step: number;
  time: string;
  actor: string;
  role: string;
  title: string;
  description: string;
  badge: string;
  status: string;
  type: string;
}

export interface DecisionReplayData {
  evaluation_id: string;
  team_name: string;
  project_title: string;
  judge_name: string;
  rubric_version: string;
  final_score: number;
  canonical_hash: string;
  timeline: AuditTimelineEvent[];
}
