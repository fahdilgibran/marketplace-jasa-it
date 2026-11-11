"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Order = {
  id: string;
  brief: string | null;
  price: number;
  status: string;
  created_at: string;
  services?: {
    title: string;
  } | null;
  profiles?: {
    full_name: string | null;
  } | null;
};

const statusLabel: Record<string, string> = {
  pending: "Menunggu Pembayaran",
  paid: "Sudah Dibayar",
  accepted: "Diterima",
  rejected: "Ditolak",
  in_progress: "Dikerjakan",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export default function FreelancerOrdersPage() {
  const supabase = createClient();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*, services(title), profiles!orders_client_id_fkey(full_name)")
      .eq("freelancer_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data as Order[]);
    }
    setLoading(false);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (!error) {
      setOrders(
        orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } else {
      alert("Gagal update status: " + error.message);
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
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Pesanan Masuk</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Belum ada pesanan masuk.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-semibold">
                      {order.services?.title || "Jasa"}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      dari {order.profiles?.full_name || "Klien"}
                    </p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {order.brief || "-"}
                    </p>
                    <p className="text-sm text-green-600 font-medium mt-2">
                      Rp {Number(order.price).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {statusLabel[order.status] || order.status}
                  </span>
                </div>

                {/* Tombol aksi berdasarkan status */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {order.status === "paid" && (
                    <>
                      <button
                        onClick={() => updateStatus(order.id, "accepted")}
                        className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Terima
                      </button>
                      <button
                        onClick={() => updateStatus(order.id, "rejected")}
                        className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Tolak
                      </button>
                    </>
                  )}
                  {order.status === "accepted" && (
                    <button
                      onClick={() => updateStatus(order.id, "in_progress")}
                      className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Mulai Kerjakan
                    </button>
                  )}
                  {order.status === "in_progress" && (
                    <button
                      onClick={() => updateStatus(order.id, "completed")}
                      className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Tandai Selesai
                    </button>
                  )}
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