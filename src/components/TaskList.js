import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';

const TaskList = ({ darkMode, view, dataSelecionada, weekStart, monthStart }) => {
  const { tarefas, removerTarefa } = useTaskContext();
  const [showModal, setShowModal] = useState(false);
  const [tarefaEditando, setTarefaEditando] = useState(null);
  const [listaExpandida, setListaExpandida] = useState(false);
  const [tarefasFiltradas, setTarefasFiltradas] = useState([]);

  // Processar tarefas quando qualquer dependência mudar
  useEffect(() => {
    const novasTarefasFiltradas = filtrarTarefas();
    setTarefasFiltradas(novasTarefasFiltradas);
    console.log(`Tarefas filtradas na vista ${view}:`, novasTarefasFiltradas.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tarefas, view, dataSelecionada, weekStart, monthStart]);

  const filtrarTarefas = () => {
    // Verificar se há tarefas
    if (!tarefas || !Array.isArray(tarefas) || tarefas.length === 0) {
      return [];
    }
    
    // Debug: mostrar todas as tarefas disponíveis
    console.log('Todas as tarefas:', tarefas);
    
    return tarefas.filter(tarefa => {
      // Garantir que a tarefa tenha uma data válida
      if (!tarefa.data) {
        console.warn('Tarefa sem data encontrada:', tarefa);
        return false;
      }
      
      try {
        // Converter a data da tarefa para objeto Date
        const dataTarefa = new Date(tarefa.data);
        
        // Verificar se é uma data válida
        if (isNaN(dataTarefa.getTime())) {
          console.warn('Data inválida encontrada para tarefa:', tarefa);
          return false;
        }
        
        // Normalizar a data (remover as horas, minutos, segundos)
        dataTarefa.setHours(0, 0, 0, 0);
        
        if (view === 'diario') {
          const hoje = new Date(dataSelecionada);
          hoje.setHours(0, 0, 0, 0);
          const resultado = dataTarefa.getTime() === hoje.getTime();
          return resultado;
        } else if (view === 'semanal') {
          const inicioSemana = new Date(weekStart);
          inicioSemana.setHours(0, 0, 0, 0);
          const fimSemana = new Date(weekStart);
          fimSemana.setDate(fimSemana.getDate() + 6);
          fimSemana.setHours(23, 59, 59, 999);
          const resultado = dataTarefa >= inicioSemana && dataTarefa <= fimSemana;
          return resultado;
        } else if (view === 'mensal') {
          const inicioMes = new Date(monthStart);
          const fimMes = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59, 999);
          
          // Debug: mostrar comparações de datas para ajudar a diagnosticar problemas
          const dentroDoMes = dataTarefa >= inicioMes && dataTarefa <= fimMes;
          
          console.log('Comparação de datas para tarefa:', tarefa.nome);
          console.log('- Data da tarefa:', dataTarefa.toISOString());
          console.log('- Início do mês:', inicioMes.toISOString());
          console.log('- Fim do mês:', fimMes.toISOString());
          console.log('- Dentro do mês:', dentroDoMes);
          console.log('- Mês da tarefa:', dataTarefa.getMonth());
          console.log('- Mês selecionado:', monthStart.getMonth());
          
          // Alternativa: comparar apenas mês e ano
          const mesmoMesEAno = 
            dataTarefa.getMonth() === monthStart.getMonth() &&
            dataTarefa.getFullYear() === monthStart.getFullYear();
          
          console.log('- Mesmo mês e ano:', mesmoMesEAno);
          
          // Usar a verificação de mesmo mês e ano para mais confiabilidade
          return mesmoMesEAno;
        }
      } catch (error) {
        console.error('Erro ao processar data da tarefa:', error, tarefa);
        return false;
      }
      
      return false;
    }).sort((a, b) => {
      const dataA = new Date(a.data);
      const dataB = new Date(b.data);
      return dataB - dataA;
    });
  };

  const tarefasExibidas = listaExpandida ? tarefasFiltradas : tarefasFiltradas.slice(0, 5);

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 mb-8`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-lg font-medium ${darkMode ? 'text-gray-200' : ''}`}>
          Tarefas Registradas
        </h2>
        <button 
          onClick={() => setShowModal(true)}
          className="px-3 py-1 bg-blue-500 text-white rounded-md flex items-center gap-1"
        >
          <Plus size={16} />
          Adicionar
        </button>
      </div>
      
      {tarefasFiltradas.length === 0 ? (
        <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Nenhuma tarefa registrada para este período
        </div>
      ) : (
        <div className="space-y-2">
          {tarefasExibidas.map((tarefa) => (
            <TaskItem
              key={tarefa.id}
              tarefa={tarefa}
              darkMode={darkMode}
              onEdit={setTarefaEditando}
              onDelete={removerTarefa}
            />
          ))}
          
          {tarefasFiltradas.length > 5 && (
            <button
              onClick={() => setListaExpandida(!listaExpandida)}
              className={`w-full mt-4 px-4 py-2 text-sm font-medium rounded-md ${
                darkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {listaExpandida ? 'Ver menos' : 'Ver mais'}
            </button>
          )}
        </div>
      )}

      {/* Modal de Adicionar Tarefa */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <TaskForm onClose={() => setShowModal(false)} darkMode={darkMode} />
        </div>
      )}

      {/* Modal de Editar Tarefa */}
      {tarefaEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <TaskForm 
            onClose={() => setTarefaEditando(null)} 
            darkMode={darkMode}
            tarefaEditando={tarefaEditando}
          />
        </div>
      )}
    </div>
  );
};

export default TaskList; 