export type AIModel = {
  id: string;
  name: string;
  description: string;
  provider: "openai" | "anthropic" | "google";
  maxTokens: number;
  modelName: string;
  tokenCostPer1K: {
    input: number;
    output: number;
  };
};

export const aiModels: AIModel[] = [
  {
    id: "gemini-1.5-pro",
    name: "gemini-1.5-pro",
    description: "GoogleのGemini 1.5 Pro - Googleの最先端のAIモデル",
    provider: "google",
    maxTokens: 30000,
    modelName: "gemini-1.5-pro",
    tokenCostPer1K: { 
      input: 0.0005,
      output: 0.0015,
    },
  },
  {
    id: "gemini-2.0-flash",
    name: "gemini-2.0-flash-001",
    description: "GoogleのGemini 2.0 Flash - Googleの高性能AIモデル",
    provider: "google",
    maxTokens: 30000,
    modelName: "gemini-2.0-flash-001",
    tokenCostPer1K: {
      input: 0.0005,
      output: 0.0015,
    },
  },
  {
    id:"gemini-2.0-flash-thinking-exp-01-21",
    name: "gemini-2.0-flash-thinking-exp-01-21",
    description: "GoogleのGemini 2.0 Flash Thinking Experiment - Googleの最先端のAIモデル",
    provider: "google",
    maxTokens: 30000,
    modelName: "gemini-2.0-flash-thinking-exp-01-21",
    tokenCostPer1K: {
      input: 0.0005,
      output: 0.0015,
    },
  },
  {
    id: "gemini-2.5-pro-preview-03-25",
    name: "gemini-2.5-pro-preview-03-25",
    description: "GoogleのGemini 2.5 Pro Preview - Googleの最先端のAIモデル",
    provider: "google",
    maxTokens: 30000,
    modelName: "gemini-2.5-pro-preview-03-25",
    tokenCostPer1K: {
      input: 0.0005,
      output: 0.0015,
    },
  },
  {
    id: "gemini-2.5-flash-preview-04-17",
    name: "gemini-2.5-flash-preview-04-17",
    description: "GoogleのGemini 2.5 Flash Preview - Googleの最先端のAIモデル",
    provider: "google",
    maxTokens: 30000,
    modelName: "gemini-2.5-flash-preview-04-17",
    tokenCostPer1K: {
      input: 0.0005,
      output: 0.0015,
    },
  },
  // {
  //   id: "gpt-4o",
  //   name: "GPT-4o",
  //   description: "OpenAIのGPT-4o - 最先端のマルチモーダルAIモデル",
  //   provider: "openai",
  //   maxTokens: 128000,
  //   modelName: "gpt-4o",
  //   tokenCostPer1K: {
  //     input: 0.005,
  //     output: 0.015,
  //   },
  // },
  // {
  //   id: "gpt-3.5-turbo",
  //   name: "GPT-3.5 Turbo",
  //   description: "OpenAIのGPT-3.5 Turbo - 高速で経済的なモデル",
  //   provider: "openai",
  //   maxTokens: 16385,
  //   modelName: "gpt-3.5-turbo",
  //   tokenCostPer1K: {
  //     input: 0.0005,
  //     output: 0.0015,
  //   },
  // },
  // {
  //   id: "claude-3-opus",
  //   name: "Claude 3 Opus",
  //   description: "AnthropicのClaude 3 Opus - 最高性能のClaude",
  //   provider: "anthropic",
  //   maxTokens: 200000,
  //   modelName: "claude-3-opus-20240229",
  //   tokenCostPer1K: {
  //     input: 0.015,
  //     output: 0.075,
  //   },
  // },
  // {
  //   id: "claude-3-sonnet",
  //   name: "Claude 3 Sonnet",
  //   description: "AnthropicのClaude 3 Sonnet - バランスの取れたモデル",
  //   provider: "anthropic",
  //   maxTokens: 200000,
  //   modelName: "claude-3-sonnet-20240229",
  //   tokenCostPer1K: {
  //     input: 0.003,
  //     output: 0.015,
  //   },
  // },
];

export function getModelById(id: string): AIModel | undefined {
  return aiModels.find((model) => model.id === id);
}

export function getDefaultModel(): AIModel {
  return aiModels[0]; // Gemini Proをデフォルトに設定
}

/**
 * すべてのAIモデルを取得
 * @returns 利用可能なすべてのAIモデルの配列
 */
export function getAllModels(): AIModel[] {
  return aiModels;
} 