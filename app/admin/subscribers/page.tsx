import { createClient } from "@supabase/supabase-js";
import { getSubscriber } from "@/lib/get-subscriber";
import { redirect } from "next/navigation";

const ADMIN_EMAILS = ["noerod@pioneerzeal.com", "info@nationalboco.com"];

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-navy-deep border border-white/10 rounded-xl p-5 text-center">
      <p className="font-mono font-bold text-warm-white text-3xl">{value}</p>
      <p className="font-body text-slate-light text-xs uppercase tracking-widest mt-1">
        {label}
      </p>
    </div>
  );
}

export default async function AdminSubscribers() {
  const me = await getSubscriber();
  if (!me || !ADMIN_EMAILS.includes(me.email)) redirect("/");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: subscribers } = await supabase
    .from("subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = subscribers ?? [];

  const stats = {
    total: rows.length,
    free: rows.filter((s) => s.tier === "free" && !s.unsubscribed).length,
    pro: rows.filter((s) => s.tier === "pro").length,
    intel: rows.filter((s) => s.tier === "intel").length,
    unsub: rows.filter((s) => s.unsubscribed).length,
  };
  const mrr = stats.pro * 9 + stats.intel * 19;

  return (
    <main
      className="min-h-screen py-16 px-4"
      style={{ background: "linear-gradient(to bottom, #0f1722, #1a2332)" }}
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="font-display font-bold text-warm-white text-3xl mb-8">
          Subscriber Dashboard
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-10">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Free" value={stats.free} />
          <StatCard label="Pro" value={stats.pro} />
          <StatCard label="Intel" value={stats.intel} />
          <StatCard label="Unsub" value={stats.unsub} />
          <StatCard label="MRR" value={`$${mrr}`} />
        </div>

        {/* Table */}
        <div className="bg-navy-deep border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {["Email", "Tier", "Joined", "Referral Code", "Status"].map(
                    (h) => (
                      <th
                        key={h}
                        className="py-3 px-4 text-left font-body text-slate-light text-xs uppercase tracking-widest"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((sub) => (
                  <tr
                    key={sub.id}
                    className="border-b border-white/5 hover:bg-white/2 transition-colors"
                  >
                    <td className="py-3 px-4 font-body text-warm-white">
                      {sub.email}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-body font-bold text-xs px-2 py-1 rounded-full ${
                          sub.tier === "intel"
                            ? "bg-gold/20 text-gold"
                            : sub.tier === "pro"
                              ? "bg-teal/20 text-teal-light"
                              : "bg-white/10 text-slate-light"
                        }`}
                      >
                        {sub.tier}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-body text-slate-light text-xs">
                      {new Date(sub.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-gold/80">
                      {sub.referral_code}
                    </td>
                    <td className="py-3 px-4 font-body text-xs">
                      {sub.unsubscribed ? (
                        <span className="text-red-400">Unsubscribed</span>
                      ) : (
                        <span className="text-teal-light">Active</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
