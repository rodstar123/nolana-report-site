"use client";

interface Props {
  label: string;
  priceId: string;
  email: string;
}

export function UpgradeButton({ label, priceId, email }: Props) {
  const handleClick = async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId, email }),
    });
    const data = (await res.json()) as { url?: string };
    if (data.url) window.location.href = data.url;
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center bg-teal hover:bg-teal-light text-white font-body font-bold text-sm px-5 py-3 rounded-lg transition-colors duration-200 min-h-[44px]"
    >
      {label}
    </button>
  );
}
