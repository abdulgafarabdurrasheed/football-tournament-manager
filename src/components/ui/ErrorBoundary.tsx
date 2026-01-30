import { Component, ReactNode } from 'react'
import * as Sentry from '@sentry/react'
import { AlertTriangle, AlignCenter, RefreshCw } from 'lucide-react'
import { Button } from './Button'

interface Props{
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        Sentry.captureException(error, {
            extra: {
                componentStack: errorInfo.componentStack,
            },
        })
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null })
    }

    render() {
        if (this.state.hasError){
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <div className="text-center max-w-md">
                        <div className="bg-red-500/10 p-4 rounded-full inline-block mb-4">
                            <AlertTriangle className="h-12 w-12 text-red-500" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">
                            Something went wrong
                        </h2>

                        <p className="text-slate-400 mb-6">
                            An unexpected error occurred. Our team has been notified
                        </p>

                        { import.meta.env.DEV && this.state.error && (
                            <pre className="text-left text-xs text-red-400 bg-slate-900 p-4 rounded-lg mb-6 overflow-auto max-h-40">
                                { this.state.error.message }
                            </pre>
                        ) }

                        <div className="flex gap-3 justify-center">
                            <Button onClick={ this.handleReset }>
                                <RefreshCw className='h-4 w-4 mr-2' />
                                Try Again
                            </Button>

                            <Button variant='secondary' onClick={() => window.location.href = '/'}>
                                Go Home
                            </Button>
                        </div>
                    </div>
                </div>
           )
        }

        return this.props.children
    }
}

export default ErrorBoundary