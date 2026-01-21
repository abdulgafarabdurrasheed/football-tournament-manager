import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User as UserIcon, Settings, LogOut, ChevronDown } from "lucide-react";
import { useUser, useAuthStore } from "@/stores/authStores";
import { motion, AnimatePresence } from "framer-motion";

export function UserProfile() {
  const navigate = useNavigate();
  const user = useUser();
  const { signOut } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
    navigate("/");
  };

  const handleOpenProfile = () => {
    navigate("/profile");
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-full transition-colors"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.displayName || "User"}
            className="w-6 h-6 rounded-full object-cover"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
            <UserIcon className="h-3.5 w-3.5 text-slate-400" />
          </div>
        )}
        <span className="text-sm font-medium text-white max-w-[100px] truncate">
          {user.displayName || user.email.split("@")[0]}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-slate-800">
              <p className="text-sm font-medium text-white truncate">
                {user.displayName || "No display name"}
              </p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>

            <div className="py-2">
              <button
                onClick={handleOpenProfile}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <Settings className="h-4 w-4" />
                Profile & Settings
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default UserProfile;