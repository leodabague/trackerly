import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TaskFilters = ({ view, setView, formatarPeriodo, navegarData }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-card p-4 rounded-lg shadow-sm gap-4">
      <div className="flex gap-2 w-full sm:w-auto justify-center">
        <button 
          onClick={() => setView('diario')} 
          className={`px-3 py-1 rounded ${view === 'diario' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-secondary text-secondary-foreground'}`}
        >
          Diário
        </button>
        <button 
          onClick={() => setView('semanal')} 
          className={`px-3 py-1 rounded ${view === 'semanal' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-secondary text-secondary-foreground'}`}
        >
          Semanal
        </button>
        <button 
          onClick={() => setView('mensal')} 
          className={`px-3 py-1 rounded ${view === 'mensal' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-secondary text-secondary-foreground'}`}
        >
          Mensal
        </button>
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
        <button 
          onClick={() => navegarData(-1)} 
          className="p-1 rounded hover:bg-accent"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="font-medium min-w-[120px] text-center">{formatarPeriodo()}</span>
        <button 
          onClick={() => navegarData(1)} 
          className="p-1 rounded hover:bg-accent"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default TaskFilters;