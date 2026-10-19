"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardFreelancer() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center bg-white p-8 rounded-lg shadow max-w-md w-full">
        <h1 className="text-2xl font-bold">Dashboard Freelancer</h1>
        <p className="mt-2 text-gray-600">Selamat datang, Freelancer!</p>

        <div className="mt-6 space-y-3">
          <Link
            href="/dashboard/freelancer/services"
            className="block w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Kelola Jasa Saya
          </Link>

          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}