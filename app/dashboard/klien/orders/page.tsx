"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";

type Order = {
  id: string;
  brief: string | null;
  price: number;
  status: string;
  created_at: string;
  services?: {
    title: string;
  } | null;
};

const statusLabel: Record<string, string> = {
  pending: "Menunggu Pembayaran",
  paid: "Sudah Dibayar",
  accepted: "Diterima Freelancer",
  rejected: "Ditolak",
  in_progress: "Dikerjakan",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

declare global {
  interface Window {
    snap: {
      pay: (token: string, options?: object) => void;
    };
  }
}

export default function KlienOrdersPage() {
  const supabase = createClient();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

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
      .select("*, services(title)")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data as Order[]);
    }
    setLoading(false);
  };

  const handlePay = async (orderId: string) => {
    setPayingId(orderId);

    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Gagal membuat pembayaran");
        setPayingId(null);
        return;
      }

      // Buka popup Midtrans Snap
      window.snap.pay(data.token, {
        onSuccess: async function () {
          // Update status order jadi paid
          await supabase
            .from("orders")
            .update({ status: "paid" })
            .eq("id", orderId);

          alert("Pembayaran berhasil!");
          fetchOrders();
        },
        onPending: function () {
          alert("Menunggu pembayaran...");
        },
        onError: function () {
          alert("Pembayaran gagal.");
        },
        onClose: function () {
          // User menutup popup tanpa bayar
        },
      });
    } catch {
      alert("Terjadi kesalahan.");
    }

    setPayingId(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Memuat...</p>
      </div>
    );
  }

  return (
    <>
      {/* Script Midtrans Snap */}
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />

      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Pesanan Saya</h1>

          {orders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              Belum ada pesanan.{" "}
              <Link href="/katalog" className="text-blue-600 hover:underline">
                Lihat katalog
              </Link>
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
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
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

                  {/* Tombol Bayar jika status masih pending */}
                  {order.status === "pending" && (
                    <button
                      onClick={() => handlePay(order.id)}
                      disabled={payingId === order.id}
                      className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                    >
                      {payingId === order.id ? "Memproses..." : "Bayar Sekarang"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-6">
            <Link
              href="/dashboard/klien"
              className="text-blue-600 hover:underline text-sm"
            >
              ← Kembali ke Dashboard
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}