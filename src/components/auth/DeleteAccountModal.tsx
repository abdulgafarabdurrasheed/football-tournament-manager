import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  userEmail: string;
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
  userEmail,
}: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfirmed = confirmText === "DELETE";

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setIsDeleting(true);
    setError(null);

    try {
      await onConfirm();
    } catch (err) {
      setError(
        (err as Error).message ||
          "An error occurred while deleting your account.",
      );
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (isDeleting) return;
    setConfirmText("");
    setError(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70" onClick={handleClose} />
          <motion.div
            className="relative bg-slate-900 border border-red-900/50 rounded-xl max-w-md w-full p-6 shadow-2xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <button
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
              disabled={isDeleting}
              onClick={handleClose}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/10 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-xl font-bold text-red-500">Delete Account</h2>
            </div>

            <div className="space-y-3 mb-">
              <p className="text-slate-300 text-sm">
                This action is{" "}
                <span className="text-red-400 font-bold">
                  permanent, and irreversible
                </span>
                . Deleting your account will:
              </p>
              <ul className="text-slate-400 text-sm space-y-1 list-disc pl-5">
                <li>Remove your profile and all personal data</li>
                <li>Delete all gameplans you've created</li>
                <li>
                  Delete tournaments you created (and their matches/stats)
                </li>
                <li>Remove you from all tournaments you've joined</li>
              </ul>

              <p className="text-slate-400 text-sm">
                Deleting account:{" "}
                <span className="text-white font-mono">{userEmail}</span>
              </p>
            </div>

            <div className="mb-6">
              <label className="text-sm font-medium text-slate-300 block mb-2">
                Type{" "}
                <span className="text-red-400 font-mono font-bold">DELETE</span>{" "}
                to confirm
              </label>

              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE here"
                disabled={isDeleting}
                className={`font-mono ${isConfirmed ? "border-red-500" : ""}`}
              />
            </div>
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={isDeleting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={!isConfirmed || isDeleting}
                className="flex-1"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  "Delete My Account"
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
