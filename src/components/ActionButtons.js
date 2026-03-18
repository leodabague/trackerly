import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Save, Download, FileText, Settings, X, Upload } from 'lucide-react';
import { useTaskContext } from '../contexts/TaskContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const ActionButtons = forwardRef(({ resetFiltros }, ref) => {
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
    openConfigModal: () => setShowConfigModal(true),
    closeModals: () => {
      let fechouAlgum = false;
      if (showExportModal) {
        setShowExportModal(false);
        fechouAlgum = true;
      }
      if (showConfigModal) {
        setShowConfigModal(false);
        fechouAlgum = true;
      }
      if (showEmailModal) {
        setShowEmailModal(false);
        fechouAlgum = true;
      }
      return fechouAlgum;
    }
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
      
      // Calcular totais por cluster
      const totaisPorCluster = {};
      clusters.forEach(cluster => {
        totaisPorCluster[cluster] = tarefasDoMes
          .filter(tarefa => tarefa.cluster === cluster)
          .reduce((acc, tarefa) => acc + tarefa.horasTotal, 0);
      });

      const mesLabel = dataRelatorio.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      const totalHoras = tarefasDoMes.reduce((acc, t) => acc + t.horasTotal, 0);

      // Gerar PDF com APIs nativas (sem renderização de HTML)
      const doc = new jsPDF('portrait', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`Relatório de Horas - ${mesLabel}`, pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.text('Resumo', 14, 35);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total de horas registradas: ${totalHoras.toFixed(1)}h`, 14, 44);
      doc.text(`Meta mensal: ${configuracoes.horasMensais}h`, 14, 51);

      let yPos = 63;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Distribuição por Cluster', 14, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      Object.entries(totaisPorCluster).forEach(([cluster, horas]) => {
        doc.text(`${cluster}: ${horas.toFixed(1)}h`, 18, yPos);
        yPos += 6;
      });

      yPos += 4;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Detalhamento das Tarefas', 14, yPos);

      autoTable(doc, {
        startY: yPos + 5,
        head: [['Data', 'Tarefa', 'Cluster', 'Horas']],
        body: tarefasDoMes.map(tarefa => {
          let dataFormatada;
          if (typeof tarefa.data === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(tarefa.data)) {
            dataFormatada = tarefa.data;
          } else if (tarefa._dataObj instanceof Date) {
            dataFormatada = tarefa._dataObj.toLocaleDateString('pt-BR');
          } else {
            try {
              const d = new Date(tarefa.data);
              dataFormatada = isNaN(d.getTime()) ? String(tarefa.data) : d.toLocaleDateString('pt-BR');
            } catch {
              dataFormatada = String(tarefa.data);
            }
          }
          return [dataFormatada, tarefa.nome, tarefa.cluster, `${tarefa.horasTotal.toFixed(1)}h`];
        }),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0] },
        columnStyles: { 3: { halign: 'right' } }
      });

      doc.save(`relatorio-${mesLabel}.pdf`);
      
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
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Save size={16} />
          Salvar Dados
        </button>
        
        <button 
          onClick={() => setShowExportModal(true)}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md flex items-center gap-2 w-full sm:w-auto justify-center relative group"
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
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <FileText size={16} />
          Gerar Relatório PDF
        </button>

        <button 
          onClick={() => setShowConfigModal(true)}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md flex items-center gap-2 w-full sm:w-auto justify-center relative group"
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
        <div className="fixed bottom-4 right-4 bg-card text-card-foreground px-4 py-2 rounded-md shadow-lg">
          {statusSalvamento}
        </div>
      )}
      
      {/* Notificação */}
      {notification.message && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg ${
          notification.type === 'success' ? 'bg-primary text-primary-foreground' : 'bg-destructive text-destructive-foreground'
        }`}>
          {notification.message}
        </div>
      )}
      
      {/* Loading */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg shadow-xl flex flex-col items-center">
            <div className="animate-spin h-8 w-8 text-primary mb-2 border-4 border-primary border-t-transparent rounded-full"></div>
            <p className="text-foreground">Gerando relatório...</p>
          </div>
        </div>
      )}
      
      {/* Modal de Exportar/Importar */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-foreground">Exportar/Importar Dados</h3>
              <button onClick={() => setShowExportModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-md font-medium mb-2 text-foreground">Exportar Dados</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Nome do Arquivo</label>
                    <input
                      type="text"
                      value={nomeArquivo}
                      onChange={(e) => setNomeArquivo(e.target.value)}
                      className="w-full p-2 border rounded-md bg-input text-foreground placeholder-muted-foreground"
                      placeholder="horas-consultoria-dados.json"
                    />
                  </div>
                  
                  <button
                    onClick={exportarDados}
                    className="w-full py-2 rounded-md flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Download size={16} />
                    Exportar Dados
                  </button>
                </div>
              </div>
              
              <div className="border-t border-border pt-4">
                <h4 className="text-md font-medium mb-2 text-foreground">Importar Dados</h4>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Selecione um arquivo JSON exportado anteriormente:</p>
                  
                  <label className="block w-full py-2 text-center rounded-md cursor-pointer border bg-background hover:bg-accent">
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
          <div className="bg-card rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-foreground">Configurações</h3>
              <button onClick={() => setShowConfigModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Horas Mensais</label>
                <input
                  type="number"
                  min="1"
                  value={configuracoes.horasMensais}
                  onChange={(e) => setConfiguracoes({...configuracoes, horasMensais: parseInt(e.target.value) || 1})}
                  className="w-full p-2 border rounded-md bg-input text-foreground"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Horas Semanais</label>
                <input
                  type="number"
                  min="1"
                  value={configuracoes.horasSemanais}
                  onChange={(e) => setConfiguracoes({...configuracoes, horasSemanais: parseInt(e.target.value) || 1})}
                  className="w-full p-2 border rounded-md bg-input text-foreground"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Horas Diárias</label>
                <input
                  type="number"
                  min="1"
                  value={configuracoes.horasDiarias}
                  onChange={(e) => setConfiguracoes({...configuracoes, horasDiarias: parseInt(e.target.value) || 1})}
                  className="w-full p-2 border rounded-md bg-input text-foreground"
                />
              </div>
              
              <button
                onClick={() => {
                  setShowConfigModal(false);
                  salvarDados();
                }}
                className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
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
          <div className="bg-card rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-foreground">Gerar Relatório Mensal</h3>
              <button onClick={() => setShowEmailModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Selecione o mês para o qual deseja gerar o relatório:
              </p>
              
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => gerarRelatorio(false)}
                  className="w-full py-2 rounded-md flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <FileText size={16} />
                  Gerar para o Mês Atual
                </button>
                
                <button
                  onClick={() => gerarRelatorio(true)}
                  className="w-full py-2 rounded-md flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
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