import { useState, useCallback } from 'react';
import { useTaskContext } from '../contexts/TaskContext';

export const useTaskFilters = () => {
  const { tarefas, configuracoes } = useTaskContext();
  const [view, setView] = useState('diario');
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [weekStart, setWeekStart] = useState(new Date());
  const [monthStart, setMonthStart] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  const calcularHorasUsadas = useCallback(() => {
    let total = 0;
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
      const dataTarefa = new Date(tarefa.data);
      dataTarefa.setHours(0, 0, 0, 0);
      
      if (view === 'diario') {
        return dataTarefa.getTime() === hoje.getTime();
      } else if (view === 'semanal') {
        return dataTarefa >= inicioSemana && dataTarefa <= fimSemana;
      } else if (view === 'mensal') {
        return dataTarefa >= inicioMes && dataTarefa <= fimMes;
      }
      return false;
    });
    
    total = tarefasFiltradas.reduce((acc, tarefa) => acc + tarefa.horasTotal, 0);
    return total;
  }, [dataSelecionada, weekStart, monthStart, tarefas, view]);

  const getHorasDisponiveis = () => {
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
  };

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

  return {
    view,
    setView,
    dataSelecionada,
    weekStart,
    monthStart,
    horasUsadas: calcularHorasUsadas(),
    horasDisponiveis: getHorasDisponiveis(),
    navegarData,
    formatarPeriodo
  };
}; 