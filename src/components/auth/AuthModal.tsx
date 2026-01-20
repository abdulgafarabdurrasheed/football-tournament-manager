import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { OAuthButtons } from "./OAuthButtons";
import { useAuthStore } from "@/stores/authStores";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
}

export function AuthModal({
  isOpen,
  onClose,
  defaultTab = "login",
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab);
  const { setError } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setError(null);
    }
  }, [isOpen, defaultTab, setError]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleSuccess = () => {
    onClose();
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="relative p-6 pb-0">
              <button className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-600 p-2.5 rounded-xl shadow-lg shadow-orange-500/20">
                  <Trophy className="h-6 w-6 text-black" />
                </div>
                <h2 className="text-2xl font-black text-white">
                  Football{" "}
                  <span className="text-yellow-500"> Tournament Manager </span>
                </h2>
              </div>

              <h3 className="text-xl font-bold text-white text-center mb-2">
                {activeTab === "login" ? "Welcom back" : "Create account"}
              </h3>
              <p className="text-slate-400 text-center text-sm mb-6">
                {activeTab === "login"
                  ? "Sign in to manage your tournaments"
                  : "Join the ultimate tournament platform"}
              </p>
            </div>
            <div className="p-6 pt-0">
              <OAuthButtons />

              <div className="my-6" />
              {activeTab === "login" ? (
                <LoginForm
                  onSuccess={handleSuccess}
                  onSwitchToRegister={() => setActiveTab("register")}
                />
              ) : (
                <RegisterForm
                  onSuccess={handleSuccess}
                  onSwitchToLogin={() => setActiveTab("login")}
                />
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
  return createPortal(modalContent, document.body);
}

export default AuthModal;
