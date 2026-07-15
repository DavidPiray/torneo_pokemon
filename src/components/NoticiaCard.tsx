export default function NoticiaCard({ titulo, fecha, resumen }: { titulo: string, fecha: string, resumen: string }) {
  return (
    <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl border border-white/10 hover:border-yellow-500 transition-all duration-300">
      <span className="text-yellow-500 text-sm font-bold uppercase">{fecha}</span>
      <h3 className="text-xl font-bold text-white mt-2 mb-3">{titulo}</h3>
      <p className="text-gray-400 text-sm">{resumen}</p>
    </div>
  )
}