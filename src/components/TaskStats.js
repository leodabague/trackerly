import React, { useState, useEffect } from 'react';
import { Clock, ChevronDown } from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';

const TaskStats = ({ darkMode, horasUsadas, horasDisponiveis, view, dataSelecionada, weekStart, monthStart }) => {
  const { tarefas, clusters } = useTaskContext();
  const [mostrarProjecao, setMostrarProjecao] = useState(false);
  const [dadosGrafico, setDadosGrafico] = useState({});
  const [maxValor, setMaxValor] = useState(0.1);
  const [projecao, setProjecao] = useState(null);

  useEffect(() => {
    atualizarDados();
  }, [tarefas, clusters, view, horasUsadas, horasDisponiveis, dataSelecionada, weekStart, monthStart]);

  const atualizarDados = () => {
    const dadosPorCluster = calcularDadosGrafico();
    setDadosGrafico(dadosPorCluster);
    setMaxValor(Math.max(...Object.values(dadosPorCluster), 0.1));
    setProjecao(calcularProjecaoLinear());
  };

  // Função para filtrar tarefas de acordo com o período selecionado
  const filtrarTarefasPorPeriodo = () => {
    if (!tarefas || !Array.isArray(tarefas) || tarefas.length === 0) {
      return [];
    }
    
    return tarefas.filter(tarefa => {
      if (!tarefa.data) return false;
      
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
          const hoje = new Date(dataSelecionada);
          hoje.setHours(0, 0, 0, 0);
          return dataTarefa.getTime() === hoje.getTime();
        } else if (view === 'semanal') {
          const inicioSemana = new Date(weekStart);
          inicioSemana.setHours(0, 0, 0, 0);
          const fimSemana = new Date(weekStart);
          fimSemana.setDate(fimSemana.getDate() + 6);
          fimSemana.setHours(23, 59, 59, 999);
          return dataTarefa >= inicioSemana && dataTarefa <= fimSemana;
        } else if (view === 'mensal') {
          // Comparar apenas mês e ano para mais confiabilidade
          return dataTarefa.getMonth() === monthStart.getMonth() &&
                 dataTarefa.getFullYear() === monthStart.getFullYear();
        }
      } catch (error) {
        console.error('Erro ao processar data da tarefa em filtrarTarefasPorPeriodo:', error, tarefa);
        return false;
      }
      
      return false;
    });
  };

  const calcularDadosGrafico = () => {
    const dadosPorCluster = {};
    
    // Inicializar todos os clusters com zero horas
    clusters.forEach(cluster => {
      dadosPorCluster[cluster] = 0;
    });
    
    // Filtrar tarefas pelo período selecionado
    const tarefasFiltradas = filtrarTarefasPorPeriodo();
    
    if (tarefasFiltradas.length === 0) {
      return dadosPorCluster;
    }
    
    // Calcular horas por cluster apenas para as tarefas do período
    tarefasFiltradas.forEach(tarefa => {
      // Verificar se é um cluster válido
      if (tarefa.cluster && dadosPorCluster.hasOwnProperty(tarefa.cluster)) {
        if (typeof tarefa.horasTotal === 'number' && !isNaN(tarefa.horasTotal)) {
          dadosPorCluster[tarefa.cluster] += tarefa.horasTotal;
        } else if (typeof tarefa.horas === 'number' && !isNaN(tarefa.horas)) {
          // Fallback para tarefas sem horasTotal
          const minutos = typeof tarefa.minutos === 'number' && !isNaN(tarefa.minutos) ? tarefa.minutos : 0;
          dadosPorCluster[tarefa.cluster] += tarefa.horas + (minutos / 60);
        }
      } else if (tarefa.cluster) {
        // Cluster existe mas não está na lista (possível em dados importados)
        console.warn('Tarefa com cluster não reconhecido:', tarefa.cluster, tarefa);
      } else {
        console.warn('Tarefa sem cluster:', tarefa);
      }
    });
    
    return dadosPorCluster;
  };

  const calcularProjecaoLinear = () => {
    if (view !== 'mensal') return null;

    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    const diasPassados = hoje.getDate();
    const diasNoMes = ultimoDiaMes.getDate();
    
    const horasPorDia = horasDisponiveis / diasNoMes;
    const projecaoAtual = horasPorDia * diasPassados;
    const projecaoFinal = horasDisponiveis;
    
    return {
      atual: projecaoAtual.toFixed(1),
      final: projecaoFinal.toFixed(1),
      percentual: ((diasPassados / diasNoMes) * 100).toFixed(1)
    };
  };

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm min-h-[200px]`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Horas Registradas</h3>
          {view === 'mensal' && (
            <button
              onClick={() => setMostrarProjecao(!mostrarProjecao)}
              className={`p-1 rounded-full hover:bg-gray-100 ${darkMode ? 'hover:bg-gray-700' : ''}`}
            >
              <ChevronDown
                size={20}
                className={`transform transition-transform ${mostrarProjecao ? 'rotate-180' : ''}`}
              />
            </button>
          )}
        </div>
        
        <div className="flex-1 flex items-center">
          <div className="w-full">
            {!mostrarProjecao ? (
              <>
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Clock className="text-blue-500" size={24} />
                  </div>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : ''}`}>
                    {horasUsadas.toFixed(1)}h
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {' '}/ {horasDisponiveis}h
                    </span>
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (horasUsadas / horasDisponiveis) * 100)}%` }}
                  ></div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                {projecao ? (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 rounded-full">
                        <Clock className="text-green-500" size={24} />
                      </div>
                      <div>
                        <p className={`text-lg font-medium ${darkMode ? 'text-white' : ''}`}>
                          Projeção Linear
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {projecao.atual}h / {projecao.final}h ({projecao.percentual}% do mês)
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${projecao.percentual}%` }}
                      ></div>
                    </div>
                  </>
                ) : null}
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Clock className="text-blue-500" size={24} />
                  </div>
                  <div>
                    <p className={`text-lg font-medium ${darkMode ? 'text-white' : ''}`}>
                      Realizado
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {horasUsadas.toFixed(1)}h / {horasDisponiveis}h
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (horasUsadas / horasDisponiveis) * 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm min-h-[200px]`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Distribuição por Cluster</h3>
        </div>
        
        <div className="space-y-3">
          {clusters.map(cluster => {
            const horasCluster = dadosGrafico[cluster]?.toFixed(1) || 0;
            const totalHoras = Object.values(dadosGrafico).reduce((acc, val) => acc + val, 0);
            const porcentagem = totalHoras > 0 ? ((dadosGrafico[cluster] || 0) / totalHoras * 100).toFixed(1) : 0;
            const clusterColor = getClusterColor(cluster);
            
            return (
              <div key={cluster} className="flex items-center flex-wrap gap-2">
                <div className="flex items-center min-w-[150px] flex-1">
                  <div className={`w-3 h-3 rounded-full mr-2 ${clusterColor}`}></div>
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : ''}`}>{cluster}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium mr-2">{horasCluster}h</span>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>({porcentagem}%)</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${clusterColor}`} 
                      style={{ width: `${(dadosGrafico[cluster] || 0) / maxValor * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TaskStats; 