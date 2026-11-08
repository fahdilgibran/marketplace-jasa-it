"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Service = {
  id: string;
  title: string;
  price: number;
  duration_days: number;
  freelancer_id: string;
  profiles?: {
    full_name: string | null;
  } | null;
};

export default function OrderPage() {
  const supabase = createClient();
  const params = useParams();
  const router = useRouter();
  const serviceId = params.serviceId as string;

  const [service, setService] = useState<Service | null>(null);
  const [brief, setBrief] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    checkUserAndFetchService();
  }, [serviceId]);

  const checkUserAndFetchService = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      // Belum login → arahkan ke login, lalu kembali ke sini
      router.push(`/login?redirect=/order/${serviceId}`);
      return;
    }

    // Cek role harus klien
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "klien") {
      alert("Hanya klien yang bisa memesan jasa.");
      router.push("/katalog");
      return;
    }

    // Ambil data jasa
    const { data, error } = await supabase
      .from("services")
      .select("*, profiles(full_name)")
      .eq("id", serviceId)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      setService(null);
    } else {
      setService(data as Service);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !service) return;

    const { error } = await supabase.from("orders").insert({
      service_id: service.id,
      client_id: user.id,
      freelancer_id: service.freelancer_id,
      brief: brief,
      price: service.price,
      status: "pending",
    });

    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }

    alert("Pesanan berhasil dikirim! Menunggu konfirmasi freelancer.");
    router.push("/dashboard/klien/orders");
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold mb-2">Pesan Jasa</h1>
        <p className="text-gray-600 mb-6">{service.title}</p>

        <div className="bg-gray-50 rounded p-4 mb-6 text-sm">
          <p>
            <span className="text-gray-500">Freelancer:</span>{" "}
            {service.profiles?.full_name || "-"}
          </p>
          <p className="mt-1">
            <span className="text-gray-500">Harga:</span>{" "}
            <span className="font-medium text-green-600">
              Rp {Number(service.price).toLocaleString("id-ID")}
            </span>
          </p>
          <p className="mt-1">
            <span className="text-gray-500">Durasi:</span> {service.duration_days} hari
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Brief / Requirement
            </label>
            <textarea
              required
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={5}
              placeholder="Jelaskan kebutuhan kamu, contoh: ingin website company profile 5 halaman, warna biru, dll..."
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
          >
            {submitting ? "Mengirim..." : "Kirim Pesanan"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href={`/katalog/${service.id}`}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Kembali ke Detail Jasa
          </Link>
        </div>
      </div>
    </div>
  );
}