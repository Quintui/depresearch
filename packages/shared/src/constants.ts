export const DEFAULT_MODEL = "openrouter/anthropic/claude-haiku-4.5";

/**
 * Ensure a model ID has the "openrouter/" prefix.
 * depresearch uses OpenRouter as its only LLM provider,
 * so all model IDs must be in OpenRouter format.
 */
export function ensureOpenRouterModel(model: string): string {
  if (model.startsWith("openrouter/")) return model;
  return `openrouter/${model}`;
}
