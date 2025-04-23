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
    
    // Processar a data para garantir o formato correto
    let dataProcessada = novaTarefa.data;
    let dataObj = null;
    
    // Se for uma string de data no formato ISO (YYYY-MM-DD de input type=date)
    if (typeof novaTarefa.data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(novaTarefa.data)) {
      // Criar objeto Date corretamente usando esse formato
      dataObj = new Date(novaTarefa.data + 'T00:00:00');
      
      // Formatar para o padrão DD/MM/YYYY para exibição e armazenamento
      const dia = String(dataObj.getDate()).padStart(2, '0');
      const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
      const ano = dataObj.getFullYear();
      dataProcessada = `${dia}/${mes}/${ano}`;
    }
    
    const tarefaCompleta = {
      ...novaTarefa,
      id: Date.now(),
      data: dataProcessada,
      _dataObj: dataObj,
      horasTotal
    };
    
    setTarefas([...tarefas, tarefaCompleta]);
  };

  const removerTarefa = (id) => {
    setTarefas(tarefas.filter(tarefa => tarefa.id !== id));
  };

  const editarTarefa = (tarefaEditada) => {
    // Processar a data para garantir o formato correto
    let dataProcessada = tarefaEditada.data;
    let dataObj = null;
    
    // Se for uma string de data no formato ISO (YYYY-MM-DD de input type=date)
    if (typeof tarefaEditada.data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(tarefaEditada.data)) {
      // Criar objeto Date corretamente usando esse formato
      dataObj = new Date(tarefaEditada.data + 'T00:00:00');
      
      // Formatar para o padrão DD/MM/YYYY para exibição e armazenamento
      const dia = String(dataObj.getDate()).padStart(2, '0');
      const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
      const ano = dataObj.getFullYear();
      dataProcessada = `${dia}/${mes}/${ano}`;
    }
    
    setTarefas(tarefas.map(tarefa => 
      tarefa.id === tarefaEditada.id ? {
        ...tarefaEditada,
        data: dataProcessada,
        _dataObj: dataObj,
      } : tarefa
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
          let dataTarefa = tarefa.data;
          if (tarefa.data) {
            // Verificar se a data já está no formato DD/MM/YYYY (formato brasileiro)
            if (typeof tarefa.data === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(tarefa.data)) {
              // Manter o formato original da data (DD/MM/YYYY)
              dataTarefa = tarefa.data;
              // Adicionar um atributo que ajude na filtragem posterior
              const parts = tarefa.data.split('/');
              if (parts.length === 3) {
                const dia = parseInt(parts[0], 10);
                const mes = parseInt(parts[1], 10) - 1; // Meses em JS começam do 0
                const ano = parseInt(parts[2], 10);
                // Criar uma data JavaScript correta para referência interna
                // Isto não afeta o formato exibido, mas ajuda na filtragem
                tarefa._dataObj = new Date(ano, mes, dia);
              }
            } else if (tarefa.data instanceof Date) {
              // Se já for um objeto Date, formatar para DD/MM/YYYY
              const dia = String(tarefa.data.getDate()).padStart(2, '0');
              const mes = String(tarefa.data.getMonth() + 1).padStart(2, '0');
              const ano = tarefa.data.getFullYear();
              dataTarefa = `${dia}/${mes}/${ano}`;
              tarefa._dataObj = tarefa.data;
            } else {
              try {
                // Tentar converter para Date e depois para DD/MM/YYYY
                let dataObj;
                
                // Verificar se é uma string no formato DD/MM/YYYY
                if (typeof tarefa.data === 'string') {
                  const parts = tarefa.data.split('/');
                  if (parts.length === 3) {
                    // Assumir formato brasileiro DD/MM/YYYY
                    const dia = parseInt(parts[0], 10);
                    const mes = parseInt(parts[1], 10) - 1; // Meses em JS começam do 0
                    const ano = parseInt(parts[2], 10);
                    dataObj = new Date(ano, mes, dia);
                  } else {
                    // Tentar converter normalmente
                    dataObj = new Date(tarefa.data);
                  }
                } else {
                  dataObj = new Date(tarefa.data);
                }
                
                if (!isNaN(dataObj.getTime())) {
                  const dia = String(dataObj.getDate()).padStart(2, '0');
                  const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
                  const ano = dataObj.getFullYear();
                  dataTarefa = `${dia}/${mes}/${ano}`;
                  tarefa._dataObj = dataObj;
                } else {
                  // Se a data for inválida, manter como está ou usar formato padrão
                  console.warn(`Data inválida encontrada para tarefa: ${tarefa.nome}. Usando formato original.`);
                }
              } catch (error) {
                console.warn(`Erro ao processar data da tarefa: ${tarefa.nome}`, error);
              }
            }
          } else {
            // Se não houver data, usar a data atual no formato DD/MM/YYYY
            const hoje = new Date();
            const dia = String(hoje.getDate()).padStart(2, '0');
            const mes = String(hoje.getMonth() + 1).padStart(2, '0');
            const ano = hoje.getFullYear();
            dataTarefa = `${dia}/${mes}/${ano}`;
            tarefa._dataObj = hoje;
          }
          
          return {
            ...tarefa,
            id: tarefa.id || Date.now() + Math.random(),
            data: dataTarefa, // Usar o formato preservado ou convertido
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