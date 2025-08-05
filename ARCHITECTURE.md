# Arquitetura do Trackerly

Este documento descreve a arquitetura e organização do código do aplicativo Trackerly, um rastreador de tempo para projetos.

## Visão Geral da Aplicação

Trackerly é uma aplicação React single-page que permite aos usuários rastrear o tempo gasto em diferentes tarefas e projetos. A aplicação utiliza o armazenamento local do navegador (localStorage) para persistência de dados e foi construída com React, Tailwind CSS e outras bibliotecas modernas.

## Dependências Principais

A aplicação utiliza as seguintes dependências principais:
- React 19.1.0
- TailwindCSS 3.3.0
- html2pdf.js 0.10.3 (para geração de relatórios em PDF)
- lucide-react 0.488.0 (para ícones)

## Estrutura de Diretórios

```
trackerly/
├── public/               # Arquivos estáticos
│   ├── index.html        # Página HTML principal
│   └── ...               # Outros assets
├── src/                  # Código-fonte da aplicação
│   ├── components/       # Componentes React
│   ├── contexts/         # Contextos React para gerenciamento de estado
│   ├── hooks/            # Custom hooks
│   ├── styles/           # Estilos CSS
│   ├── utils/            # Funções utilitárias
│   ├── App.js            # Componente principal da aplicação
│   ├── index.js          # Ponto de entrada da aplicação
│   └── ...               # Outros arquivos
├── package.json          # Dependências e scripts npm
├── tailwind.config.js    # Configuração do Tailwind CSS
└── ...                   # Outros arquivos de configuração
```

## Componentes Principais

### `App.js`
- Componente raiz que organiza a estrutura da aplicação
- Utiliza o `TaskProvider` para fornecer contexto de tarefas para toda a aplicação
- Organiza os componentes principais na interface
- Implementa o modo escuro através do hook `useTheme`

### Componentes (`/src/components/`)

#### `Header.js`
- Exibe o cabeçalho da aplicação
- Fornece opções para alternar entre modo claro e escuro

#### `TaskFilters.js`
- Permite filtrar tarefas por visualização (diária, semanal, mensal)
- Controles de navegação para períodos (anterior/próximo)
- Exibe o período atual selecionado

#### `TaskStats.js`
- Exibe estatísticas de horas utilizadas
- Mostra gráficos de distribuição de tempo por cluster
- Apresenta projeções de tempo com base no progresso atual
- Apresenta visualizações de dados adaptadas ao período selecionado (dia, semana, mês)

#### `TaskList.js`
- Lista as tarefas filtradas pelo período atual
- Fornece opções para expandir/colapsar a lista
- Integra o modal para adicionar novas tarefas
- Aplica filtros por período (diário, semanal ou mensal)

#### `TaskItem.js`
- Exibe uma tarefa individual na lista
- Fornece botões para editar e excluir tarefas
- Mostra informações como nome, data, duração e cluster

#### `TaskForm.js`
- Formulário para adicionar ou editar tarefas
- Validação de entrada e processamento de dados
- Suporte para edição de tarefas existentes
- Inclui seleção de clusters predefinidos

#### `ActionButtons.js`
- Botões para ações como exportar/importar dados
- Opções para reiniciar filtros e outras funcionalidades avançadas
- Gerenciamento de arquivos JSON para backup de dados
- Geração de relatórios em PDF com html2pdf.js
- Configurações para horas disponíveis (diárias, semanais, mensais)

#### `KeyboardShortcuts.js`
- Modal interativo que exibe todos os atalhos de teclado disponíveis
- Botão flutuante para acesso rápido aos atalhos (canto inferior direito)
- Formatação automática de atalhos para Windows/Linux (Ctrl) e macOS (⌘)
- Interface responsiva e adaptada ao tema claro/escuro
- Implementa forwardRef para controle externo do modal

#### `ShortcutNotification.js`
- Sistema de notificações temporárias para feedback de atalhos
- Exibe notificação visual quando um atalho é usado
- Desaparece automaticamente após 2 segundos
- Design consistente com o tema da aplicação
- Integração global via window.showShortcutNotification

#### `WelcomeTooltip.js`
- Tooltip de boas-vindas para apresentar novos atalhos aos usuários
- Exibido apenas na primeira visita (controle via localStorage)
- Lista os atalhos mais importantes (Ctrl+M, Ctrl+S)
- Interface elegante com ícone de teclado
- Pode ser fechado manualmente ou via Escape

## Gerenciamento de Estado

### Context API (`/src/contexts/`)

#### `TaskContext.js`
- Gerencia o estado global das tarefas
- Fornece funções para adicionar, editar e remover tarefas
- Armazena e recupera dados do localStorage
- Processa os formatos de data para garantir consistência
- Lida com a importação e exportação de dados
- Gerencia a configuração de clusters para categorização de tarefas
- Fornece configurações personalizáveis para horas disponíveis

## Custom Hooks (`/src/hooks/`)

#### `useTheme.js`
- Gerencia o tema da aplicação (claro/escuro)
- Persiste a preferência do usuário no localStorage

#### `useTaskFilters.js`
- Implementa a lógica de filtragem de tarefas
- Gerencia a navegação entre períodos
- Calcula estatísticas como horas utilizadas e disponíveis
- Suporte para visualizações diárias, semanais e mensais
- Formata datas e períodos para exibição na interface

#### `useKeyboardShortcuts.js`  
- Hook personalizado para gerenciamento global de atalhos de teclado
- Intercepta eventos de teclado usando capture phase para máxima prioridade
- Previne conflitos com campos de entrada (input, textarea, select)
- Suporte nativo para Windows/Linux (Ctrl) e macOS (⌘)
- Tratamento especial para tecla Escape (sempre ativa)
- Inclui `useShortcutHints` para formatação de atalhos na UI
- Gerenciamento robusto de erros e prevenção de comportamentos padrão do browser

## Fluxo de Dados

1. **Entrada do Usuário**: Os usuários interagem com componentes de UI
2. **Manipulação de Estado**: As ações do usuário são tratadas pelo `TaskContext`
3. **Persistência**: Os dados são salvos automaticamente no localStorage
4. **Renderização**: A UI é atualizada para refletir o novo estado

## Funcionalidades Principais e Suas Localizações

### 1. Gerenciamento de Tarefas
- **Adicionar Tarefa**: `TaskForm.js`, `TaskContext.js` (função `adicionarTarefa`)
- **Editar Tarefa**: `TaskForm.js`, `TaskContext.js` (função `editarTarefa`)
- **Excluir Tarefa**: `TaskItem.js`, `TaskContext.js` (função `removerTarefa`)

### 2. Visualização e Filtragem
- **Filtros de Período**: `TaskFilters.js`, `useTaskFilters.js`
- **Listagem de Tarefas**: `TaskList.js`
- **Estatísticas**: `TaskStats.js`

### 3. Gerenciamento de Dados
- **Persistência Local**: `TaskContext.js` (useEffect para localStorage)
- **Importação/Exportação**: `ActionButtons.js`, `TaskContext.js` (função `setAllData`)
- **Geração de Relatórios**: `ActionButtons.js` (função `gerarRelatorio`)

### 4. Tema e UI
- **Alternância de Tema**: `Header.js`, `useTheme.js`
- **Layout Responsivo**: Implementado com Tailwind CSS em todos os componentes
- **Dark Mode**: Configurado globalmente em `App.js`

### 5. Sistema de Atalhos de Teclado
- **Gerenciamento de Atalhos**: `useKeyboardShortcuts.js` (hook principal)
- **Interface de Ajuda**: `KeyboardShortcuts.js` (modal de consulta)
- **Feedback Visual**: `ShortcutNotification.js` (notificações de uso)
- **Introdução de Usuário**: `WelcomeTooltip.js` (primeira experiência)
- **Atalhos Disponíveis**:
  - `Ctrl+M` / `⌘M`: Criar nova tarefa
  - `Ctrl+S` / `⌘S`: Exportação rápida de dados
  - `Ctrl+E` / `⌘E`: Abrir modal de exportação
  - `Ctrl+,` / `⌘,`: Acessar configurações
  - `Esc`: Fechar modais e diálogos

## Considerações Técnicas

### Formato de Dados
- As tarefas são armazenadas com atributos como `id`, `nome`, `data`, `horas`, `minutos`, `cluster` e `horasTotal`
- Datas são armazenadas no formato brasileiro (DD/MM/YYYY) para exibição, mas também mantidas como objetos Date para filtragem
- Cálculos de tempo incluem conversão entre horas e minutos para facilitar a entrada de dados

### Manipulação de Datas
- O sistema gerencia diferentes formatos de data:
  - Entrada: formato YYYY-MM-DD (formato padrão de input date HTML)
  - Armazenamento: formato DD/MM/YYYY (padrão brasileiro) como string
  - Filtragem: objetos Date para comparações e cálculos
- A compatibilidade entre esses formatos é gerenciada pelo TaskContext

### Geração de Relatórios
- Suporte para exportação de relatórios em PDF
- Visualização de dados agrupados por cluster
- Filtros por período para análise de produtividade

### Sistema de Atalhos
- **Interceptação de eventos**: Uso de capture phase para máxima prioridade
- **Prevenção de conflitos**: Detecção inteligente de campos de entrada ativos
- **Compatibilidade multiplataforma**: Suporte automático para Ctrl (Windows/Linux) e ⌘ (macOS)
- **Feedback imediato**: Notificações visuais temporárias para confirmar ações
- **Persistência de preferências**: Controle de exibição de tooltips via localStorage
- **Tratamento de erros**: Logs detalhados e recuperação graceful de falhas

## Desafios Resolvidos
- **Manipulação de Datas**: Implementação de conversões consistentes entre formatos de data
- **UI Adaptativa**: Interface que funciona em vários dispositivos e tamanhos de tela
- **Persistência de Dados**: Armazenamento seguro de dados no localStorage com backup/restauração
- **Gerenciamento de Temas**: Suporte completo para temas claro e escuro
- **Sistema de Atalhos**: Implementação robusta que previne conflitos com navegador e campos de entrada
- **Experiência Multiplataforma**: Detecção automática e formatação adequada para Windows/Linux/macOS
- **Feedback de Interação**: Sistema de notificações não-intrusivo para ações via atalhos

## Extensibilidade

A arquitetura permite fácil extensão para:
- Adicionar novos tipos de visualizações
- Implementar sincronização com um backend
- Adicionar recursos como notificações ou integração com calendários
- Criar relatórios personalizados para diferentes períodos 
- **Expandir sistema de atalhos**: Fácil adição de novos atalhos via configuração do hook
- **Personalização de atalhos**: Implementar preferências de usuário para redefinir atalhos
- **Atalhos contextuais**: Adicionar atalhos específicos para diferentes seções/modais
- **Integração com acessibilidade**: Expandir suporte para tecnologias assistivas 