"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  verifyCredentials,
} from "@/lib/auth";
import { deleteUpload, saveUpload } from "@/lib/uploads";

function revalidatePublicPages() {
  revalidatePath("/");
  revalidatePath("/catalogue");
  revalidatePath("/admin/dashboard");
}

export async function loginAction(
  _prevState: { error: string } | undefined,
  formData: FormData
) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  const valid = await verifyCredentials(username, password);
  if (!valid) {
    return { error: "Invalid username or password." };
  }

  const token = await createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  redirect("/admin/dashboard");
}

export async function generateCredentialsAction(
  _prevState: { error?: string; envBlock?: string } | undefined,
  formData: FormData
) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!username) {
    return { error: "Choose a username." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const hash = await bcrypt.hash(password, 10);
  // Next.js expands $VAR in .env values, which would mangle the bcrypt hash
  // ($2b$10$...). Escape every "$" so it loads verbatim.
  const escapedHash = hash.replace(/\$/g, "\\$");
  const envBlock = `ADMIN_USERNAME="${username}"\nADMIN_PASSWORD_HASH="${escapedHash}"`;

  return { envBlock };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

export async function createCostumeAction(
  _prevState: { error: string } | undefined,
  formData: FormData
) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const featured = formData.get("featured") === "on";
  const image = formData.get("image");

  if (!title || !description) {
    return { error: "Title and description are required." };
  }
  if (!(image instanceof File) || image.size === 0) {
    return { error: "An image is required." };
  }

  let imagePath: string;
  try {
    imagePath = await saveUpload(image);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Upload failed." };
  }

  const count = await prisma.costume.count();
  await prisma.costume.create({
    data: { title, description, imagePath, featured, order: count },
  });

  revalidatePublicPages();
  redirect("/admin/dashboard");
}

export async function updateCostumeAction(
  id: string,
  _prevState: { error: string } | undefined,
  formData: FormData
) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const featured = formData.get("featured") === "on";
  const image = formData.get("image");

  if (!title || !description) {
    return { error: "Title and description are required." };
  }

  const existing = await prisma.costume.findUnique({ where: { id } });
  if (!existing) {
    return { error: "Costume not found." };
  }

  let imagePath = existing.imagePath;
  if (image instanceof File && image.size > 0) {
    try {
      imagePath = await saveUpload(image);
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Upload failed." };
    }
    await deleteUpload(existing.imagePath);
  }

  await prisma.costume.update({
    where: { id },
    data: { title, description, imagePath, featured },
  });

  revalidatePublicPages();
  redirect("/admin/dashboard");
}

export async function deleteCostumeAction(id: string) {
  const existing = await prisma.costume.findUnique({ where: { id } });
  if (!existing) return;

  await prisma.costume.delete({ where: { id } });
  await deleteUpload(existing.imagePath);

  revalidatePublicPages();
}
