/**
 * Anthropic Claude API Client for NearDrop
 * Optimized for UI/UX design generation, frontend components, and reasoning.
 */

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeCompletionOptions {
  model?: string;
  system?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export const DEFAULT_CLAUDE_MODEL =
  process.env.CLAUDE_DEFAULT_MODEL || 'claude-3-5-sonnet-20241022';

export const ANTHROPIC_API_BASE_URL = 'https://api.anthropic.com/v1';
export const ANTHROPIC_VERSION = '2023-06-01';

export function getAnthropicApiKey(): string {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY environment variable is not defined. Please add it to your .env.local file.'
    );
  }
  return apiKey;
}

/**
 * Generate a complete response from Anthropic Claude API
 */
export async function generateClaudeCompletion(
  messages: ClaudeMessage[],
  options: ClaudeCompletionOptions = {}
): Promise<string> {
  const apiKey = getAnthropicApiKey();
  const model = options.model || DEFAULT_CLAUDE_MODEL;

  const bodyPayload: Record<string, any> = {
    model,
    messages,
    max_tokens: options.max_tokens ?? 4096,
    temperature: options.temperature ?? 0.7,
  };

  if (options.system) {
    bodyPayload.system = options.system;
  }

  const response = await fetch(`${ANTHROPIC_API_BASE_URL}/messages`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyPayload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData.error?.message ||
      errorData.message ||
      `Anthropic API request failed with status ${response.status}`;
    throw new Error(`[Claude API Error] ${message}`);
  }

  const data = await response.json();
  const textContent = data.content
    ?.filter((c: any) => c.type === 'text')
    ?.map((c: any) => c.text)
    ?.join('\n');

  return textContent || '';
}

/**
 * Stream a chat response from Anthropic Claude API
 */
export async function streamClaudeCompletion(
  messages: ClaudeMessage[],
  options: ClaudeCompletionOptions = {}
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = getAnthropicApiKey();
  const model = options.model || DEFAULT_CLAUDE_MODEL;

  const bodyPayload: Record<string, any> = {
    model,
    messages,
    max_tokens: options.max_tokens ?? 4096,
    temperature: options.temperature ?? 0.7,
    stream: true,
  };

  if (options.system) {
    bodyPayload.system = options.system;
  }

  const response = await fetch(`${ANTHROPIC_API_BASE_URL}/messages`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bodyPayload),
  });

  if (!response.ok || !response.body) {
    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData.error?.message ||
      errorData.message ||
      `Anthropic API stream request failed with status ${response.status}`;
    throw new Error(`[Claude API Stream Error] ${message}`);
  }

  return response.body;
}
