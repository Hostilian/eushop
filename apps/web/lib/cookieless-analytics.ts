// COMPLIANCE-REVIEW: Privacy-Preserving Cookieless Analytics Engine
// Complies with GDPR Art. 5(1)(c) data minimization & ePrivacy Directive (no cookies or persistent tracking IDs stored).

export interface AnalyticsEvent {
  eventName: string;
  pagePath: string;
  countryCode: string;
  timestamp: string;
}

const anonymousEventLog: AnalyticsEvent[] = [];

/**
 * Logs an anonymous analytics event without storing IP addresses or user identifiers.
 */
export function trackAnonymousEvent(eventName: string, pagePath: string, countryCode: string = 'EU'): AnalyticsEvent {
  const event: AnalyticsEvent = {
    eventName,
    pagePath,
    countryCode,
    timestamp: new Date().toISOString(),
  };

  anonymousEventLog.push(event);
  if (anonymousEventLog.length > 500) {
    anonymousEventLog.shift(); // Memory cap for privacy
  }

  return event;
}

export function getAnonymousMetrics(): { totalEvents: number; topPages: Record<string, number> } {
  const topPages: Record<string, number> = {};
  for (const event of anonymousEventLog) {
    topPages[event.pagePath] = (topPages[event.pagePath] || 0) + 1;
  }
  return {
    totalEvents: anonymousEventLog.length,
    topPages,
  };
}
