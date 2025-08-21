import { useState, useMemo } from 'react';
import { useTaskContext } from '../contexts/TaskContext';

export const useAutocomplete = (maxSuggestions = 5) => {
  const { tarefas } = useTaskContext();
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Extrair nomes únicos das tarefas existentes e calcular frequência
  const taskNames = useMemo(() => {
    const nameCount = {};
    
    tarefas.forEach(tarefa => {
      if (tarefa.nome && tarefa.nome.trim()) {
        const nome = tarefa.nome.trim();
        nameCount[nome] = (nameCount[nome] || 0) + 1;
      }
    });

    // Ordenar por frequência (mais usados primeiro) e depois alfabeticamente
    return Object.entries(nameCount)
      .sort((a, b) => {
        if (b[1] !== a[1]) {
          return b[1] - a[1]; // Por frequência (decrescente)
        }
        return a[0].localeCompare(b[0]); // Por ordem alfabética
      })
      .map(([nome]) => nome);
  }, [tarefas]);

  // Filtrar sugestões baseadas no input atual
  const suggestions = useMemo(() => {
    if (!inputValue.trim() || inputValue.length < 2) {
      return [];
    }

    const searchTerm = inputValue.toLowerCase().trim();
    
    return taskNames
      .filter(nome => 
        nome.toLowerCase().includes(searchTerm) && 
        nome.toLowerCase() !== searchTerm
      )
      .slice(0, maxSuggestions);
  }, [inputValue, taskNames, maxSuggestions]);

  const handleInputChange = (value) => {
    setInputValue(value);
    setShowSuggestions(value.length >= 2);
  };

  const selectSuggestion = (suggestion) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
  };

  const hideSuggestions = () => {
    setShowSuggestions(false);
  };

  const showSuggestionsIfHasInput = () => {
    if (inputValue.length >= 2) {
      setShowSuggestions(true);
    }
  };

  return {
    inputValue,
    setInputValue,
    suggestions,
    showSuggestions,
    handleInputChange,
    selectSuggestion,
    hideSuggestions,
    showSuggestionsIfHasInput
  };
};