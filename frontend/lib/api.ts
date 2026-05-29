import {
  CityPreset,
  CompareLocationsRequest,
  CompareLocationsResponse,
  SavedBudgetPlanCreate,
  SavedBudgetPlanUpdate,
  SavedScenario,
  SimulationInput,
  SimulationResult,
  WhatIfResponse,
} from "@/types/simulation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  simulate: (input: SimulationInput) =>
    request<SimulationResult>("/api/simulate", { method: "POST", body: JSON.stringify(input) }),
  getWhatIfAnalysis: (input: SimulationInput) =>
    request<WhatIfResponse>("/api/what-if", { method: "POST", body: JSON.stringify({ base_input: input }) }),
  cityPresets: () => request<CityPreset[]>("/api/city-presets"),
  compareLocations: (input: CompareLocationsRequest) =>
    request<CompareLocationsResponse>("/api/compare-locations", { method: "POST", body: JSON.stringify(input) }),
  createScenario: (input: SavedBudgetPlanCreate) =>
    request<SavedScenario>("/api/scenarios", { method: "POST", body: JSON.stringify(input) }),
  saveScenario: (input: SimulationInput) =>
    request<SavedScenario>("/api/scenarios", { method: "POST", body: JSON.stringify(input) }),
  listScenarios: () => request<SavedScenario[]>("/api/scenarios"),
  scenarios: () => request<SavedScenario[]>("/api/scenarios"),
  getScenario: (id: number) => request<SavedScenario>(`/api/scenarios/${id}`),
  scenario: (id: number) => request<SavedScenario>(`/api/scenarios/${id}`),
  updateScenario: (id: number, input: SavedBudgetPlanUpdate) =>
    request<SavedScenario>(`/api/scenarios/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  duplicateScenario: (id: number) =>
    request<SavedScenario>(`/api/scenarios/${id}/duplicate`, { method: "POST" }),
  deleteScenario: (id: number) => request<void>(`/api/scenarios/${id}`, { method: "DELETE" }),
};
