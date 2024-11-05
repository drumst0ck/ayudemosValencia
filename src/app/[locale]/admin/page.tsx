import { LocationForm } from "@/components/LocationForm";

export default function AdminPage() {
  return (
    <main className="container mx-auto p-4">
      <div className="rounded-lg">
        <h2 className="mb-6 text-xl font-semibold">
          Agregar Nueva Localización
        </h2>
        <LocationForm />
      </div>
    </main>
  );
}
