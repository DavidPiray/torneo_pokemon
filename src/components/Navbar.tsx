'use client'
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-yellow-400">
          Torneo 8 Maestros
        </Link>

        {/* Enlaces */}
        <div className="space-x-6 text-white font-medium">
          <Link href="/" className="hover:text-yellow-400">Inicio</Link>
          <Link href="/posiciones" className="hover:text-yellow-400">Posiciones</Link>
          <Link href="/entrenadores" className="hover:text-yellow-400">Entrenadores</Link>
        </div>

        {/* Botón Login */}
        <Link 
          href="/" 
          className="bg-indigo-600 px-4 py-2 rounded-full hover:bg-indigo-500 transition-colors"
        >
          Login
        </Link>
      </div>
    </nav>
  )
}