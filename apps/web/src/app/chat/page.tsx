import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { GlobalChat } from "@/components/global-chat";

export default async function ChatPage() {
  const session = await getServerSession(authOptions);
  return <GlobalChat session={session} />;
}
