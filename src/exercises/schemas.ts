import { z } from 'zod'
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email address'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters long'),
})

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    displayName: z
        .string()
        .min(2, 'Display name must be at least 2 characters long')
        .max(50, 'Too Long a name')
        .optional(),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters long')
        .regex(/[A-Z]/, 'Need one uppercase letter')
        .regex(/[0-9]/, 'Need one number'),
    confirmPassword: z.string(),
})
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    })

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>