import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TaskFilters = ({ darkMode, view, setView, formatarPeriodo, navegarData }) => {
  return (
    <div className={`flex flex-col sm:flex-row justify-between items-center mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-sm gap-4`}>
      <div className="flex gap-2 w-full sm:w-auto justify-center">
        <button 
          onClick={() => setView('diario')} 
          className={`px-3 py-1 rounded ${view === 'diario' 
            ? 'bg-blue-500 text-white' 
            : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
        >
          Diário
        </button>
        <button 
          onClick={() => setView('semanal')} 
          className={`px-3 py-1 rounded ${view === 'semanal' 
            ? 'bg-blue-500 text-white' 
            : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
        >
          Semanal
        </button>
        <button 
          onClick={() => setView('mensal')} 
          className={`px-3 py-1 rounded ${view === 'mensal' 
            ? 'bg-blue-500 text-white' 
            : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
        >
          Mensal
        </button>
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
        <button 
          onClick={() => navegarData(-1)} 
          className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
        >
          <ChevronLeft size={20} />
        </button>
        <span className="font-medium min-w-[120px] text-center">{formatarPeriodo()}</span>
        <button 
          onClick={() => navegarData(1)} 
          className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default TaskFilters; 