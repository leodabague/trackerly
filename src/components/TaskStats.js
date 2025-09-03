import React, { useState, useEffect } from 'react';
import { Clock, ChevronDown } from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';

const TaskStats = ({ horasUsadas, horasDisponiveis, view, dataSelecionada, weekStart, monthStart }) => {
  const { tarefas, clusters } = useTaskContext();
  const [mostrarProjecao, setMostrarProjecao] = useState(false);
  const [dadosGrafico, setDadosGrafico] = useState({});
  const [maxValor, setMaxValor] = useState(0.1);
  const [projecao, setProjecao] = useState(null);

  // Função para filtrar tarefas de acordo com o período selecionado
  const filtrarTarefasPorPeriodo = () => {
    if (!tarefas || !Array.isArray(tarefas) || tarefas.length === 0) {
      return [];
    }
    
    return tarefas.filter(tarefa => {
      if (!tarefa.data) return false;
      
      try {
        // Usar _dataObj se disponível (previamente processado)
        let dataTarefa;
        
        if (tarefa._dataObj && tarefa._dataObj instanceof Date) {
          dataTarefa = new Date(tarefa._dataObj);
        } else if (typeof tarefa.data === 'string') {
          // Verificar se é uma data no formato DD/MM/YYYY
          const parts = tarefa.data.split('/');
          if (parts.length === 3) {
            // Formato brasileiro: DD/MM/YYYY
            const dia = parseInt(parts[0], 10);
            const mes = parseInt(parts[1], 10) - 1; // Meses em JS começam do 0
            const ano = parseInt(parts[2], 10);
            dataTarefa = new Date(ano, mes, dia);
          } else {
            // Tentar conversão padrão
            dataTarefa = new Date(tarefa.data);
          }
        } else {
          // Fallback para outros casos
          dataTarefa = new Date(tarefa.data);
        }
        
        // Verificar se é uma data válida
        if (isNaN(dataTarefa.getTime())) {
          console.warn('Data inválida encontrada em TaskStats:', tarefa.data);
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
    const mesSelecionado = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1);
    const inicioMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    // Verificar situação do mês selecionado em relação ao atual
    const mesPassado = mesSelecionado < inicioMesAtual;
    const mesFuturo = mesSelecionado > inicioMesAtual;
    const mesAtual = !mesPassado && !mesFuturo;
    
    // Usar a data do mês selecionado
    const ultimoDiaDoMesSelecionado = new Date(mesSelecionado.getFullYear(), mesSelecionado.getMonth() + 1, 0);
    const diasNoMes = ultimoDiaDoMesSelecionado.getDate();
    
    // Para meses passados, retornamos null com uma indicação que é um mês passado
    if (mesPassado) {
      return {
        tipo: 'passado',
        mensagem: 'Projeção não disponível para meses passados'
      };
    }
    
    // Para meses futuros, mostramos 0% de projeção
    if (mesFuturo) {
      return {
        tipo: 'futuro',
        atual: "0.0",
        final: horasDisponiveis.toFixed(1),
        percentual: "0.0",
        mensagem: 'Mês ainda não começou'
      };
    }
    
    // Para o mês atual, calculamos a projeção baseada na taxa diária atual
    const diasPassados = hoje.getDate();
    
    // Calcular a taxa diária baseada nas horas já registradas
    const taxaDiaria = horasUsadas / diasPassados;
    
    // Projetar para o mês inteiro
    const projecaoAtual = taxaDiaria * diasNoMes;
    
    return {
      tipo: 'atual',
      atual: projecaoAtual.toFixed(1),
      final: horasDisponiveis.toFixed(1),
      percentual: ((diasPassados / diasNoMes) * 100).toFixed(1)
    };
  };

  // Atualizar os dados quando qualquer dependência relevante mudar
  useEffect(() => {
    // Calcular dados para o gráfico
    const dadosPorCluster = calcularDadosGrafico();
    setDadosGrafico(dadosPorCluster);
    setMaxValor(Math.max(...Object.values(dadosPorCluster), 0.1));
    
    // Calcular projeção linear
    setProjecao(calcularProjecaoLinear());
  }, [tarefas, clusters, view, horasUsadas, horasDisponiveis, dataSelecionada, weekStart, monthStart]);

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
      <div className="bg-card p-6 rounded-lg shadow-sm min-h-[180px]">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Clock className="text-primary" size={20} />
            </div>
            <h3 className="font-medium">Horas Registradas</h3>
          </div>
          {view === 'mensal' && (
            <button
              onClick={() => setMostrarProjecao(!mostrarProjecao)}
              className="p-1 rounded-full hover:bg-accent"
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
                  <p className="text-xl font-bold">
                    {horasUsadas.toFixed(1)}h
                    <span className="text-sm text-muted-foreground">
                      {' '}/ {horasDisponiveis}h
                    </span>
                  </p>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (horasUsadas / horasDisponiveis) * 100)}%` }}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-4">
                {projecao && (
                  <>
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        projecao.tipo === 'atual' ? 'bg-green-100' : 
                        projecao.tipo === 'futuro' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        <Clock className={`${
                          projecao.tipo === 'atual' ? 'text-green-500' :
                          projecao.tipo === 'futuro' ? 'text-blue-500' : 'text-gray-500'
                        }`} size={20} />
                      </div>
                      <div>
                        <p className="text-base font-medium">
                          Projeção Linear
                        </p>
                        {projecao.tipo === 'atual' || projecao.tipo === 'futuro' ? (
                          <p className="text-xs text-muted-foreground">
                            {projecao.atual}h / {projecao.final}h ({projecao.percentual}% do mês)
                            {projecao.tipo === 'futuro' && (
                              <span className="ml-2 font-italic text-xs">{projecao.mensagem}</span>
                            )}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            {projecao.mensagem}
                          </p>
                        )}
                      </div>
                    </div>
                    {(projecao.tipo === 'atual' || projecao.tipo === 'futuro') && (
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            projecao.tipo === 'atual' ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${projecao.percentual}%` }}
                        ></div>
                      </div>
                    )}
                  </>
                )}
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Clock className="text-primary" size={20} />
                  </div>
                  <div>
                    <p className="text-base font-medium">
                      Realizado
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {horasUsadas.toFixed(1)}h / {horasDisponiveis}h
                    </p>
                  </div>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (horasUsadas / horasDisponiveis) * 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-card p-6 rounded-lg shadow-sm min-h-[180px]">
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
                  <span className="text-sm">{cluster}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium mr-2">{horasCluster}h</span>
                  <span className="text-sm text-muted-foreground">({porcentagem}%)</span>
                  <div className="w-24 bg-secondary rounded-full h-2">
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