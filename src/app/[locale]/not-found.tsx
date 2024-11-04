import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-gray-700">
          Página no encontrada
        </h2>
        <p className="mb-8 text-gray-600">
          Lo sentimos, la página que buscas no existe.
        </p>
        <Link
          href="/"
          className="rounded-lg bg-teal-500 px-4 py-2 text-white transition hover:bg-teal-600"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
} 