import { CityPreset, SavedScenario, SimulationInput, SimulationResult } from "@/types/simulation";

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
  cityPresets: () => request<CityPreset[]>("/api/city-presets"),
  saveScenario: (input: SimulationInput) =>
    request<SavedScenario>("/api/scenarios", { method: "POST", body: JSON.stringify(input) }),
  scenarios: () => request<SavedScenario[]>("/api/scenarios"),
  scenario: (id: number) => request<SavedScenario>(`/api/scenarios/${id}`),
  deleteScenario: (id: number) => request<void>(`/api/scenarios/${id}`, { method: "DELETE" }),
};
