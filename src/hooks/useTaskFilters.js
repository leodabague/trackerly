import { useState, useCallback, useEffect } from 'react';
import { useTaskContext } from '../contexts/TaskContext';

export const useTaskFilters = () => {
  const { tarefas, configuracoes } = useTaskContext();
  const [view, setView] = useState('diario');
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [weekStart, setWeekStart] = useState(getStartOfWeek(new Date()));
  const [monthStart, setMonthStart] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [forceUpdate, setForceUpdate] = useState(0);

  // Função para obter o primeiro dia da semana atual
  function getStartOfWeek(date) {
    const newDate = new Date(date);
    const day = newDate.getDay();
    const diff = newDate.getDate() - day + (day === 0 ? -6 : 1); // Ajuste para semana começando na segunda-feira
    return new Date(newDate.setDate(diff));
  }
  
  // Forçar atualização quando as tarefas mudarem
  useEffect(() => {
    // Só atualiza se houver tarefas para evitar re-renderizações desnecessárias no carregamento inicial
    if (tarefas.length > 0) {
      setForceUpdate(prev => prev + 1);
    }
  }, [tarefas]);

  const calcularHorasUsadas = useCallback(() => {
    let total = 0;
    
    // Verificar se há tarefas
    if (!tarefas || !Array.isArray(tarefas) || tarefas.length === 0) {
      return 0;
    }
    
    const hoje = new Date(dataSelecionada);
    hoje.setHours(0, 0, 0, 0);
    
    const inicioSemana = new Date(weekStart);
    inicioSemana.setHours(0, 0, 0, 0);
    
    const fimSemana = new Date(weekStart);
    fimSemana.setDate(fimSemana.getDate() + 6);
    fimSemana.setHours(23, 59, 59, 999);
    
    const inicioMes = new Date(monthStart);
    const fimMes = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const tarefasFiltradas = tarefas.filter(tarefa => {
      // Garantir que a tarefa tenha uma data válida
      if (!tarefa.data) {
        return false;
      }
      
      try {
        // Converter a data da tarefa para objeto Date
        const dataTarefa = new Date(tarefa.data);
        
        // Verificar se é uma data válida
        if (isNaN(dataTarefa.getTime())) {
          return false;
        }
        
        // Normalizar a data (remover as horas, minutos, segundos)
        dataTarefa.setHours(0, 0, 0, 0);
        
        if (view === 'diario') {
          return dataTarefa.getTime() === hoje.getTime();
        } else if (view === 'semanal') {
          return dataTarefa >= inicioSemana && dataTarefa <= fimSemana;
        } else if (view === 'mensal') {
          // Comparar apenas mês e ano para mais confiabilidade
          return dataTarefa.getMonth() === monthStart.getMonth() &&
                 dataTarefa.getFullYear() === monthStart.getFullYear();
        }
      } catch (error) {
        console.error('Erro ao processar data da tarefa em calcularHorasUsadas:', error, tarefa);
        return false;
      }
      
      return false;
    });
    
    total = tarefasFiltradas.reduce((acc, tarefa) => acc + tarefa.horasTotal, 0);
    return total;
  }, [dataSelecionada, weekStart, monthStart, tarefas, view, forceUpdate]);

  const getHorasDisponiveis = useCallback(() => {
    switch(view) {
      case 'diario':
        return configuracoes.horasDiarias;
      case 'semanal':
        return configuracoes.horasSemanais;
      case 'mensal':
        return configuracoes.horasMensais;
      default:
        return 1;
    }
  }, [configuracoes, view, forceUpdate]);

  const navegarData = (direcao) => {
    if (view === 'diario') {
      const novaData = new Date(dataSelecionada);
      novaData.setDate(novaData.getDate() + direcao);
      setDataSelecionada(novaData);
    } else if (view === 'semanal') {
      const novaData = new Date(weekStart);
      novaData.setDate(novaData.getDate() + (7 * direcao));
      setWeekStart(novaData);
    } else if (view === 'mensal') {
      const novaData = new Date(monthStart);
      novaData.setMonth(novaData.getMonth() + direcao);
      setMonthStart(novaData);
    }
  };

  const formatarPeriodo = () => {
    if (view === 'diario') {
      return dataSelecionada.toLocaleDateString('pt-BR');
    } else if (view === 'semanal') {
      const fimSemana = new Date(weekStart);
      fimSemana.setDate(fimSemana.getDate() + 6);
      return `${weekStart.toLocaleDateString('pt-BR')} - ${fimSemana.toLocaleDateString('pt-BR')}`;
    } else if (view === 'mensal') {
      return monthStart.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }
  };
  
  // Função para redefinir filtros para o período atual
  const resetFiltros = () => {
    const hoje = new Date();
    setDataSelecionada(hoje);
    setWeekStart(getStartOfWeek(hoje));
    setMonthStart(new Date(hoje.getFullYear(), hoje.getMonth(), 1));
    setForceUpdate(prev => prev + 1);
  };

  return {
    view,
    setView,
    dataSelecionada,
    weekStart,
    monthStart,
    horasUsadas: calcularHorasUsadas(),
    horasDisponiveis: getHorasDisponiveis(),
    navegarData,
    formatarPeriodo,
    resetFiltros
  };
}; 