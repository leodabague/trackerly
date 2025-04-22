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
      removerCluster
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