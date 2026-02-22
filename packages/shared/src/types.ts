export interface ResearchRequest {
  library: string;
  query: string;
}

export interface ResearchResponse {
  content: string;
}

export interface HealthResponse {
  status: "ok";
}

export interface ConfigData {
  port: number;
  model: string;
}
