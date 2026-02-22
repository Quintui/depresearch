export interface ResearchRequest {
  library: string;
  query: string;
}

export interface ResearchResponse {
  content: string;
}

export interface ConfigData {
  model: string;
}
