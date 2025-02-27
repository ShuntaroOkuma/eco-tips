export interface EcoData {
  electricity: number;
  water: number;
  temperature: number;
  humidity: number;
  weather: string;
  people: number;
}

export interface ParsedData extends EcoData {
  timestamp: string;
}

export interface ApiConfig {
  type: 'openai' | 'anthropic';
  apiKey: string;
}