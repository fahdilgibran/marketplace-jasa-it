"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Service = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  duration_days: number;
  category: string | null;
  is_active: boolean;
};

export default function FreelancerServicesPage() {
  const supabase = createClient();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("freelancer_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setServices(data);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus jasa ini?")) return;

    const { error } = await supabase.from("services").delete().eq("id", id);

    if (!error) {
      setServices(services.filter((s) => s.id !== id));
    } else {
      alert("Gagal menghapus: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Memuat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Jasa Saya</h1>
          <Link
            href="/dashboard/freelancer/services/tambah"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Tambah Jasa
          </Link>
        </div>

        {services.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Belum ada jasa. Klik tombol &quot;Tambah Jasa&quot; untuk membuat.
          </div>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-lg shadow p-5 flex justify-between items-start"
              >
                <div>
                  <h2 className="text-lg font-semibold">{service.title}</h2>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                    {service.description || "-"}
                  </p>
                  <div className="mt-2 text-sm text-gray-500">
                    <span className="font-medium text-green-600">
                      Rp {service.price.toLocaleString("id-ID")}
                    </span>
                    {" · "}
                    {service.duration_days} hari
                    {service.category && ` · ${service.category}`}
                    {" · "}
                    <span
                      className={
                        service.is_active ? "text-green-600" : "text-red-500"
                      }
                    >
                      {service.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/freelancer/services/edit/${service.id}`}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <Link
            href="/dashboard/freelancer"
            className="text-blue-600 hover:underline text-sm"
          >
            ← Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}