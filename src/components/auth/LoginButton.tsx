import { useState } from "react";
import Button from '@/components/ui/Button'
import { AuthModal } from './AuthModal'

interface LoginButtonProps{
    className?: string
}

export function LoginButton({ className }: LoginButtonProps) {
    const [showModal, setShowModal] = useState(false);

    return(
        <>
            <Button onClick={() => setShowModal(true)} className={className}>Sign In</Button>
            <AuthModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </>
    )
}

export default LoginButton
