'use client';

import { useState, useEffect, useMemo } from 'react';

interface Enfermedad {
  enfermedad: string;
  conteo: number;
}

export default function Home() {
  const [enfermedades, setEnfermedades] = useState<Enfermedad[]>([]);
  const [seleccionadas, setSeleccionadas] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    // Cargar el CSV
    fetch('/data/enfermedades_conteo.csv')
      .then(res => res.text())
      .then(data => {
        const lineas = data.split('\n').slice(1); // Saltar encabezado
        const parsed = lineas
          .filter(linea => linea.trim())
          .map(linea => {
            const [enfermedad, conteo] = linea.split(',');
            return {
              enfermedad: enfermedad.trim(),
              conteo: parseInt(conteo.trim())
            };
          });
        setEnfermedades(parsed);
      });
  }, []);

  const enfermedadesFiltradas = useMemo(() => {
    return enfermedades.filter(e => 
      e.enfermedad.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [enfermedades, busqueda]);

  const toggleSeleccion = (nombre: string) => {
    setSeleccionadas(prev => 
      prev.includes(nombre)
        ? prev.filter(n => n !== nombre)
        : [...prev, nombre]
    );
  };

  const descargarCSV = () => {
    const seleccionadasData = enfermedades.filter(e => 
      seleccionadas.includes(e.enfermedad)
    );
    
    const csv = 'enfermedad,conteo\n' + 
      seleccionadasData.map(e => `${e.enfermedad},${e.conteo}`).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'enfermedades_seleccionadas.csv';
    link.click();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Selector de Enfermedades
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Selecciona las enfermedades que deseas incluir en tu exportación
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="🔍 Buscar enfermedad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full px-6 py-4 text-lg rounded-2xl border-2 border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-lg transition-all"
          />
        </div>

        {/* Contador y botón de descarga */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <p className="text-sm text-gray-600 dark:text-gray-400">Enfermedades seleccionadas</p>
            <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {seleccionadas.length}
            </p>
          </div>
          <button
            onClick={descargarCSV}
            disabled={seleccionadas.length === 0}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            📥 Descargar CSV ({seleccionadas.length})
          </button>
        </div>

        {/* Grid de dos columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de todas las enfermedades */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Todas las Enfermedades
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {enfermedadesFiltradas.length} de {enfermedades.length} enfermedades
            </p>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-gray-200 dark:scrollbar-track-gray-700">
              {enfermedadesFiltradas.map((e) => (
                <button
                  key={e.enfermedad}
                  onClick={() => toggleSeleccion(e.enfermedad)}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    seleccionadas.includes(e.enfermedad)
                      ? 'bg-indigo-100 dark:bg-indigo-900 border-2 border-indigo-500 text-indigo-800 dark:text-indigo-200 font-medium'
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-transparent text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{e.enfermedad}</span>
                    {seleccionadas.includes(e.enfermedad) && (
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">✓</span>
                    )}
                  </div>
                </button>
              ))}
              {enfermedadesFiltradas.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No se encontraron enfermedades
                </p>
              )}
            </div>
          </div>

          {/* Lista de seleccionadas */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
              Seleccionadas
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {seleccionadas.length} enfermedad{seleccionadas.length !== 1 ? 'es' : ''}
            </p>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-gray-200 dark:scrollbar-track-gray-700">
              {seleccionadas.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-gray-500 dark:text-gray-400">
                    No has seleccionado ninguna enfermedad
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Haz clic en una enfermedad de la lista de la izquierda
                  </p>
                </div>
              ) : (
                seleccionadas.map((nombre) => {
                  const enfermedad = enfermedades.find(e => e.enfermedad === nombre);
                  return (
                    <div
                      key={nombre}
                      className="flex items-center justify-between px-4 py-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border-2 border-indigo-200 dark:border-indigo-700"
                    >
                      <span className="text-gray-800 dark:text-gray-200 flex-1">
                        {nombre}
                      </span>
                      <span className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold mr-3">
                        ({enfermedad?.conteo})
                      </span>
                      <button
                        onClick={() => toggleSeleccion(nombre)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-bold text-xl transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
