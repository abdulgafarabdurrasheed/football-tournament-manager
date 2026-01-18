import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStores";
import { Loader2 } from "lucide-react";

export function AuthCallback() {
    const navigate = useNavigate()
    const { initialize } = useAuthStore()

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) {
                    console.error('Auth callback error:', error)
                    navigate('/?error=auth_failed')
                    return
                }

                if (session) {
                    await initialize()
                    navigate('/dashboard')    
                } else {
                    navigate('/')
                }
            } catch (error) {
                console.error('Callback error:', error)
                navigate('/?error=auth_failed')
            }
        }

        handleCallback()
    }, [navigate, initialize])

    return(
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mx-auto" />
                <p className="text-white mt-4 text-lg">Completing Sign In......</p>
                <p className="text-slate-400 mt-2">Please wait</p>
            </div>
        </div>
    )
}

export default AuthCallback