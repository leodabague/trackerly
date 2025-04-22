import React, { useState } from 'react';
import { Clock, ChevronDown } from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';

const TaskStats = ({ darkMode, horasUsadas, horasDisponiveis, view }) => {
  const { tarefas, clusters } = useTaskContext();
  const [mostrarProjecao, setMostrarProjecao] = useState(false);

  const calcularDadosGrafico = () => {
    const dadosPorCluster = {};
    
    clusters.forEach(cluster => {
      const horasCluster = tarefas
        .filter(tarefa => tarefa.cluster === cluster)
        .reduce((acc, tarefa) => acc + tarefa.horasTotal, 0);
      
      dadosPorCluster[cluster] = horasCluster;
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

  const dadosGrafico = calcularDadosGrafico();
  const maxValor = Math.max(...Object.values(dadosGrafico), 0.1);
  const projecao = calcularProjecaoLinear();

  const clusterColors = {
    'Desenvolvimento': 'bg-blue-500',
    'Reuniões': 'bg-green-500',
    'Pesquisa': 'bg-purple-500',
    'Documentação': 'bg-yellow-500'
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
            
            return (
              <div key={cluster} className="flex items-center flex-wrap gap-2">
                <div className="flex items-center min-w-[150px] flex-1">
                  <div className={`w-3 h-3 rounded-full mr-2 ${clusterColors[cluster]}`}></div>
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : ''}`}>{cluster}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium mr-2">{horasCluster}h</span>
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>({porcentagem}%)</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${clusterColors[cluster]}`} 
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