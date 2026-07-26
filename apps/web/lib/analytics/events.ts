/**
 * EUshop Privacy-Preserving Analytics Taxonomy
 * Zero PII logging — strictly tracks behavioral interaction events.
 */

export type EUshopEventType =
  | 'search_started'
  | 'search_query_submitted'
  | 'search_result_opened'
  | 'filter_applied'
  | 'filter_cleared'
  | 'atlas_region_opened'
  | 'food_saved'
  | 'preference_selected'
  | 'preference_skipped'
  | 'preference_reset'
  | 'signup_started'
  | 'signup_completed'
  | 'seller_onboarding_started'
  | 'seller_step_completed'
  | 'seller_draft_resumed'
  | 'checkout_started'
  | 'checkout_delivery_completed'
  | 'checkout_payment_started'
  | 'purchase_completed'
  | 'draft_saved_notice_shown';

export interface AnalyticsEventPayload {
  category?: string;
  country?: string;
  regionId?: string;
  filterName?: string;
  filterValue?: string;
  resultCount?: number;
  stepNumber?: number;
  itemCount?: number;
  durationMs?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface AnalyticsEvent {
  eventName: EUshopEventType;
  payload?: AnalyticsEventPayload;
  timestamp: number;
}

const EVENT_LOG_KEY = 'eushop_analytics_events';
const MAX_LOGGED_EVENTS = 100;

export function trackEvent(eventName: EUshopEventType, payload?: AnalyticsEventPayload): void {
  const event: AnalyticsEvent = {
    eventName,
    payload: sanitizePayload(payload),
    timestamp: Date.now(),
  };

  // Safe console trace in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics Event] ${eventName}`, event.payload);
  }

  // Dispatch browser custom event for local consumers/debuggers
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('eushop-analytics-event', { detail: event }));

    try {
      const raw = sessionStorage.getItem(EVENT_LOG_KEY);
      const logs: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];
      logs.push(event);
      if (logs.length > MAX_LOGGED_EVENTS) logs.shift();
      sessionStorage.setItem(EVENT_LOG_KEY, JSON.stringify(logs));
    } catch {
      // Ignore session storage errors for non-essential telemetry
    }
  }
}

function sanitizePayload(payload?: AnalyticsEventPayload): AnalyticsEventPayload | undefined {
  if (!payload) return undefined;
  const sanitized: AnalyticsEventPayload = {};

  const SENSITIVE_KEYS = ['email', 'password', 'name', 'address', 'phone', 'token', 'creditCard', 'vat'];

  for (const [key, value] of Object.entries(payload)) {
    if (SENSITIVE_KEYS.some(s => key.toLowerCase().includes(s))) {
      continue; // Skip sensitive fields
    }
    sanitized[key] = value;
  }
  return sanitized;
}

export function getSessionAnalyticsLogs(): AnalyticsEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(EVENT_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
