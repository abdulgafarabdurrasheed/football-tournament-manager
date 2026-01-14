import { z } from 'zod';

const emailSchema = z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')

const passwordSchema = z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters long')

const strongPasswordSchema = z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required')
})

export const registerSchema = z.object({
    email: emailSchema,
    displayName: z
        .string()
        .min(2, 'Display name must be at least 2 characters long')
        .max(50, 'Display name must be at most 50 characters long')
        .optional()
        .or(z.literal('')),
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
})

export const forgotPasswordSchema = z.object({
    email: emailSchema
})

export const resetPasswordSchema = z.object({
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
})

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
