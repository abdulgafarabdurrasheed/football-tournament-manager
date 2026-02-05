import { useFormContext } from "react-hook-form";
import { Globe, Lock, Mail } from 'lucide-react';
import type { CreateTournamentFormData } from "@/schemas/tournament.schema";
import Input from "@/components/ui/Input";
import { Label } from "@/components/ui/label"

const VISIBILITY_OPTIONS = [
    { value: 'PUBLIC', label: 'Public', icon: Globe, description: 'Anyone can find and join' },
    { value: 'PRIVATE', label: 'Private', icon: Lock, description: 'Only invited players can join' },
    { value: 'INVITE_ONLY', label: 'Invite Only', icon: Mail, description: 'Players need an invite link' },
]

