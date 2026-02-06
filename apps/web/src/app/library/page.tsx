import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { MeetingLibrary } from "@/components/meeting-library";

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  return <MeetingLibrary session={session} />;
}
