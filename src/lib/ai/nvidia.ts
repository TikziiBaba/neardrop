/**
 * NVIDIA NIM / Build API Client for NearDrop
 * Compatible with OpenAI chat completions format.
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface NvidiaCompletionOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

export const DEFAULT_NVIDIA_MODEL =
  process.env.NVIDIA_DEFAULT_MODEL || 'meta/llama-3.2-11b-vision-instruct';

export const NVIDIA_API_BASE_URL = 'https://integrate.api.nvidia.com/v1';

export function getNvidiaApiKey(): string {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new Error('NVIDIA_API_KEY environment variable is not defined.');
  }
  return apiKey;
}

/**
 * Generate a complete chat completion from NVIDIA NIM API
 */
export async function generateChatCompletion(
  messages: ChatMessage[],
  options: NvidiaCompletionOptions = {}
): Promise<string> {
  const apiKey = getNvidiaApiKey();
  const model = options.model || DEFAULT_NVIDIA_MODEL;

  const response = await fetch(`${NVIDIA_API_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 1024,
      top_p: options.top_p ?? 1,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData.detail ||
      errorData.message ||
      errorData.title ||
      `NVIDIA API request failed with status ${response.status}`;
    throw new Error(`[NVIDIA AI Error] ${message}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Stream a chat completion from NVIDIA NIM API (returns ReadableStream for Next.js responses)
 */
export async function streamChatCompletion(
  messages: ChatMessage[],
  options: NvidiaCompletionOptions = {}
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = getNvidiaApiKey();
  const model = options.model || DEFAULT_NVIDIA_MODEL;

  const response = await fetch(`${NVIDIA_API_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 1024,
      top_p: options.top_p ?? 1,
      stream: true,
    }),
  });

  if (!response.ok || !response.body) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData.detail ||
      errorData.message ||
      errorData.title ||
      `NVIDIA API stream request failed with status ${response.status}`;
    throw new Error(`[NVIDIA AI Stream Error] ${message}`);
  }

  return response.body;
}
