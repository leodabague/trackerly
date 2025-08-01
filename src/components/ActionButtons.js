import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Save, Download, FileText, Settings, X, Upload } from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';
import html2pdf from 'html2pdf.js';

const ActionButtons = forwardRef(({ darkMode, resetFiltros }, ref) => {
  const { tarefas, clusters, configuracoes, setConfiguracoes, setAllData } = useTaskContext();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [nomeArquivo, setNomeArquivo] = useState('horas-consultoria-dados.json');
  const [statusSalvamento, setStatusSalvamento] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [email] = useState('');

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    quickExport: () => {
      // Quick export with default filename
      exportarDados();
    },
    openExportModal: () => setShowExportModal(true),
    openConfigModal: () => setShowConfigModal(true)
  }));

  // Função para salvar dados no localStorage
  const salvarDados = () => {
    try {
      const dadosParaSalvar = {
        tarefas,
        clusters,
        configuracoes,
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
  
  // Função para exportar dados para um arquivo JSON
  const exportarDados = () => {
    try {
      const dadosParaExportar = {
        tarefas,
        clusters,
        configuracoes,
        email,
        horasDisponiveis: configuracoes.horasMensais
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
            
            if (dados.tarefas) {
              // Usar a função setAllData para atualizar o contexto diretamente
              const resultado = setAllData(dados);
              
              if (resultado) {
                setStatusSalvamento('Dados importados com sucesso!');
                // Fechar o modal após importação bem-sucedida
                setShowExportModal(false);
                
                // Resetar os filtros para garantir que a visualização seja atualizada
                if (resetFiltros) {
                  resetFiltros();
                }
              } else {
                setStatusSalvamento('Erro ao importar dados: formato inválido.');
              }
            } else {
              setStatusSalvamento('Erro ao importar dados: formato inválido.');
            }
            
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

  // Gerar relatório mensal
  const gerarRelatorio = async (mesAnterior = false) => {
    setIsLoading(true);
    
    try {
      // Data do relatório
      const hoje = new Date();
      const dataRelatorio = mesAnterior 
        ? new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
        : new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      
      // Filtrar tarefas do mês
      const tarefasDoMes = tarefas.filter(tarefa => {
        try {
          let dataTarefa;
          
          // Usar _dataObj se disponível (previamente processado)
          if (tarefa._dataObj && tarefa._dataObj instanceof Date) {
            dataTarefa = tarefa._dataObj;
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
          
          // Verificar se a data é válida
          if (isNaN(dataTarefa.getTime())) {
            console.warn("Data inválida ao filtrar tarefa:", tarefa.data);
            return false;
          }
          
          return dataTarefa.getMonth() === dataRelatorio.getMonth() &&
                 dataTarefa.getFullYear() === dataRelatorio.getFullYear();
        } catch (error) {
          console.error("Erro ao processar data para filtragem:", error, tarefa);
          return false;
        }
      });

      // Validar se existem tarefas no mês
      if (tarefasDoMes.length === 0) {
        setNotification({ 
          message: `Não existem tarefas registradas para ${dataRelatorio.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`, 
          type: 'error' 
        });
        setShowEmailModal(false);
        return;
      }
      
      // Criar elemento temporário para o relatório
      const relatorioDiv = document.createElement('div');
      relatorioDiv.className = 'p-8';
      
      // Calcular totais por cluster
      const totaisPorCluster = {};
      clusters.forEach(cluster => {
        totaisPorCluster[cluster] = tarefasDoMes
          .filter(tarefa => tarefa.cluster === cluster)
          .reduce((acc, tarefa) => acc + tarefa.horasTotal, 0);
      });
      
      // Gerar HTML do relatório
      relatorioDiv.innerHTML = `
        <div style="font-family: Arial, sans-serif;">
          <h1 style="text-align: center; margin-bottom: 20px;">Relatório de Horas - ${dataRelatorio.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h1>
          
          <div style="margin-bottom: 20px;">
            <h2 style="margin-bottom: 10px;">Resumo</h2>
            <p>Total de horas registradas: ${tarefasDoMes.reduce((acc, tarefa) => acc + tarefa.horasTotal, 0).toFixed(1)}h</p>
            <p>Meta mensal: ${configuracoes.horasMensais}h</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h2 style="margin-bottom: 10px;">Distribuição por Cluster</h2>
            ${Object.entries(totaisPorCluster).map(([cluster, horas]) => `
              <p>${cluster}: ${horas.toFixed(1)}h</p>
            `).join('')}
          </div>
          
          <div style="margin-bottom: 20px;">
            <h2 style="margin-bottom: 10px;">Detalhamento das Tarefas</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Data</th>
                  <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Tarefa</th>
                  <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: left;">Cluster</th>
                  <th style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">Horas</th>
                </tr>
              </thead>
              <tbody>
                ${tarefasDoMes.map(tarefa => {
                  // Formatar a data corretamente
                  let dataFormatada;
                  
                  // Verificar se a data está no formato DD/MM/YYYY
                  if (typeof tarefa.data === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(tarefa.data)) {
                    dataFormatada = tarefa.data;
                  } else if (tarefa._dataObj && tarefa._dataObj instanceof Date) {
                    // Usar o objeto de data pré-processado
                    dataFormatada = tarefa._dataObj.toLocaleDateString('pt-BR');
                  } else {
                    try {
                      // Tentar converter para o formato brasileiro
                      const parts = tarefa.data.split('/');
                      if (parts.length === 3) {
                        // Assumir formato DD/MM/YYYY
                        dataFormatada = tarefa.data;
                      } else {
                        // Converter usando Date
                        const data = new Date(tarefa.data);
                        if (!isNaN(data.getTime())) {
                          dataFormatada = data.toLocaleDateString('pt-BR');
                        } else {
                          dataFormatada = tarefa.data;
                        }
                      }
                    } catch (error) {
                      console.error("Erro ao formatar data para relatório:", error);
                      dataFormatada = tarefa.data;
                    }
                  }
                  
                  return `
                  <tr>
                    <td style="padding: 8px; border: 1px solid #e5e7eb;">${dataFormatada}</td>
                    <td style="padding: 8px; border: 1px solid #e5e7eb;">${tarefa.nome}</td>
                    <td style="padding: 8px; border: 1px solid #e5e7eb;">${tarefa.cluster}</td>
                    <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">${tarefa.horasTotal.toFixed(1)}h</td>
                  </tr>
                `}).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
      
      // Configurações do PDF
      const opt = {
        margin: 1,
        filename: `relatorio-${dataRelatorio.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      
      // Gerar PDF
      await html2pdf().set(opt).from(relatorioDiv).save();
      
      // Notificar usuário
      setNotification({ message: 'Relatório gerado com sucesso!', type: 'success' });
      
      // Fechar o modal de email
      setShowEmailModal(false);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      setNotification({ message: 'Erro ao gerar relatório: ' + error.message, type: 'error' });
    } finally {
      setIsLoading(false);
      
      // Limpar a notificação após 3 segundos
      setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 3000);
    }
  };

  return (
    <>
      {/* Botões de Ação */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button 
          onClick={salvarDados}
          className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Save size={16} />
          Salvar Dados
        </button>
        
        <button 
          onClick={() => setShowExportModal(true)}
          className="px-4 py-2 bg-purple-500 text-white rounded-md flex items-center gap-2 w-full sm:w-auto justify-center relative group"
          title="Exportar/Importar Dados (Ctrl+E)"
        >
          <Download size={16} />
          Exportar/Importar
          <span className="hidden group-hover:block absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            Ctrl+E
          </span>
        </button>
        
        <button 
          onClick={() => setShowEmailModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <FileText size={16} />
          Gerar Relatório PDF
        </button>

        <button 
          onClick={() => setShowConfigModal(true)}
          className="px-4 py-2 bg-gray-500 text-white rounded-md flex items-center gap-2 w-full sm:w-auto justify-center relative group"
          title="Configurações (Ctrl+,)"
        >
          <Settings size={16} />
          Configurações
          <span className="hidden group-hover:block absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            Ctrl+,
          </span>
        </button>
      </div>
      
      {/* Mensagem de Status */}
      {statusSalvamento && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg">
          {statusSalvamento}
        </div>
      )}
      
      {/* Notificação */}
      {notification.message && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}
      
      {/* Loading */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl flex flex-col items-center">
            <div className="animate-spin h-8 w-8 text-blue-500 mb-2 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <p className="text-gray-700 dark:text-gray-300">Gerando relatório...</p>
          </div>
        </div>
      )}
      
      {/* Modal de Exportar/Importar */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Exportar/Importar Dados</h3>
              <button onClick={() => setShowExportModal(false)} className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className={`text-md font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Exportar Dados</h4>
                <div className="space-y-3">
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Nome do Arquivo</label>
                    <input
                      type="text"
                      value={nomeArquivo}
                      onChange={(e) => setNomeArquivo(e.target.value)}
                      className={`w-full p-2 border rounded-md ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                      placeholder="horas-consultoria-dados.json"
                    />
                  </div>
                  
                  <button
                    onClick={exportarDados}
                    className={`w-full py-2 rounded-md flex items-center justify-center gap-2 ${
                      darkMode
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                    }`}
                  >
                    <Download size={16} />
                    Exportar Dados
                  </button>
                </div>
              </div>
              
              <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} pt-4`}>
                <h4 className={`text-md font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>Importar Dados</h4>
                <div className="space-y-2">
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Selecione um arquivo JSON exportado anteriormente:</p>
                  
                  <label className={`block w-full py-2 text-center rounded-md cursor-pointer border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200' 
                      : 'bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-700'
                  }`}>
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

      {/* Modal de Configurações */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Configurações</h3>
              <button onClick={() => setShowConfigModal(false)} className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Horas Mensais</label>
                <input
                  type="number"
                  min="1"
                  value={configuracoes.horasMensais}
                  onChange={(e) => setConfiguracoes({...configuracoes, horasMensais: parseInt(e.target.value) || 1})}
                  className={`w-full p-2 border rounded-md ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Horas Semanais</label>
                <input
                  type="number"
                  min="1"
                  value={configuracoes.horasSemanais}
                  onChange={(e) => setConfiguracoes({...configuracoes, horasSemanais: parseInt(e.target.value) || 1})}
                  className={`w-full p-2 border rounded-md ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Horas Diárias</label>
                <input
                  type="number"
                  min="1"
                  value={configuracoes.horasDiarias}
                  onChange={(e) => setConfiguracoes({...configuracoes, horasDiarias: parseInt(e.target.value) || 1})}
                  className={`w-full p-2 border rounded-md ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-gray-100' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <button
                onClick={() => {
                  setShowConfigModal(false);
                  salvarDados();
                }}
                className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Email para Relatório */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Gerar Relatório Mensal</h3>
              <button onClick={() => setShowEmailModal(false)} className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Selecione o mês para o qual deseja gerar o relatório:
              </p>
              
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => gerarRelatorio(false)}
                  className={`w-full py-2 rounded-md flex items-center justify-center gap-2 ${
                    darkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  <FileText size={16} />
                  Gerar para o Mês Atual
                </button>
                
                <button
                  onClick={() => gerarRelatorio(true)}
                  className={`w-full py-2 rounded-md flex items-center justify-center gap-2 ${
                    darkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  <FileText size={16} />
                  Gerar para o Mês Anterior
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

ActionButtons.displayName = 'ActionButtons';

export default ActionButtons; 