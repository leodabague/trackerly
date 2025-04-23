import React from 'react';
import { useTaskContext } from '../contexts/TaskContext';

const TaskItem = ({ tarefa, darkMode, onEdit, onDelete }) => {
  const { clusters } = useTaskContext();

  // Lista predefinida de cores para clusters
  const defaultClusterColors = {
    'Desenvolvimento': 'bg-blue-500',
    'Reuniões': 'bg-green-500',
    'Pesquisa': 'bg-purple-500',
    'Documentação': 'bg-yellow-500'
  };

  // Cores alternativas para clusters personalizados
  const alternativeColors = [
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-cyan-500',
    'bg-amber-500',
    'bg-lime-500',
    'bg-teal-500',
    'bg-fuchsia-500'
  ];

  // Função para obter a cor do cluster, mesmo para clusters personalizados
  const getClusterColor = (clusterName) => {
    // Se o cluster estiver na lista predefinida, use a cor correspondente
    if (defaultClusterColors[clusterName]) {
      return defaultClusterColors[clusterName];
    }
    
    // Se não, gere uma cor com base no nome do cluster
    const clusterIndex = clusters.indexOf(clusterName);
    if (clusterIndex !== -1) {
      return alternativeColors[clusterIndex % alternativeColors.length];
    }
    
    // Fallback para uma cor padrão
    return 'bg-gray-500';
  };

  // Função para formatar a data no padrão DD/MM/YYYY
  const formatarData = (dataString) => {
    try {
      // Verificar se a string já está no formato DD/MM/YYYY
      if (typeof dataString === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dataString)) {
        return dataString; // Retornar a data como está
      }
      
      // Tentar interpretar a data corretamente
      let data;
      
      if (typeof dataString === 'string') {
        // Se for uma string de data no formato ISO ou outro formato
        // Verificar se parece com uma data no formato DD/MM/YYYY
        const parts = dataString.split('/');
        if (parts.length === 3) {
          // Assumir formato brasileiro DD/MM/YYYY
          const dia = parseInt(parts[0], 10);
          const mes = parseInt(parts[1], 10) - 1; // Meses em JS começam do 0
          const ano = parseInt(parts[2], 10);
          data = new Date(ano, mes, dia);
        } else {
          // Tentar converter normalmente
          data = new Date(dataString);
        }
      } else {
        // Se não for string, tentar converter diretamente
        data = new Date(dataString);
      }
      
      // Verificar se é uma data válida
      if (isNaN(data.getTime())) {
        console.warn("Data inválida:", dataString);
        return dataString;
      }
      
      // Formatar para o padrão brasileiro DD/MM/YYYY
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      return `${dia}/${mes}/${ano}`;
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return dataString;
    }
  };

  // Função para formatar a duração da tarefa
  const formatarDuracao = (tarefa) => {
    try {
      // Se a tarefa tem propriedades separadas de horas e minutos
      if (typeof tarefa.horas === 'number' && !isNaN(tarefa.horas)) {
        const horas = tarefa.horas;
        const minutos = typeof tarefa.minutos === 'number' && !isNaN(tarefa.minutos) ? tarefa.minutos : 0;
        return `${horas}h ${minutos}m`;
      } 
      // Se a tarefa tem apenas horasTotal (provavelmente importada)
      else if (typeof tarefa.horasTotal === 'number' && !isNaN(tarefa.horasTotal)) {
        const horasInteiras = Math.floor(tarefa.horasTotal);
        const minutos = Math.round((tarefa.horasTotal - horasInteiras) * 60);
        return `${horasInteiras}h ${minutos}m`;
      }
      // Fallback
      return "Duração desconhecida";
    } catch (error) {
      console.error("Erro ao formatar duração:", error);
      return "Erro na duração";
    }
  };

  // Obter a cor para o cluster da tarefa atual
  const clusterColor = getClusterColor(tarefa.cluster);

  return (
    <div className={`flex items-center justify-between p-4 ${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow mb-4`}>
      <div className="flex-1">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {tarefa.nome}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {formatarData(tarefa.data)}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${clusterColor} bg-opacity-20 text-${clusterColor.replace('bg-', '')}`}>
            {tarefa.cluster}
          </span>
          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {formatarDuracao(tarefa)}
          </span>
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(tarefa)}
          className={`p-2 ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(tarefa.id)}
          className={`p-2 ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TaskItem; 