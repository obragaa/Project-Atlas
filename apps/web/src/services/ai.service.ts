import { API_ROUTES, type AiChatRequest, type AiChatResponse } from "@atlas/contracts";
import { apiRequest } from "./api-client";

/**
 * Typed Atlas AI operations (the `services` layer — blueprint/11). The access
 * token is attached automatically by the api-client.
 */
export const aiService = {
  chat(request: AiChatRequest): Promise<AiChatResponse> {
    return apiRequest<AiChatResponse>(API_ROUTES.ai.chat, {
      method: "POST",
      body: request,
    });
  },
};
