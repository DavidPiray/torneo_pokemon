"use client";

export default function PosicionesPage() {
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center p-6 pt-24 text-white">
      {/* Fondo compartido con la landing */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/background.jpg')" }}
      />
      <div className="fixed inset-0 z-0 bg-black/70" />

      <div className="relative z-10 w-full max-w-4xl space-y-6">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 border-l-4 border-yellow-500 pl-4 uppercase">
          Noticias
        </h1>
        <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-xl">
          <p className="text-gray-400 font-mono">
            Cargando noticias nuevas del Torneo 8 Maestros...
          </p>
        </div>
      </div>
    </main>
  );
}
