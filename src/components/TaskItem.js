import React from 'react';
import { useTaskContext } from '../contexts/TaskContext';

const TaskItem = ({ tarefa, darkMode, onEdit, onDelete }) => {
  const { clusters } = useTaskContext();

  const clusterColors = {
    'Desenvolvimento': 'bg-blue-500',
    'Reuniões': 'bg-green-500',
    'Pesquisa': 'bg-purple-500',
    'Documentação': 'bg-yellow-500'
  };

  return (
    <div className={`flex items-center justify-between p-4 ${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow mb-4`}>
      <div className="flex-1">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {tarefa.nome}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {tarefa.data}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${clusterColors[tarefa.cluster]} bg-opacity-20 text-${clusterColors[tarefa.cluster].replace('bg-', '')}`}>
            {tarefa.cluster}
          </span>
          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {tarefa.horas}h {tarefa.minutos}m
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