import { z } from 'zod'

const nameSchema = z
    .string()
    .min(3, "Name must be at least 3 characters long")
    .max(50, "Name must be at most 50 characters long")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Name can only contain letters, numbers, spaces, hyphens, and underscores')

export const basicInfoSchema = z.object({
    name: nameSchema,
    description: z.string().max(500, "Description must be at most 500 characters long").optional(),
    visibility: z.enum(['PUBLIC', 'PRIVATE', 'INVITE_ONLY']),
})

export const formatSchema = z.object({
    format: z.enum(['LEAGUE', 'KNOCKOUT', 'HYBRID_MULTI_GROUP', 'HYBRID_SINGLE_LEAGUE']),
    maxParticipants: z
        .number()
        .min(2, "There must be at least 2 participants")
        .max(64, "There can be at most 64 participants")
})

export const settingsSchema = z.object({
    pointsForWin: z.number().min(0).max(10).default(3),
    pointsForDraw: z.number().min(0).max(10).default(1),
    legsPerMatch: z.union([z.literal(1), z.literal(2)]).default(2),
    groupSize: z.number().min(3).max(8).default(4),
    teamsAdvancing: z.number().min(1).max(4).default(2),
    hasThirdPlace: z.boolean().default(false),
})

export const teamsSchema = z.object({
  inviteEmails: z.array(z.string().email('Invalid email address')).max(63),
})

export const createTournamentSchema = z.object({
  ...basicInfoSchema.shape,
  ...formatSchema.shape,
  ...settingsSchema.shape,
  ...teamsSchema.shape,
})

export const joinTournamentSchema = z.object({
  teamName: z
    .string()
    .min(2, 'Team name must be at least 2 characters')
    .max(30, 'Team name must be at most 30 characters'),
  gameplanId: z.string().uuid().optional(),
})

export const inviteCodeSchema = z.object({
  code: z
    .string()
    .length(6, 'Invite code must be 6 characters')
    .toUpperCase(),
})

export const matchScoreSchema = z.object({
  homeScore: z.number().min(0).max(99),
  awayScore: z.number().min(0).max(99),
  homeStats: z.array(z.object({
    playerName: z.string(),
    goals: z.number().min(0).default(0),
    assists: z.number().min(0).default(0),
  })).optional(),
  awayStats: z.array(z.object({
    playerName: z.string(),
    goals: z.number().min(0).default(0),
    assists: z.number().min(0).default(0),
  })).optional(),
})

export const knockoutScoreSchema = matchScoreSchema.extend({
  homeExtraTime: z.number().min(0).optional(),
  awayExtraTime: z.number().min(0).optional(),
  homePenalties: z.number().min(0).optional(),
  awayPenalties: z.number().min(0).optional(),
  decidedBy: z.enum(['NORMAL', 'EXTRA_TIME', 'PENALTIES']).default('NORMAL'),
})

export type BasicInfoFormData = z.infer<typeof basicInfoSchema>
export type FormatFormData = z.infer<typeof formatSchema>
export type SettingsFormData = z.infer<typeof settingsSchema>
export type TeamsFormData = z.infer<typeof teamsSchema>
export type CreateTournamentFormData = z.infer<typeof createTournamentSchema>
export type JoinTournamentFormData = z.infer<typeof joinTournamentSchema>
export type InviteCodeFormData = z.infer<typeof inviteCodeSchema>
export type MatchScoreFormData = z.infer<typeof matchScoreSchema>
export type KnockoutScoreFormData = z.infer<typeof knockoutScoreSchema>