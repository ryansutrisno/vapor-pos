/* eslint-disable @typescript-eslint/no-unused-vars */
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: 1.0,
  attachStacktrace: true,
  beforeSend(event, hint) {
    if (process.env.NODE_ENV === 'test') {
      return null;
    }
    return event;
  }
});

export { Sentry };

export function captureException(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, { extra: context });
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level);
}
