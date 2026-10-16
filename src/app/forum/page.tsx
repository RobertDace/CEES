import { redirect } from "next/navigation";

export default function ForumPageRedirect() {
  redirect("/news?tab=forum");
}
