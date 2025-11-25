import { getUser } from "@/lib/auth/actions";
import { redirect } from "next/navigation";
import GoogleConnectClient from "./connect-client";

export default async function GoogleConnectPage() {
  const user = await getUser();
  
  if (!user) {
    redirect("/auth/signin");
  }

  return <GoogleConnectClient userId={user.id} userEmail={user.email || ""} />;
}
