import { type FirestoreUser, type CreateUser } from "@shared/schema";
import { randomUUID } from "crypto";

// This storage interface is for future backend features
// Currently, Firebase handles user authentication and storage

export interface IStorage {
  getUser(id: string): Promise<FirestoreUser | undefined>;
  getUserByEmail(email: string): Promise<FirestoreUser | undefined>;
  createUser(user: CreateUser): Promise<FirestoreUser>;
}

export class MemStorage implements IStorage {
  private users: Map<string, FirestoreUser>;

  constructor() {
    this.users = new Map();
  }

  async getUser(id: string): Promise<FirestoreUser | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<FirestoreUser | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: CreateUser): Promise<FirestoreUser> {
    const id = randomUUID();
    const user: FirestoreUser = { 
      ...insertUser, 
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
