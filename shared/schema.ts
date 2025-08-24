import { z } from "zod";

// Schema do usuário para Firestore
export const firestoreUserSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Endereço de email inválido"),
  provider: z.enum(["email", "google"]),
  photoURL: z.string().url().optional(),
  ativo: z.boolean().default(true), // Status ativo/inativo do usuário
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
  confirmPassword: z.string().min(6, "Confirmação da senha é obrigatória"),
  terms: z.boolean().refine(val => val === true, "Você deve concordar com os termos"),
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres").optional(),
}).refine(data => {
  // Só valida senha se o usuário preencheu a nova senha
  if (data.newPassword && data.newPassword.length > 0 && !data.currentPassword) {
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

// Schema para assinaturas
export const subscriptionSchema = z.object({
  email: z.string().email("Endereço de email inválido"),
  data: z.string(), // Data da assinatura em formato ISO string
  status: z.enum(["active", "inactive", "expired"]).optional(),
});

export type Subscription = z.infer<typeof subscriptionSchema>;

// Schemas para categorias e atividades
export const categoriaSchema = z.object({
  id: z.string(),
  nome: z.string(),
  imagemUrl: z.string().url(),
  ordem: z.number(),
  descricao: z.string().optional(),
  todas: z.boolean().optional(),
});

export const atividadeSchema = z.object({
  id: z.string(),
  ordem: z.number(),
  data: z.string(),
  categoria: z.string(),
  pasta: z.string(),
  arquivo: z.string(),
  imagemUrl: z.string().url(),
});

export type Categoria = z.infer<typeof categoriaSchema>;
export type Atividade = z.infer<typeof atividadeSchema>;

// Tipos para paginação de atividades
export type AtividadesPaginadas = {
  atividades: Atividade[];
  total: number;
  carregadas: number;
  temMais: boolean;
};

// Schema para atividades de eBook
export const ebookAtividadeSchema = z.object({
  id: z.string(),
  titulo: z.string().min(1, "Título é obrigatório").max(100, "Título muito longo"),
  descricao: z.string().optional(),
  tipo: z.enum(['texto', 'exercicio', 'quiz', 'video']).default('texto'),
  conteudo: z.string().optional(),
  ordem: z.number(),
  dataCriacao: z.string(), // Data de criação em formato ISO string
});

export const createEbookAtividadeSchema = ebookAtividadeSchema.omit({
  id: true,
  ordem: true,
  dataCriacao: true,
});

export type EbookAtividade = z.infer<typeof ebookAtividadeSchema>;
export type CreateEbookAtividade = z.infer<typeof createEbookAtividadeSchema>;

// Schema para eBooks
export const ebookSchema = z.object({
  id: z.string(),
  nome: z.string().min(1, "Nome do eBook é obrigatório"),
  data: z.string(), // Data de criação em formato ISO string
  atividades: z.array(ebookAtividadeSchema).default([]), // Array de atividades completas
});

export const createEbookSchema = ebookSchema.omit({
  id: true,
  data: true, // Data is auto-generated during creation
}).extend({
  nome: z.string().min(1, "Nome do eBook é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
});

export const updateEbookSchema = ebookSchema.partial().omit({
  id: true,
});

export type Ebook = z.infer<typeof ebookSchema>;
export type CreateEbook = z.infer<typeof createEbookSchema>;
export type UpdateEbook = z.infer<typeof updateEbookSchema>;
