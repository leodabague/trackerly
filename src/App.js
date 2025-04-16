import React, { useState, useEffect, useCallback } from 'react';
import { Clock, FileText, Send, X, Plus, ChevronRight, ChevronLeft, Save, Download, Upload, Moon, Sun } from 'lucide-react';

const App = () => {
  // Estado para armazenar os dados
  const [tarefas, setTarefas] = useState([]);
  const [novaTarefa, setNovaTarefa] = useState({
    nome: '',
    data: new Date().toISOString().split('T')[0],
    horas: 1,
    minutos: 0,
    cluster: 'Desenvolvimento'
  });
  const [horasDisponiveis, setHorasDisponiveis] = useState(5 * 4); // 5h por semana * 4 semanas
  const [horasUsadas, setHorasUsadas] = useState(0);
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [view, setView] = useState('diario'); // diario, semanal, mensal
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [tarefaEditando, setTarefaEditando] = useState(null);
  const [clusters, setClusters] = useState(['Desenvolvimento', 'Reuniões', 'Pesquisa', 'Documentação']);
  const [email, setEmail] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [weekStart, setWeekStart] = useState(new Date());
  const [monthStart, setMonthStart] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [statusSalvamento, setStatusSalvamento] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);
  const [nomeArquivo, setNomeArquivo] = useState('horas-consultoria-dados.json');
  const [darkMode, setDarkMode] = useState(false);

  // Cores dos clusters
  const clusterColors = {
    'Desenvolvimento': 'bg-blue-500',
    'Reuniões': 'bg-green-500',
    'Pesquisa': 'bg-purple-500',
    'Documentação': 'bg-yellow-500'
  };

  // Função auxiliar para converter string de data para objeto Date
  const converterDataParaDate = (dataString) => {
    if (typeof dataString === 'string' && dataString.includes('/')) {
      const [dia, mes, ano] = dataString.split('/');
      return new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    }
    return new Date(dataString);
  };

  // Função para calcular horas usadas
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
    
    // Filtrar tarefas com base na visualização
    const tarefasFiltradas = tarefas.filter(tarefa => {
      const dataTarefa = converterDataParaDate(tarefa.data);
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
    
    // Somar horas
    total = tarefasFiltradas.reduce((acc, tarefa) => acc + tarefa.horasTotal, 0);
    setHorasUsadas(total);
  }, [dataSelecionada, weekStart, monthStart, tarefas, view]);

  // Efeito para calcular horas usadas
  useEffect(() => {
    calcularHorasUsadas();
  }, [calcularHorasUsadas]);
  
  // Efeito para carregar dados salvos ao inicializar
  useEffect(() => {
    carregarDadosSalvos();
    
    // Carregar preferência de tema
    const temaSalvo = localStorage.getItem('darkMode');
    if (temaSalvo !== null) {
      setDarkMode(temaSalvo === 'true');
    } else {
      // Detectar preferência do sistema
      const prefereEscuro = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefereEscuro);
    }
  }, []);

  // Função para adicionar uma nova tarefa
  const adicionarTarefa = () => {
    const horasTotal = novaTarefa.horas + (novaTarefa.minutos / 60);
    
    // Ajustar a data para considerar o fuso horário local
    const dataLocal = new Date(novaTarefa.data + 'T00:00:00');
    const dia = dataLocal.getDate().toString().padStart(2, '0');
    const mes = (dataLocal.getMonth() + 1).toString().padStart(2, '0');
    const ano = dataLocal.getFullYear();
    const dataAjustada = `${dia}/${mes}/${ano}`;
    
    const novaTarefaCompleta = {
      ...novaTarefa,
      id: Date.now(),
      horasTotal,
      data: dataAjustada
    };
    
    setTarefas([...tarefas, novaTarefaCompleta]);
    setNovaTarefa({
      nome: '',
      data: new Date().toISOString().split('T')[0],
      horas: 1,
      minutos: 0,
      cluster: 'Desenvolvimento'
    });
    setShowModal(false);
  };

  // Função para remover uma tarefa
  const removerTarefa = (id) => {
    setTarefas(tarefas.filter(tarefa => tarefa.id !== id));
  };

  // Formatação de data para exibição
  const formatarData = (data) => {
    // Se for um objeto Date
    if (data instanceof Date) {
      return data.toLocaleDateString('pt-BR');
    }
    
    // Se for uma string no formato pt-BR (DD/MM/YYYY)
    if (typeof data === 'string' && data.includes('/')) {
      return data;
    }
    
    // Para outros casos, converte para Date e formata
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR');
  };

  // Navegação pelo calendário
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

  // Formatar período para exibição
  const formatarPeriodo = () => {
    if (view === 'diario') {
      return formatarData(dataSelecionada);
    } else if (view === 'semanal') {
      const fimSemana = new Date(weekStart);
      fimSemana.setDate(fimSemana.getDate() + 6);
      return `${formatarData(weekStart)} - ${formatarData(fimSemana)}`;
    } else if (view === 'mensal') {
      return new Date(monthStart).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }
  };

  // Calcular dados para o gráfico
  const calcularDadosGrafico = () => {
    const dadosPorCluster = {};
    
    // Filtrar tarefas de acordo com a visualização
    const tarefasFiltradas = tarefas.filter(tarefa => {
      const dataTarefa = converterDataParaDate(tarefa.data);
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
        const inicioMes = new Date(monthStart);
        const fimMes = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59, 999);
        return dataTarefa >= inicioMes && dataTarefa <= fimMes;
      }
      return false;
    });
    
    // Calcular totais por cluster
    clusters.forEach(cluster => {
      const horasCluster = tarefasFiltradas
        .filter(tarefa => tarefa.cluster === cluster)
        .reduce((acc, tarefa) => acc + tarefa.horasTotal, 0);
      
      dadosPorCluster[cluster] = horasCluster;
    });
    
    return dadosPorCluster;
  };
  
  // Gerar relatório mensal
  const gerarRelatorio = () => {
    // Aqui você implementaria o envio real de email
    // Esta é uma simulação
    alert(`Relatório mensal de ${new Date(monthStart).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} enviado para ${email}`);
    setShowEmailModal(false);
  };
  
  // Alternar entre modo claro e escuro
  const alternarTema = () => {
    const novoTema = !darkMode;
    setDarkMode(novoTema);
    localStorage.setItem('darkMode', novoTema.toString());
  };
  
  // Função para salvar dados no localStorage
  const salvarDados = () => {
    try {
      const dadosParaSalvar = {
        tarefas,
        clusters,
        horasDisponiveis,
        email
      };
      
      localStorage.setItem('horasConsultoriaData', JSON.stringify(dadosParaSalvar));
      setStatusSalvamento('Dados salvos com sucesso!');
      
      // Limpar a mensagem após 3 segundos
      setTimeout(() => {
        setStatusSalvamento('');
      }, 3000);
    } catch (error) {
      setStatusSalvamento('Erro ao salvar dados: ' + error.message);
    }
  };
  
  // Função para carregar dados do localStorage
  const carregarDadosSalvos = () => {
    try {
      const dadosSalvos = localStorage.getItem('horasConsultoriaData');
      
      if (dadosSalvos) {
        const dados = JSON.parse(dadosSalvos);
        
        if (dados.tarefas) {
          // Garantir que as datas estejam no formato correto
          const tarefasComDataCorreta = dados.tarefas.map(tarefa => {
            if (tarefa.data && !tarefa.data.includes('/')) {
              const data = new Date(tarefa.data);
              const dia = data.getDate().toString().padStart(2, '0');
              const mes = (data.getMonth() + 1).toString().padStart(2, '0');
              const ano = data.getFullYear();
              return {
                ...tarefa,
                data: `${dia}/${mes}/${ano}`
              };
            }
            return tarefa;
          });
          setTarefas(tarefasComDataCorreta);
        }
        
        if (dados.clusters) setClusters(dados.clusters);
        if (dados.horasDisponiveis) setHorasDisponiveis(dados.horasDisponiveis);
        if (dados.email) setEmail(dados.email);
        
        setStatusSalvamento('Dados carregados com sucesso!');
        
        // Limpar a mensagem após 3 segundos
        setTimeout(() => {
          setStatusSalvamento('');
        }, 3000);
      }
    } catch (error) {
      setStatusSalvamento('Erro ao carregar dados: ' + error.message);
    }
  };
  
  // Função para exportar dados para um arquivo JSON
  const exportarDados = () => {
    try {
      const dadosParaExportar = {
        tarefas,
        clusters,
        horasDisponiveis,
        email,
        dataExportacao: new Date().toISOString()
      };
      
      const dadosJSON = JSON.stringify(dadosParaExportar, null, 2);
      const blob = new Blob([dadosJSON], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = nomeArquivo;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShowExportModal(false);
      setStatusSalvamento('Dados exportados com sucesso!');
      
      // Limpar a mensagem após 3 segundos
      setTimeout(() => {
        setStatusSalvamento('');
      }, 3000);
    } catch (error) {
      setStatusSalvamento('Erro ao exportar dados: ' + error.message);
    }
  };
  
  // Função para importar dados de um arquivo JSON
  const importarDados = (event) => {
    try {
      const arquivo = event.target.files[0];
      
      if (arquivo) {
        const leitor = new FileReader();
        
        leitor.onload = (e) => {
          try {
            const conteudo = e.target.result;
            const dados = JSON.parse(conteudo);
            
            if (dados.tarefas) setTarefas(dados.tarefas);
            if (dados.clusters) setClusters(dados.clusters);
            if (dados.horasDisponiveis) setHorasDisponiveis(dados.horasDisponiveis);
            if (dados.email) setEmail(dados.email);
            
            setStatusSalvamento('Dados importados com sucesso!');
            
            // Limpar a mensagem após 3 segundos
            setTimeout(() => {
              setStatusSalvamento('');
            }, 3000);
          } catch (erro) {
            setStatusSalvamento('Erro ao processar o arquivo: ' + erro.message);
          }
        };
        
        leitor.readAsText(arquivo);
      }
    } catch (error) {
      setStatusSalvamento('Erro ao importar dados: ' + error.message);
    }
  };

  // Calcular dados do gráfico
  const dadosGrafico = calcularDadosGrafico();
  
  // Encontrar o valor máximo para dimensionar o gráfico
  const maxValor = Math.max(...Object.values(dadosGrafico), 0.1);

  // Função para abrir o modal de edição
  const abrirModalEdicao = (tarefa) => {
    // Converter a data do formato DD/MM/YYYY para YYYY-MM-DD para o input date
    const [dia, mes, ano] = tarefa.data.split('/');
    const dataFormatada = `${ano}-${mes}-${dia}`;
    
    setTarefaEditando({
      ...tarefa,
      data: dataFormatada
    });
    setShowEditModal(true);
  };

  // Função para salvar as alterações da tarefa
  const salvarEdicaoTarefa = () => {
    if (!tarefaEditando) return;
    
    const tarefasAtualizadas = tarefas.map(tarefa => {
      if (tarefa.id === tarefaEditando.id) {
        return {
          ...tarefa,
          data: tarefaEditando.data,
          cluster: tarefaEditando.cluster
        };
      }
      return tarefa;
    });
    
    setTarefas(tarefasAtualizadas);
    localStorage.setItem('tarefas', JSON.stringify(tarefasAtualizadas));
    setShowEditModal(false);
    setTarefaEditando(null);
  };

  return (
    <>
      <div className={`fixed inset-0 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`} />
      <div className={`relative max-w-4xl mx-auto p-4 min-h-screen transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
        {/* Cabeçalho */}
        <header className="mb-8 text-center relative">
          <button
            onClick={alternarTema}
            className={`absolute top-0 right-0 p-2 rounded-full ${darkMode ? 'bg-gray-800 text-yellow-300' : 'bg-gray-200 text-blue-700'}`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Tracking tempo para projetos</h1>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>por Leo Dabague</p>
        </header>
        
        {/* Navegação e Seleção de Visualização */}
        <div className={`flex justify-between items-center mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-sm`}>
          <div className="flex gap-2">
            <button 
              onClick={() => setView('diario')} 
              className={`px-3 py-1 rounded ${view === 'diario' 
                ? 'bg-blue-500 text-white' 
                : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
            >
              Diário
            </button>
            <button 
              onClick={() => setView('semanal')} 
              className={`px-3 py-1 rounded ${view === 'semanal' 
                ? 'bg-blue-500 text-white' 
                : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
            >
              Semanal
            </button>
            <button 
              onClick={() => setView('mensal')} 
              className={`px-3 py-1 rounded ${view === 'mensal' 
                ? 'bg-blue-500 text-white' 
                : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
            >
              Mensal
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => navegarData(-1)} className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
              <ChevronLeft size={20} />
            </button>
            <span className="font-medium">{formatarPeriodo()}</span>
            <button onClick={() => navegarData(1)} className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        {/* Resumo de Horas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm flex items-center`}>
            <div className="mr-4 p-3 bg-blue-100 rounded-full">
              <Clock className="text-blue-500" size={24} />
            </div>
            <div>
              <h3 className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm font-medium`}>Horas Registradas</h3>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : ''}`}>
                {horasUsadas.toFixed(1)}h
                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}> / {horasDisponiveis}h</span>
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, (horasUsadas / horasDisponiveis) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-sm`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Distribuição por Cluster</h3>
            </div>
            
            <div className="space-y-3">
              {clusters.map(cluster => (
                <div key={cluster} className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${clusterColors[cluster]}`}></div>
                  <span className={`flex-1 text-sm ${darkMode ? 'text-gray-300' : ''}`}>{cluster}</span>
                  <span className="font-medium">{dadosGrafico[cluster]?.toFixed(1) || 0}h</span>
                  <div className="ml-2 w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${clusterColors[cluster]}`} 
                      style={{ width: `${(dadosGrafico[cluster] || 0) / maxValor * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Lista de Tarefas */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 mb-8`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-lg font-medium ${darkMode ? 'text-gray-200' : ''}`}>Tarefas Registradas</h2>
            <button 
              onClick={() => setShowModal(true)}
              className="px-3 py-1 bg-blue-500 text-white rounded-md flex items-center gap-1"
            >
              <Plus size={16} />
              Adicionar
            </button>
          </div>
          
          {tarefas.filter(tarefa => {
            const dataTarefa = converterDataParaDate(tarefa.data);
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
              const inicioMes = new Date(monthStart);
              const fimMes = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59, 999);
              return dataTarefa >= inicioMes && dataTarefa <= fimMes;
            }
            return false;
          }).length === 0 ? (
            <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Nenhuma tarefa registrada para este período
            </div>
          ) : (
            <div className="space-y-2">
              {tarefas.filter(tarefa => {
                const dataTarefa = converterDataParaDate(tarefa.data);
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
                  const inicioMes = new Date(monthStart);
                  const fimMes = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59, 999);
                  return dataTarefa >= inicioMes && dataTarefa <= fimMes;
                }
                return false;
              }).map((tarefa) => (
                <div key={tarefa.id} className={`flex items-center justify-between p-4 ${darkMode ? 'bg-gray-700' : 'bg-white'} rounded-lg shadow mb-4`}>
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{tarefa.nome}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {tarefa.data} - {tarefa.cluster} - {tarefa.horas}h {tarefa.minutos}m
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => abrirModalEdicao(tarefa)}
                      className={`p-2 ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => removerTarefa(tarefa.id)}
                      className={`p-2 ${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Botões de Ação */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button 
            onClick={salvarDados}
            className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center gap-2"
          >
            <Save size={16} />
            Salvar Dados
          </button>
          
          <button 
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded-md flex items-center gap-2"
          >
            <Download size={16} />
            Exportar/Importar
          </button>
          
          <button 
            onClick={() => setShowEmailModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center gap-2"
          >
            <FileText size={16} />
            Gerar Relatório Mensal
          </button>
        </div>
        
        {/* Mensagem de Status */}
        {statusSalvamento && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg">
            {statusSalvamento}
          </div>
        )}
        
        {/* Modal de Adicionar Tarefa */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Adicionar Nova Tarefa</h3>
                <button onClick={() => setShowModal(false)} className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Nome da Tarefa</label>
                  <input
                    type="text"
                    value={novaTarefa.nome}
                    onChange={(e) => setNovaTarefa({...novaTarefa, nome: e.target.value})}
                    className={`w-full p-2 border rounded-md ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Ex: Reunião com cliente"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Data</label>
                  <input
                    type="date"
                    value={novaTarefa.data}
                    onChange={(e) => setNovaTarefa({...novaTarefa, data: e.target.value})}
                    className={`w-full p-2 border rounded-md ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Horas</label>
                    <input
                      type="number"
                      min="0"
                      value={novaTarefa.horas}
                      onChange={(e) => setNovaTarefa({...novaTarefa, horas: parseInt(e.target.value) || 0})}
                      className={`w-full p-2 border rounded-md ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-100' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Minutos</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={novaTarefa.minutos}
                      onChange={(e) => setNovaTarefa({...novaTarefa, minutos: parseInt(e.target.value) || 0})}
                      className={`w-full p-2 border rounded-md ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-100' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Cluster</label>
                  <select
                    value={novaTarefa.cluster}
                    onChange={(e) => setNovaTarefa({...novaTarefa, cluster: e.target.value})}
                    className={`w-full p-2 border rounded-md ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-gray-100' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    {clusters.map(cluster => (
                      <option key={cluster} value={cluster}>{cluster}</option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={adicionarTarefa}
                  disabled={!novaTarefa.nome}
                  className={`w-full py-2 rounded-md transition-colors duration-200 ${
                    !novaTarefa.nome 
                      ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                      : darkMode
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Adicionar Tarefa
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Modal de Email para Relatório */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Enviar Relatório Mensal</h3>
                <button onClick={() => setShowEmailModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="seu@email.com"
                  />
                </div>
                
                <div className="pt-2">
                  <button
                    onClick={gerarRelatorio}
                    disabled={!email.includes('@')}
                    className={`w-full py-2 rounded-md flex items-center justify-center gap-2 ${!email.includes('@') ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
                  >
                    <Send size={16} />
                    Enviar Relatório
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Modal de Exportar/Importar */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Exportar/Importar Dados</h3>
                <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium mb-2">Exportar Dados</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Arquivo</label>
                      <input
                        type="text"
                        value={nomeArquivo}
                        onChange={(e) => setNomeArquivo(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="horas-consultoria-dados.json"
                      />
                    </div>
                    
                    <button
                      onClick={exportarDados}
                      className="w-full py-2 bg-purple-500 text-white rounded-md flex items-center justify-center gap-2"
                    >
                      <Download size={16} />
                      Exportar Dados
                    </button>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="text-md font-medium mb-2">Importar Dados</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Selecione um arquivo JSON exportado anteriormente:</p>
                    
                    <label className="block w-full py-2 bg-gray-100 text-center rounded-md cursor-pointer border border-gray-300 hover:bg-gray-200">
                      <Upload size={16} className="inline-block mr-2" />
                      Selecionar Arquivo
                      <input
                        type="file"
                        accept=".json"
                        onChange={importarDados}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Edição de Tarefa */}
        {showEditModal && tarefaEditando && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-96">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Editar Tarefa</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome da Tarefa
                  </label>
                  <input
                    type="text"
                    value={tarefaEditando.nome}
                    onChange={(e) => setTarefaEditando({...tarefaEditando, nome: e.target.value})}
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    value={tarefaEditando.data}
                    onChange={(e) => setTarefaEditando({...tarefaEditando, data: e.target.value})}
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cluster
                  </label>
                  <input
                    type="text"
                    value={tarefaEditando.cluster}
                    onChange={(e) => setTarefaEditando({...tarefaEditando, cluster: e.target.value})}
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Horas
                    </label>
                    <input
                      type="number"
                      value={tarefaEditando.horas}
                      onChange={(e) => setTarefaEditando({...tarefaEditando, horas: parseInt(e.target.value)})}
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Minutos
                    </label>
                    <input
                      type="number"
                      value={tarefaEditando.minutos}
                      onChange={(e) => setTarefaEditando({...tarefaEditando, minutos: parseInt(e.target.value)})}
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={salvarEdicaoTarefa}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default App;