import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <h1 className="text-3xl font-bold mb-2">Marketplace Jasa IT</h1>
        <p className="text-gray-600 mb-8">
          Temukan jasa IT dari mahasiswa, atau tawarkan skill kamu.
        </p>

        <div className="space-y-3">
          <Link
            href="/katalog"
            className="block w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700"
          >
            Lihat Katalog Jasa
          </Link>
          <Link
            href="/login"
            className="block w-full border border-blue-600 text-blue-600 py-3 rounded hover:bg-blue-50"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="block w-full text-gray-600 py-2 text-sm hover:underline"
          >
            Belum punya akun? Daftar
          </Link>
        </div>
      </div>
    </div>
  );
}