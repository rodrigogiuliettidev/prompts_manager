"use server";

import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export type PromptDto = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
};

const promptInput = z.object({
  title: z.string().trim().min(1, "Dê um título ao prompt.").max(200, "Título muito longo."),
  content: z.string().trim().min(1, "Escreva o conteúdo do prompt.").max(20000, "Conteúdo muito longo."),
});

type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

const toDto = (p: { id: string; title: string; content: string; updatedAt: Date }): PromptDto => ({
  id: p.id,
  title: p.title,
  content: p.content,
  updatedAt: p.updatedAt.toISOString(),
});

const requireUser = async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
};

const fail = (error: unknown): { ok: false; error: string } => {
  if (error instanceof z.ZodError) return { ok: false, error: error.issues[0]?.message ?? "Dados inválidos." };
  if (error instanceof Error && error.message === "UNAUTHENTICATED") {
    return { ok: false, error: "Sua sessão expirou. Entre novamente." };
  }
  console.error(error);
  return { ok: false, error: "Não foi possível salvar. Tente de novo." };
};

export async function listPrompts(): Promise<PromptDto[]> {
  const user = await requireUser();
  const prompts = await prisma.prompt.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });
  return prompts.map(toDto);
}

export async function createPrompt(input: { title: string; content: string }): Promise<ActionResult<PromptDto>> {
  try {
    const user = await requireUser();
    const data = promptInput.parse(input);
    const prompt = await prisma.prompt.create({ data: { ...data, userId: user.id } });
    return { ok: true, data: toDto(prompt) };
  } catch (error) {
    return fail(error);
  }
}

export async function updatePrompt(
  id: string,
  input: { title: string; content: string },
): Promise<ActionResult<PromptDto>> {
  try {
    const user = await requireUser();
    const data = promptInput.parse(input);
    const existing = await prisma.prompt.findFirst({ where: { id, userId: user.id } });
    if (!existing) return { ok: false, error: "Prompt não encontrado." };
    const prompt = await prisma.prompt.update({ where: { id }, data });
    return { ok: true, data: toDto(prompt) };
  } catch (error) {
    return fail(error);
  }
}

export async function deletePrompt(id: string): Promise<ActionResult<null>> {
  try {
    const user = await requireUser();
    await prisma.prompt.deleteMany({ where: { id, userId: user.id } });
    return { ok: true, data: null };
  } catch (error) {
    return fail(error);
  }
}

export async function importPrompts(
  items: { title: string; content: string }[],
): Promise<ActionResult<PromptDto[]>> {
  try {
    const user = await requireUser();
    const valid = items
      .slice(0, 200)
      .map((item) => promptInput.safeParse(item))
      .filter((result) => result.success)
      .map((result) => result.data);
    await prisma.prompt.createMany({
      data: valid.map((item) => ({ ...item, userId: user.id })),
    });
    return { ok: true, data: await listPrompts() };
  } catch (error) {
    return fail(error);
  }
}
