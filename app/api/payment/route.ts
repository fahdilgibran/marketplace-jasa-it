import { NextRequest, NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "orderId required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: order, error } = await supabase
      .from("orders")
      .select("*, services(title)")
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
    }

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY!,
      clientKey: process.env.MIDTRANS_CLIENT_KEY!,
    });

    const parameter = {
      transaction_details: {
        order_id: order.id,
        gross_amount: Number(order.price),
      },
      item_details: [
        {
          id: order.service_id,
          price: Number(order.price),
          quantity: 1,
          name: order.services?.title || "Jasa IT",
        },
      ],
      customer_details: {
        first_name: "Klien",
      },
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Payment error";
    console.error(message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}