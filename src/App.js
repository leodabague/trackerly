import React from 'react';
import { TaskProvider } from './contexts/TaskContext';
import { useTheme } from './hooks/useTheme';
import { useTaskFilters } from './hooks/useTaskFilters';
import Header from './components/Header';
import TaskFilters from './components/TaskFilters';
import TaskStats from './components/TaskStats';
import TaskList from './components/TaskList';
import ActionButtons from './components/ActionButtons';

const AppContent = () => {
  const { darkMode, alternarTema } = useTheme();
  const {
    view,
    setView,
    dataSelecionada,
    weekStart,
    monthStart,
    horasUsadas,
    horasDisponiveis,
    navegarData,
    formatarPeriodo,
    resetFiltros
  } = useTaskFilters();

  return (
    <>
      <div className={`fixed inset-0 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`} />
      <div className={`relative max-w-4xl mx-auto p-4 min-h-screen transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
        <Header darkMode={darkMode} alternarTema={alternarTema} />
        
        <TaskFilters
          darkMode={darkMode}
          view={view}
          setView={setView}
          formatarPeriodo={formatarPeriodo}
          navegarData={navegarData}
        />
        
        <TaskStats
          darkMode={darkMode}
          horasUsadas={horasUsadas}
          horasDisponiveis={horasDisponiveis}
          view={view}
          dataSelecionada={dataSelecionada}
          weekStart={weekStart}
          monthStart={monthStart}
        />
        
        <ActionButtons 
          darkMode={darkMode} 
          resetFiltros={resetFiltros}
        />
        
        <TaskList
          darkMode={darkMode}
          view={view}
          dataSelecionada={dataSelecionada}
          weekStart={weekStart}
          monthStart={monthStart}
        />
      </div>
    </>
  );
};

const App = () => {
  return (
    <TaskProvider>
      <AppContent />
    </TaskProvider>
  );
};

export default App;