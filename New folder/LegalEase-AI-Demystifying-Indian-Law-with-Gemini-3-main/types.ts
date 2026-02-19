
export interface KeyClause {
  clause: string;
  explanation: string;
}

export interface SimplifyResult {
  summary: string;
  keyClauses: KeyClause[];
  redFlags: string[];
  extractedText?: string;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  preview: string;
  result: SimplifyResult;
  originalText?: string; // For RAG context restoration
}
