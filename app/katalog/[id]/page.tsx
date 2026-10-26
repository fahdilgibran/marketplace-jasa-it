"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Service = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  duration_days: number;
  category: string | null;
  freelancer_id: string;
  profiles?: {
    full_name: string | null;
  } | null;
};

export default function DetailJasaPage() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*, profiles(full_name)")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      setService(null);
    } else {
      setService(data as Service);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Memuat...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Jasa tidak ditemukan.</p>
          <Link href="/katalog" className="text-blue-600 hover:underline mt-2 inline-block">
            ← Kembali ke Katalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/katalog" className="text-blue-600 hover:underline text-sm">
            ← Kembali ke Katalog
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold">{service.title}</h1>

          <p className="text-gray-500 mt-1">
            oleh {service.profiles?.full_name || "Freelancer"}
          </p>

          {service.category && (
            <span className="inline-block mt-3 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
              {service.category}
            </span>
          )}

          <div className="mt-6 border-t pt-6">
            <h2 className="font-semibold mb-2">Deskripsi</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {service.description || "Tidak ada deskripsi."}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded p-4">
              <p className="text-sm text-gray-500">Harga</p>
              <p className="text-xl font-bold text-green-600">
                Rp {Number(service.price).toLocaleString("id-ID")}
              </p>
            </div>
            <div className="bg-gray-50 rounded p-4">
              <p className="text-sm text-gray-500">Durasi</p>
              <p className="text-xl font-bold">{service.duration_days} hari</p>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => {
                // Nanti di W5 akan diarahkan ke order
                alert("Fitur pesan jasa akan tersedia di minggu berikutnya (W5).");
              }}
              className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 font-medium"
            >
              Pesan Jasa Ini
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}