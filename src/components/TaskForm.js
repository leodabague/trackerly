import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';
import { useAutocomplete } from '../hooks/useAutocomplete';
import AutocompleteInput from './AutocompleteInput';

const TaskForm = ({ onClose, tarefaEditando }) => {
  const { adicionarTarefa, editarTarefa, clusters } = useTaskContext();
  const nomeInputRef = useRef(null);
  const [novaTarefa, setNovaTarefa] = useState({
    nome: '',
    data: new Date().toISOString().split('T')[0],
    horas: 1,
    minutos: 0,
    cluster: 'Desenvolvimento'
  });

  // Hook de autocomplete para nomes de tarefas
  const {
    inputValue: nomeAutocomplete,
    setInputValue: setNomeAutocomplete,
    suggestions,
    showSuggestions,
    handleInputChange,
    selectSuggestion,
    hideSuggestions,
    showSuggestionsIfHasInput
  } = useAutocomplete();

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
      
      // Sincronizar autocomplete com o nome da tarefa sendo editada
      setNomeAutocomplete(tarefaEditando.nome || '');
    } else {
      // Limpar autocomplete quando não estiver editando
      setNomeAutocomplete('');
    }
  }, [tarefaEditando, setNomeAutocomplete]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Calcular o horasTotal
    const horasTotal = novaTarefa.horas + (novaTarefa.minutos / 60);
    
    // Usar o nome do autocomplete
    const tarefaParaSalvar = {
      ...novaTarefa,
      nome: nomeAutocomplete,
      horasTotal
    };
    
    // Se estiver editando uma tarefa existente
    if (tarefaEditando) {
      editarTarefa(tarefaParaSalvar);
    } else {
      // Se estiver adicionando uma nova tarefa
      adicionarTarefa(tarefaParaSalvar);
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
    <div className="bg-card rounded-lg p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-foreground">
          {tarefaEditando ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}
        </h3>
        <button 
          onClick={onClose} 
          className="text-muted-foreground hover:text-foreground"
        >
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Nome da Tarefa
          </label>
          <AutocompleteInput
            value={nomeAutocomplete}
            onChange={(value) => {
              handleInputChange(value);
              setNovaTarefa({...novaTarefa, nome: value});
            }}
            onSelect={(suggestion) => {
              selectSuggestion(suggestion);
              setNovaTarefa({...novaTarefa, nome: suggestion});
            }}
            onFocus={showSuggestionsIfHasInput}
            onBlur={hideSuggestions}
            suggestions={suggestions}
            showSuggestions={showSuggestions}
            placeholder="Ex: Reunião com cliente"
            className="w-full p-2 border rounded-md bg-input text-foreground placeholder-muted-foreground"
            required
            autoFocus
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Data
          </label>
          <input
            type="date"
            value={novaTarefa.data}
            onChange={(e) => setNovaTarefa({...novaTarefa, data: e.target.value})}
            className="w-full p-2 border rounded-md bg-input text-foreground"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Horas
            </label>
            <input
              type="number"
              min="0"
              value={novaTarefa.horas}
              onChange={(e) => setNovaTarefa({...novaTarefa, horas: parseInt(e.target.value) || 0})}
              className="w-full p-2 border rounded-md bg-input text-foreground"
              required
            />
            <div className="flex justify-between mt-2 gap-2">
              <button
                type="button"
                onClick={() => ajustarHoras(-1)}
                className="flex-1 py-1 px-2 rounded-md text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                -1h
              </button>
              <button
                type="button"
                onClick={() => ajustarHoras(1)}
                className="flex-1 py-1 px-2 rounded-md text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                +1h
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Minutos
            </label>
            <input
              type="number"
              min="0"
              max="59"
              value={novaTarefa.minutos}
              onChange={(e) => setNovaTarefa({...novaTarefa, minutos: parseInt(e.target.value) || 0})}
              className="w-full p-2 border rounded-md bg-input text-foreground"
              required
            />
            <div className="flex justify-between mt-2 gap-2">
              <button
                type="button"
                onClick={() => ajustarMinutos(10)}
                className="flex-1 py-1 px-2 rounded-md text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                +10m
              </button>
              <button
                type="button"
                onClick={() => ajustarMinutos(20)}
                className="flex-1 py-1 px-2 rounded-md text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                +20m
              </button>
              <button
                type="button"
                onClick={() => ajustarMinutos(30)}
                className="flex-1 py-1 px-2 rounded-md text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                +30m
              </button>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">
            Cluster
          </label>
          <select
            value={novaTarefa.cluster}
            onChange={(e) => setNovaTarefa({...novaTarefa, cluster: e.target.value})}
            className="w-full p-2 border rounded-md bg-input text-foreground"
            required
          >
            {clusters.map(cluster => (
              <option key={cluster} value={cluster}>{cluster}</option>
            ))}
          </select>
        </div>
        
        <button
          type="submit"
          className="w-full py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {tarefaEditando ? 'Salvar Alterações' : 'Adicionar Tarefa'}
        </button>
      </form>
    </div>
  );
};

export default TaskForm;