import React, { createContext, useContext, useState, useEffect } from 'react';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tarefas, setTarefas] = useState([]);
  const [clusters, setClusters] = useState(['Desenvolvimento', 'Reuniões', 'Pesquisa', 'Documentação']);
  const [configuracoes, setConfiguracoes] = useState({
    horasMensais: 20,
    horasSemanais: 5,
    horasDiarias: 1
  });

  // Carregar dados salvos ao inicializar
  useEffect(() => {
    const dadosSalvos = localStorage.getItem('horasConsultoriaData');
    if (dadosSalvos) {
      const dados = JSON.parse(dadosSalvos);
      if (dados.tarefas) setTarefas(dados.tarefas);
      if (dados.clusters) setClusters(dados.clusters);
      if (dados.configuracoes) setConfiguracoes(dados.configuracoes);
    }
  }, []);

  // Salvar dados quando houver mudanças
  useEffect(() => {
    const dadosParaSalvar = {
      tarefas,
      clusters,
      configuracoes
    };
    localStorage.setItem('horasConsultoriaData', JSON.stringify(dadosParaSalvar));
  }, [tarefas, clusters, configuracoes]);

  const adicionarTarefa = (novaTarefa) => {
    const horasTotal = novaTarefa.horas + (novaTarefa.minutos / 60);
    const tarefaCompleta = {
      ...novaTarefa,
      id: Date.now(),
      horasTotal
    };
    setTarefas([...tarefas, tarefaCompleta]);
  };

  const removerTarefa = (id) => {
    setTarefas(tarefas.filter(tarefa => tarefa.id !== id));
  };

  const editarTarefa = (tarefaEditada) => {
    setTarefas(tarefas.map(tarefa => 
      tarefa.id === tarefaEditada.id ? tarefaEditada : tarefa
    ));
  };

  const adicionarCluster = (novoCluster) => {
    setClusters([...clusters, novoCluster]);
  };

  const removerCluster = (clusterParaRemover) => {
    setClusters(clusters.filter(cluster => cluster !== clusterParaRemover));
  };

  // Nova função para importar todos os dados de uma vez
  const setAllData = (dados) => {
    try {
      // Verificar se os dados são do formato correto
      if (!dados || typeof dados !== 'object') {
        console.error('Formato de dados inválido para importação');
        return false;
      }

      let tarefasProcessadas = [];
      let clustersProcessados = [...clusters];
      let configProcessadas = {...configuracoes};

      // Verificar e processar as tarefas
      if (Array.isArray(dados.tarefas)) {
        // Verificar e corrigir o formato das tarefas se necessário
        tarefasProcessadas = dados.tarefas.map(tarefa => {
          // Garantir que horasTotal seja calculado corretamente
          const horasTotal = tarefa.horasTotal || (tarefa.horas + (tarefa.minutos || 0) / 60);
          
          // Garantir que a data seja processada corretamente
          let dataTarefa;
          if (tarefa.data) {
            // Converter string de data para objeto Date se necessário
            dataTarefa = tarefa.data instanceof Date ? 
              tarefa.data : 
              new Date(tarefa.data);
              
            // Verificar se é uma data válida
            if (isNaN(dataTarefa.getTime())) {
              // Se a data for inválida, usar a data atual
              console.warn(`Data inválida encontrada para tarefa: ${tarefa.nome}. Usando data atual.`);
              dataTarefa = new Date();
            }
          } else {
            // Se não houver data, usar a data atual
            dataTarefa = new Date();
          }
          
          return {
            ...tarefa,
            id: tarefa.id || Date.now() + Math.random(),
            data: dataTarefa.toISOString(), // Garantir formato ISO para consistência
            horasTotal
          };
        });
        setTarefas(tarefasProcessadas);
      } else {
        console.warn('Nenhuma tarefa encontrada nos dados importados');
        setTarefas([]);
      }

      // Verificar e processar os clusters
      if (Array.isArray(dados.clusters)) {
        clustersProcessados = dados.clusters;
        setClusters(clustersProcessados);
      }

      // Verificar e processar as configurações
      if (dados.configuracoes && typeof dados.configuracoes === 'object') {
        const configPadrao = {
          horasMensais: 20,
          horasSemanais: 5,
          horasDiarias: 1
        };
        
        configProcessadas = {
          ...configPadrao,
          ...dados.configuracoes
        };
        setConfiguracoes(configProcessadas);
      }
      
      // Salvar os dados importados no localStorage usando os dados processados
      localStorage.setItem('horasConsultoriaData', JSON.stringify({
        tarefas: tarefasProcessadas,
        clusters: clustersProcessados,
        configuracoes: configProcessadas
      }));
      
      // Debug: mostrar tarefas importadas
      console.log('Tarefas importadas:', tarefasProcessadas);
      
      return true;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return false;
    }
  };

  return (
    <TaskContext.Provider value={{
      tarefas,
      clusters,
      configuracoes,
      setConfiguracoes,
      adicionarTarefa,
      removerTarefa,
      editarTarefa,
      adicionarCluster,
      removerCluster,
      setAllData
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext deve ser usado dentro de um TaskProvider');
  }
  return context;
}; 