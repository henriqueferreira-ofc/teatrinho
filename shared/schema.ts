import { z } from "zod";

// Schema do usuário para Firestore
export const firestoreUserSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Endereço de email inválido"),
  provider: z.enum(["email", "google"]),
  photoURL: z.string().url().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const createUserSchema = firestoreUserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserSchema = firestoreUserSchema.partial().omit({
  id: true,
  email: true,
  provider: true,
});

export type FirestoreUser = z.infer<typeof firestoreUserSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

// Schemas de autenticação
export const loginSchema = z.object({
  email: z.string().email("Endereço de email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Endereço de email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  terms: z.boolean().refine(val => val === true, "Você deve concordar com os termos"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres").optional(),
}).refine(data => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "A senha atual é obrigatória para alterar a senha",
  path: ["currentPassword"],
});

export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
export type UpdateProfileForm = z.infer<typeof updateProfileSchema>;
