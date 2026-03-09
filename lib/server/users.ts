import { createHash } from "node:crypto";
import type { User } from "@/types";
import { readJsonFile, writeJsonFile } from "@/lib/server/storage";
import { getPrismaClient } from "@/lib/server/db";

const USERS_FILE = "users.json";

interface StoredUser extends User {
  passwordHash: string;
}

function resolveRoleForEmail(email: string): "CUSTOMER" | "ADMIN" {
  const normalized = normalizeEmail(email);
  const configuredAdmin = normalizeEmail(process.env.ADMIN_EMAIL ?? "admin@babyonline.hu");
  return normalized === configuredAdmin ? "ADMIN" : "CUSTOMER";
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

async function getStoredUsers(): Promise<StoredUser[]> {
  const prisma = getPrismaClient();
  if (prisma) {
    try {
      const dbUsers = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
      return dbUsers.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name ?? undefined,
        phone: user.phone ?? undefined,
        role: user.role,
        addresses: (user.addresses as unknown as User["addresses"]) ?? [],
        wishlist: user.wishlist ?? [],
        createdAt: user.createdAt.toISOString(),
        passwordHash: user.passwordHash,
      }));
    } catch (error) {
      console.error("Prisma getStoredUsers fallback to JSON:", error);
    }
  }
  return readJsonFile<StoredUser[]>(USERS_FILE, []);
}

async function saveStoredUsers(users: StoredUser[]): Promise<void> {
  const prisma = getPrismaClient();
  if (prisma) {
    try {
      for (const user of users) {
        await prisma.user.upsert({
          where: { email: user.email },
          create: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role ?? "CUSTOMER",
            addresses: user.addresses as any,
            wishlist: user.wishlist,
            createdAt: new Date(user.createdAt),
            passwordHash: user.passwordHash,
          },
          update: {
            name: user.name,
            phone: user.phone,
            role: user.role ?? "CUSTOMER",
            addresses: user.addresses as any,
            wishlist: user.wishlist,
            passwordHash: user.passwordHash,
          },
        });
      }
      return;
    } catch (error) {
      console.error("Prisma saveStoredUsers fallback to JSON:", error);
    }
  }
  await writeJsonFile(USERS_FILE, users);
}

function toPublicUser(user: StoredUser): User {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  void _passwordHash;
  return publicUser;
}

export async function registerUser(input: {
  name: string;
  email: string;
  password: string;
}): Promise<User> {
  const email = normalizeEmail(input.email);
  const users = await getStoredUsers();

  const exists = users.some((entry) => normalizeEmail(entry.email) === email);
  if (exists) {
    throw new Error("Ezzel az email címmel már létezik fiók.");
  }

  const now = new Date().toISOString();
  const user: StoredUser = {
    id: `user-${Date.now()}`,
    email,
    name: input.name.trim(),
    addresses: [],
    wishlist: [],
    createdAt: now,
    role: resolveRoleForEmail(email),
    passwordHash: hashPassword(input.password),
  };

  users.unshift(user);
  await saveStoredUsers(users);
  return toPublicUser(user);
}

export async function getUsers(): Promise<User[]> {
  const users = await getStoredUsers();
  return users.map(toPublicUser);
}

export async function loginUser(input: {
  email: string;
  password: string;
}): Promise<User> {
  const email = normalizeEmail(input.email);
  const users = await getStoredUsers();
  const user = users.find((entry) => normalizeEmail(entry.email) === email);

  if (!user) {
    throw new Error("Hibás email cím vagy jelszó.");
  }

  if (user.passwordHash !== hashPassword(input.password)) {
    throw new Error("Hibás email cím vagy jelszó.");
  }

  const expectedRole = resolveRoleForEmail(user.email);
  if (user.role !== expectedRole) {
    user.role = expectedRole;
    await saveStoredUsers(users);
  }

  return toPublicUser(user);
}
