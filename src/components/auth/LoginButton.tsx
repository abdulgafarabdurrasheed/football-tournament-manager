import { useState, ReactNode } from "react";
import Button from '@/components/ui/Button'
import { AuthModal } from './AuthModal'

interface LoginButtonProps{
    className?: string
    children?: ReactNode
}

export function LoginButton({ className, children }: LoginButtonProps) {
    const [showModal, setShowModal] = useState(false);

    return(
        <>
            <Button onClick={() => setShowModal(true)} className={className}>
                {children || 'Sign In'}
            </Button>
            <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </>
    )
}

export default LoginButton
