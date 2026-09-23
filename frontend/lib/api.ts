import {
  AuthResponse,
  User,
  Hackathon,
  Rubric,
  Team,
  Submission,
  Evaluation,
  GuardrailCheckResult,
  IntegrityOverview,
  AnomalyDashboardData,
  DecisionReplayData
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("hackx_token") || localStorage.getItem("hackjudge_token");
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("hackx_token", token);
      } else {
        localStorage.removeItem("hackx_token");
        localStorage.removeItem("hackjudge_token");
      }
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== "undefined") {
      this.token = localStorage.getItem("hackx_token") || localStorage.getItem("hackjudge_token");
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { detail: `HTTP error ${response.status}` };
      }
      const message = typeof errorData.detail === "string" 
        ? errorData.detail 
        : errorData.detail?.message || "An unexpected API error occurred";
      const err = new Error(message) as Error & { data?: any; status: number };
      err.data = errorData;
      err.status = response.status;
      throw err;
    }

    return response.json();
  }

  // Auth
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    this.setToken(res.access_token);
    return res;
  }

  async register(data: any): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    this.setToken(res.access_token);
    return res;
  }

  async demoLogin(role: "organizer" | "judge" | "participant"): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>(`/auth/demo-login/${role}`, {
      method: "POST",
    });
    this.setToken(res.access_token);
    return res;
  }

  async getMe(): Promise<User> {
    return this.request<User>("/auth/me");
  }

  async getJudges(): Promise<Array<{
    id: string;
    name: string;
    email: string;
    org: string;
    specialty: string;
    completed: number;
  }>> {
    return this.request<any[]>("/auth/judges");
  }

  // Hackathons
  async listHackathons(): Promise<Hackathon[]> {
    return this.request<Hackathon[]>("/hackathons");
  }

  async getHackathon(id: string): Promise<Hackathon> {
    return this.request<Hackathon>(`/hackathons/${id}`);
  }

  async createHackathon(data: {
    title: string;
    tagline?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<Hackathon> {
    return this.request<Hackathon>("/hackathons", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async publishResults(hackathonId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/hackathons/${hackathonId}/publish-results`, {
      method: "POST",
    });
  }

  // Rubrics
  async listRubrics(hackathonId?: string): Promise<Rubric[]> {
    const url = hackathonId ? `/rubrics?hackathon_id=${hackathonId}` : "/rubrics";
    return this.request<Rubric[]>(url);
  }

  async getRubric(id: string): Promise<Rubric> {
    return this.request<Rubric>(`/rubrics/${id}`);
  }

  async createRubricVersion(data: any): Promise<Rubric> {
    return this.request<Rubric>("/rubrics", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Teams
  async listTeams(hackathonId?: string): Promise<Team[]> {
    const url = hackathonId ? `/teams?hackathon_id=${hackathonId}` : "/teams";
    return this.request<Team[]>(url);
  }

  async getTeam(id: string): Promise<Team> {
    return this.request<Team>(`/teams/${id}`);
  }

  async getMyTeam(): Promise<Team | null> {
    return this.request<Team | null>("/teams/my-team");
  }

  async createTeam(data: { name: string; hackathon_id: string }): Promise<Team> {
    return this.request<Team>("/teams", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async joinTeam(joinCode: string): Promise<Team> {
    return this.request<Team>("/teams/join", {
      method: "POST",
      body: JSON.stringify({ join_code: joinCode }),
    });
  }

  // Submissions
  async listSubmissions(): Promise<Submission[]> {
    return this.request<Submission[]>("/submissions");
  }

  async getSubmission(id: string): Promise<Submission> {
    return this.request<Submission>(`/submissions/${id}`);
  }

  async getMySubmission(): Promise<Submission | null> {
    return this.request<Submission | null>("/submissions/my-submission");
  }

  async createSubmission(data: any): Promise<Submission> {
    return this.request<Submission>("/submissions", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // AI Evidence
  async getAiEvidence(submissionId: string): Promise<any> {
    return this.request<any>(`/ai-evidence/${submissionId}`);
  }

  // Evaluations
  async listEvaluations(filters?: { team_id?: string; judge_id?: string; hackathon_id?: string }): Promise<Evaluation[]> {
    const params = new URLSearchParams();
    if (filters?.team_id) params.set("team_id", filters.team_id);
    if (filters?.judge_id) params.set("judge_id", filters.judge_id);
    if (filters?.hackathon_id) params.set("hackathon_id", filters.hackathon_id);
    return this.request<Evaluation[]>(`/evaluations?${params.toString()}`);
  }

  async getEvaluation(id: string): Promise<Evaluation> {
    return this.request<Evaluation>(`/evaluations/${id}`);
  }

  async checkGuardrail(data: any): Promise<GuardrailCheckResult> {
    return this.request<GuardrailCheckResult>("/evaluations/guardrail-check", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async saveDraftEvaluation(data: any): Promise<Evaluation> {
    return this.request<Evaluation>("/evaluations/draft", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async submitEvaluation(data: any): Promise<Evaluation> {
    return this.request<Evaluation>("/evaluations/submit", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Anomalies
  async getAnomalyDashboard(hackathonId?: string): Promise<AnomalyDashboardData> {
    const url = hackathonId ? `/anomalies?hackathon_id=${hackathonId}` : "/anomalies";
    return this.request<AnomalyDashboardData>(url);
  }

  // Integrity
  async getIntegrityOverview(): Promise<IntegrityOverview> {
    return this.request<IntegrityOverview>("/integrity");
  }

  async verifyEvaluationIntegrity(evaluationId: string): Promise<any> {
    return this.request<any>(`/integrity/verify/${evaluationId}`);
  }

  async simulateTampering(evaluationId?: string): Promise<any> {
    const url = evaluationId ? `/integrity/simulate-tampering?evaluation_id=${evaluationId}` : "/integrity/simulate-tampering";
    return this.request<any>(url, { method: "POST" });
  }

  async restoreDemo(): Promise<any> {
    return this.request<any>("/integrity/restore-demo", { method: "POST" });
  }

  // Audit
  async listAuditLogs(): Promise<any[]> {
    return this.request<any[]>("/audit");
  }

  async getDecisionReplay(evaluationId: string): Promise<DecisionReplayData> {
    return this.request<DecisionReplayData>(`/audit/replay/${evaluationId}`);
  }
}

export const api = new ApiClient();
