import * as Sentry from "@sentry/react"

export function initSentry() {
    if (import.meta.env.PROD) {
        Sentry.init({
            dsn: import.meta.env.VITE_SENTRY_DSN,
            environment: import.meta.env.MODE,

            tracesSampleRate: 0.1,
            replaysSessionSampleRate: 0.1,
            replaysOnErrorSampleRate: 1.0,

            ignoreErrors: [
                'ResizeObserver loop limit exceeded',
                'ResizeObserver loop completed with undelivered notifications',
                'Network request failed',
                'Load failed'
            ],

            beforeSend(event) {
                return event
            },
        })
    }
}

export function setSentryUser(user: { id: string; email?: string; } | null) {
    if (user) {
        Sentry.setUser({ id: user.id, email: user.email })
    } else {
        Sentry.setUser(null)
    }
}

export function captureError(error: Error, context?: Record<string, unknown>) {
    console.error(error)

    if (import.meta.env.PROD) {
        Sentry.captureException(error, { extra: context, })
    }
}

export function addBreadcrumb(
    message: string,
    category: string,
    data?: Record<string, unknown>,
) {
    Sentry.addBreadcrumb({
        message,
        category,
        data,
        level: 'info',
    })
}

