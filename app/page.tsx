import { listPrompts } from "./actions";
import LoginScreen from "@/components/login-screen";
import PromptsApp from "@/components/prompts-app";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) return <LoginScreen />;

  const prompts = await listPrompts();
  return <PromptsApp initialPrompts={prompts} user={{ name: user.name, image: user.image ?? null }} />;
}
