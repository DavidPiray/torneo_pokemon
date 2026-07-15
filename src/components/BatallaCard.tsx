export default function BatallaCard({ ent1, ent2, ganador }: { ent1: string, ent2: string, ganador: string }) {
  return (
    <div className="glassmorphism p-4 rounded-lg border-l-4 border-cyan-500 flex items-center justify-between hover:bg-gray-800 transition-all">
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-400">
          <p className="font-bold text-white">{ent1}</p>
          <p>vs</p>
          <p className="font-bold text-white">{ent2}</p>
        </div>
      </div>
      
      <div className="text-right">
        <p className="text-xs text-cyan-400 uppercase tracking-widest">Ganador</p>
        <p className="text-lg font-bold text-white">{ganador}</p>
      </div>
    </div>
  )
}