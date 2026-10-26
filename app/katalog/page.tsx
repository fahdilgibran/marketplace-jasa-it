"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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

export default function KatalogPage() {
  const supabase = createClient();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    fetchServices();
  }, [category]);

  const fetchServices = async () => {
    setLoading(true);

    let query = supabase
      .from("services")
      .select("*, profiles(full_name)")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (!error && data) {
      setServices(data as Service[]);
    }
    setLoading(false);
  };

  // Filter di sisi client untuk pencarian
  const filteredServices = services.filter((s) => {
    const keyword = search.toLowerCase();
    return (
      s.title.toLowerCase().includes(keyword) ||
      (s.description && s.description.toLowerCase().includes(keyword)) ||
      (s.category && s.category.toLowerCase().includes(keyword))
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Katalog Jasa IT</h1>
          <div className="flex gap-3 text-sm">
            <Link href="/login" className="text-blue-600 hover:underline">
              Login
            </Link>
            <Link href="/register" className="text-blue-600 hover:underline">
              Daftar
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Cari jasa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Kategori</option>
            <option value="Website">Website</option>
            <option value="Desain">Desain</option>
            <option value="Programming">Programming</option>
            <option value="Mobile App">Mobile App</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>

        {/* Daftar Jasa */}
        {loading ? (
          <p className="text-center text-gray-500">Memuat...</p>
        ) : filteredServices.length === 0 ? (
          <p className="text-center text-gray-500">Tidak ada jasa ditemukan.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => (
              <Link
                key={service.id}
                href={`/katalog/${service.id}`}
                className="bg-white rounded-lg shadow p-5 hover:shadow-md transition"
              >
                <h2 className="font-semibold text-lg line-clamp-2">
                  {service.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {service.profiles?.full_name || "Freelancer"}
                </p>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {service.description || "-"}
                </p>
                <div className="mt-3 flex justify-between items-center text-sm">
                  <span className="font-medium text-green-600">
                    Rp {Number(service.price).toLocaleString("id-ID")}
                  </span>
                  <span className="text-gray-500">
                    {service.duration_days} hari
                  </span>
                </div>
                {service.category && (
                  <span className="inline-block mt-2 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                    {service.category}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}