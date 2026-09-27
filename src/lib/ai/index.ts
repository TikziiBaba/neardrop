/**
 * NearDrop Unified AI Service Hub
 * Routes design, UI component generation, and frontend tasks to Claude (Anthropic),
 * and standard inference / NIM tasks to NVIDIA.
 */

import {
  generateClaudeCompletion,
  streamClaudeCompletion,
  ClaudeMessage,
  DEFAULT_CLAUDE_MODEL,
} from './claude';
import {
  generateChatCompletion as generateNvidiaCompletion,
  streamChatCompletion as streamNvidiaCompletion,
  ChatMessage as NvidiaChatMessage,
  DEFAULT_NVIDIA_MODEL,
} from './nvidia';

export * from './claude';
export * from './nvidia';

export type TaskCategory = 'design' | 'code' | 'general' | 'vision';

export interface CompletionRequest {
  category?: TaskCategory;
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  preferredModel?: string;
}

/**
 * Executes an AI completion automatically routed to the optimal model:
 * - 'design' & 'code' tasks default to Anthropic Claude (Claude 3.5 Sonnet)
 * - 'general' & 'vision' tasks can use Claude or NVIDIA NIM
 */
export async function executeAICompletion(request: CompletionRequest): Promise<string> {
  const isDesignOrCode = request.category === 'design' || request.category === 'code';

  // Check if Anthropic key is present for design/code tasks
  if (isDesignOrCode || Boolean(process.env.ANTHROPIC_API_KEY)) {
    try {
      const claudeMessages: ClaudeMessage[] = request.messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

      // Extract system prompt if available
      const systemMessage = request.messages.find((m) => m.role === 'system');
      const system = request.systemPrompt || systemMessage?.content;

      return await generateClaudeCompletion(claudeMessages, {
        model: request.preferredModel || DEFAULT_CLAUDE_MODEL,
        system,
        temperature: request.temperature,
        max_tokens: request.maxTokens,
      });
    } catch (err) {
      // If Claude fails or key is missing and Nvidia is configured, fallback gracefully
      if (process.env.NVIDIA_API_KEY) {
        console.warn('[AI Hub] Claude request failed, falling back to NVIDIA NIM:', err);
      } else {
        throw err;
      }
    }
  }

  // Fallback / standard route: NVIDIA NIM
  const nvidiaMessages: NvidiaChatMessage[] = request.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  return await generateNvidiaCompletion(nvidiaMessages, {
    model: request.preferredModel || DEFAULT_NVIDIA_MODEL,
    temperature: request.temperature,
    max_tokens: request.maxTokens,
  });
}
