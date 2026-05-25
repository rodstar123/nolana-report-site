"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LogOutButton() {
  const router = useRouter();

  const handleLogOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <button
      onClick={handleLogOut}
      className="font-body text-sm text-slate-light hover:text-warm-white transition-colors duration-200 underline underline-offset-2"
    >
      Log out
    </button>
  );
}
