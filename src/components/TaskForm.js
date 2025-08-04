import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';

const TaskForm = ({ onClose, darkMode, tarefaEditando }) => {
  const { adicionarTarefa, editarTarefa, clusters } = useTaskContext();
  const nomeInputRef = useRef(null);
  const [novaTarefa, setNovaTarefa] = useState({
    nome: '',
    data: new Date().toISOString().split('T')[0],
    horas: 1,
    minutos: 0,
    cluster: 'Desenvolvimento'
  });

  // Efeito para focar automaticamente no campo nome quando o modal abrir
  useEffect(() => {
    // Pequeno delay para garantir que o modal esteja totalmente renderizado
    const timer = setTimeout(() => {
      if (nomeInputRef.current) {
        nomeInputRef.current.focus();
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Efeito para carregar dados da tarefa sendo editada
  useEffect(() => {
    if (tarefaEditando) {
      // Converter a data do formato DD/MM/YYYY para YYYY-MM-DD para o input date
      let dataFormatada = tarefaEditando.data;
      if (typeof tarefaEditando.data === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(tarefaEditando.data)) {
        const [dia, mes, ano] = tarefaEditando.data.split('/');
        dataFormatada = `${ano}-${mes}-${dia}`;
      }

      setNovaTarefa({
        ...tarefaEditando,
        data: dataFormatada
      });
    }
  }, [tarefaEditando]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Calcular o horasTotal
    const horasTotal = novaTarefa.horas + (novaTarefa.minutos / 60);
    
    // Se estiver editando uma tarefa existente
    if (tarefaEditando) {
      editarTarefa({
        ...novaTarefa,
        horasTotal
      });
    } else {
      // Se estiver adicionando uma nova tarefa
      adicionarTarefa({
        ...novaTarefa,
        horasTotal
      });
    }
    
    onClose();
  };

  const ajustarHoras = (delta) => {
    const novoValor = Math.max(0, novaTarefa.horas + delta);
    setNovaTarefa({ ...novaTarefa, horas: novoValor });
  };

  const ajustarMinutos = (delta) => {
    let novoValor = novaTarefa.minutos + delta;
    if (novoValor < 0) novoValor = 0;
    if (novoValor > 59) novoValor = 59;
    setNovaTarefa({ ...novaTarefa, minutos: novoValor });
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          {tarefaEditando ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}
        </h3>
        <button 
          onClick={onClose} 
          className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Nome da Tarefa
          </label>
          <input
            ref={nomeInputRef}
            type="text"
            value={novaTarefa.nome}
            onChange={(e) => setNovaTarefa({...novaTarefa, nome: e.target.value})}
            className={`w-full p-2 border rounded-md ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            }`}
            placeholder="Ex: Reunião com cliente"
            required
          />
        </div>
        
        <div>
          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Data
          </label>
          <input
            type="date"
            value={novaTarefa.data}
            onChange={(e) => setNovaTarefa({...novaTarefa, data: e.target.value})}
            className={`w-full p-2 border rounded-md ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-100' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Horas
            </label>
            <input
              type="number"
              min="0"
              value={novaTarefa.horas}
              onChange={(e) => setNovaTarefa({...novaTarefa, horas: parseInt(e.target.value) || 0})}
              className={`w-full p-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              required
            />
            <div className="flex justify-between mt-2 gap-2">
              <button
                type="button"
                onClick={() => ajustarHoras(-1)}
                className={`flex-1 py-1 px-2 rounded-md text-sm transition-colors duration-200 ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                -1h
              </button>
              <button
                type="button"
                onClick={() => ajustarHoras(1)}
                className={`flex-1 py-1 px-2 rounded-md text-sm transition-colors duration-200 ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                +1h
              </button>
            </div>
          </div>
          
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Minutos
            </label>
            <input
              type="number"
              min="0"
              max="59"
              value={novaTarefa.minutos}
              onChange={(e) => setNovaTarefa({...novaTarefa, minutos: parseInt(e.target.value) || 0})}
              className={`w-full p-2 border rounded-md ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-100' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              required
            />
            <div className="flex justify-between mt-2 gap-2">
              <button
                type="button"
                onClick={() => ajustarMinutos(10)}
                className={`flex-1 py-1 px-2 rounded-md text-sm transition-colors duration-200 ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                +10m
              </button>
              <button
                type="button"
                onClick={() => ajustarMinutos(20)}
                className={`flex-1 py-1 px-2 rounded-md text-sm transition-colors duration-200 ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                +20m
              </button>
              <button
                type="button"
                onClick={() => ajustarMinutos(30)}
                className={`flex-1 py-1 px-2 rounded-md text-sm transition-colors duration-200 ${
                  darkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                +30m
              </button>
            </div>
          </div>
        </div>
        
        <div>
          <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
            Cluster
          </label>
          <select
            value={novaTarefa.cluster}
            onChange={(e) => setNovaTarefa({...novaTarefa, cluster: e.target.value})}
            className={`w-full p-2 border rounded-md ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-100' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
            required
          >
            {clusters.map(cluster => (
              <option key={cluster} value={cluster}>{cluster}</option>
            ))}
          </select>
        </div>
        
        <button
          type="submit"
          className={`w-full py-2 rounded-md transition-colors duration-200 ${
            darkMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {tarefaEditando ? 'Salvar Alterações' : 'Adicionar Tarefa'}
        </button>
      </form>
    </div>
  );
};

export default TaskForm; 