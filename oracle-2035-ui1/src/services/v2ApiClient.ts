/**
 * ORACLE 2035 V2 — Frontend API Client
 *
 * Dedicated client for consuming POST /api/v2/analyze-decision
 * Strictly enforces server authority and typing contracts.
 */

import {
  V2DecisionPayload,
  V2AnalyzeDecisionSuccessResponse,
  V2AnalyzeDecisionErrorResponse,
} from '../types/v2';

export interface V2ApiResponse {
  success: boolean;
  data?: V2AnalyzeDecisionSuccessResponse['data'];
  error?: V2AnalyzeDecisionErrorResponse['error'];
}

export async function analyzeDecisionV2(payload: V2DecisionPayload): Promise<V2ApiResponse> {
  try {
    const response = await fetch('/api/v2/analyze-decision', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      return {
        success: false,
        error: json.error || {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected server error occurred during V2 analysis.',
        },
      };
    }

    return {
      success: true,
      data: json.data,
    };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Network failure or unreachable endpoint';
    return {
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to connect to ORACLE 2035 V2 server: ${errorMessage}`,
      },
    };
  }
}
