"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

interface NavBarProps {
  username: string;
  isAdmin: boolean;
}

export function NavBar({ username, isAdmin }: NavBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const links = [
    { href: "/", label: "Pronósticos" },
    { href: "/leaderboard", label: "Tabla" },
    { href: "/fixture", label: "Fixture" },
    { href: "/reglamento", label: "Reglamento" },
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <nav className="bg-green-800 text-white shadow-lg">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1 font-bold text-lg tracking-tight">
          <span>⚽</span>
          <span className="hidden sm:inline">Prode</span>
          <span className="text-yellow-300 hidden sm:inline"> Mundial 2026</span>
        </div>

        <div className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === l.href
                  ? "bg-green-600 text-white"
                  : "hover:bg-green-700 text-green-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-green-200 hidden sm:inline">
            {username}
          </span>
          <button
            onClick={logout}
            disabled={loading}
            className="px-3 py-1.5 bg-green-700 hover:bg-green-600 rounded-md text-sm transition-colors"
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
}
