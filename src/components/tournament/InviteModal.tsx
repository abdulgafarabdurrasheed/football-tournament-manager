import { useState } from "react";
import { X, Copy, Mail, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useTournamentStore } from "@/stores/tournamentStore";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Label } from "@/components/ui/label";

interface InviteModalProps {
  tournamentId: string;
}

export function InviteModal({ tournamentId }: InviteModalProps) {
  const { isInviteModalOpen, closeInviteModal } = useTournamentStore();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteLink = `${window.location.origin}/tournament/${tournamentId}?invite=true`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Link Copied");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = async () => {
    if (!email.trim()) return;

    setSending(true);
    try {
      const { error } = await supabase.from("tournament_invites").insert({
        tournament_id: tournamentId,
        email: email.trim().toLowerCase(),
        invite_type: "EMAIL",
        status: "PENDING",
      });
      if (error) {
        if (error.code === "23505") {
          toast.error("Invite link already sent to this user's email");
        } else {
          throw error;
        }
      } else {
        toast.success(`Invite sent to ${email}`);
        setEmail("");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send invite");
    } finally {
      setSending(false);
    }
  };

  if (!isInviteModalOpen) return null;

  return (
    <AnimatePresence>
      {isInviteModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeInviteModal}
            className="fixed inset-0 bg-black/60 z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Invite Players</h2>
                <button
                  onClick={closeInviteModal}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <Label className="mb-2 block">Share Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={inviteLink}
                    readOnly
                    className="text-sm bg-slate-900 text-slate-300"
                  />
                  <Button variant="outline" onClick={handleCopyLink}>
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Send Invite (Email)</Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="friend@example.com"
                    onKeyDown={(e) => e.key === "Enter" && handleSendInvite()}
                  />
                  <Button
                    onClick={handleSendInvite}
                    disabled={sending || !email.trim()}
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}