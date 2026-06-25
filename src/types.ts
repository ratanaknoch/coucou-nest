export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  model: string;
  systemInstruction?: string;
  messages: Message[];
  createdAt: string;
}

export interface DownloadableModel {
  id: string;
  name: string;
  size: string;
  description: string;
  downloaded: boolean;
  downloadProgress: number; // 0 to 100
  downloadSpeed?: string; // e.g. "12.4 MB/s"
  eta?: string; // e.g. "23s"
  compilingPhase?: string; // e.g. "Quantizing...", "Verifying hashes...", "Cached"
  isDownloading?: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface TeachingMaterials {
  introduction: string;
  keyConcepts: string[];
  videoPlaceholderText: string;
}

export interface AlgorithmicChallenge {
  id: string;
  name: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  starterCode: string;
  optimalComplexity: string;
  testCases: { input: string; expected: string }[];
  steps: { line: number; label: string; action: string; stateBefore: string; stateAfter: string }[];
  teachingMaterials?: TeachingMaterials;
  quiz?: QuizQuestion[];
  enrolled?: boolean;
}

export interface HardwareSpecs {
  ram: number;
  threads: number;
  gpuStatus: string;
  recommendedModel: string;
}
