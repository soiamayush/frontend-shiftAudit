// src/config/apiRoutes.ts

const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
};

const BASE = getBaseUrl();

export const API_ROUTES = {
  // Auth
  SIGNUP: `${BASE}/auth/signup`,
  LOGIN: `${BASE}/auth/login`,
  GOOGLE_AUTH:`${BASE}/api/auth/google`,

  // Projects
  PROJECT_CREATE: `${BASE}/project/create`,
  PROJECT_LIST: `${BASE}/project/list`,
  PROJECT_DETAILS: (projectId: string) => `${BASE}/project/${projectId}`,
  PROJECT_DELETE: (id: string) => `${getBaseUrl()}/project/${id}`,
  PROJECT_STREAM:   (id: string) => `${getBaseUrl()}/projects/${id}/stream`,



  // Analysis
  ANALYZE: `${BASE}/api/analysis/analyze`,
  RERUN: (projectId: string) => `${BASE}/project/rerun?projectId=${projectId}`,
  AUTO_PR: `${BASE}/project/auto-pr`,
};
