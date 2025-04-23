# Arquitetura do Trackerly

Este documento descreve a arquitetura e organização do código do aplicativo Trackerly, um rastreador de tempo para projetos.

## Visão Geral da Aplicação

Trackerly é uma aplicação React single-page que permite aos usuários rastrear o tempo gasto em diferentes tarefas e projetos. A aplicação utiliza o armazenamento local do navegador (localStorage) para persistência de dados e foi construída com React, Tailwind CSS e outras bibliotecas modernas.

## Estrutura de Diretórios

```
trackerly/
├── public/               # Arquivos estáticos
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

### Componentes (`/src/components/`)

#### `Header.js`
- Exibe o cabeçalho da aplicação
- Fornece opções para alternar entre modo claro e escuro

#### `TaskFilters.js`
- Permite filtrar tarefas por visualização (diária, semanal, mensal)
- Controles de navegação para períodos (anterior/próximo)

#### `TaskStats.js`
- Exibe estatísticas de horas utilizadas
- Mostra gráficos de distribuição de tempo por cluster
- Apresenta projeções de tempo com base no progresso atual

#### `TaskList.js`
- Lista as tarefas filtradas pelo período atual
- Fornece opções para expandir/colapsar a lista
- Integra o modal para adicionar novas tarefas

#### `TaskItem.js`
- Exibe uma tarefa individual na lista
- Fornece botões para editar e excluir tarefas
- Mostra informações como nome, data, duração e cluster

#### `TaskForm.js`
- Formulário para adicionar ou editar tarefas
- Validação de entrada e processamento de dados
- Suporte para edição de tarefas existentes

#### `ActionButtons.js`
- Botões para ações como exportar/importar dados
- Opções para reiniciar filtros e outras funcionalidades avançadas

## Gerenciamento de Estado

### Context API (`/src/contexts/`)

#### `TaskContext.js`
- Gerencia o estado global das tarefas
- Fornece funções para adicionar, editar e remover tarefas
- Armazena e recupera dados do localStorage
- Processa os formatos de data para garantir consistência
- Lida com a importação e exportação de dados

## Custom Hooks (`/src/hooks/`)

#### `useTheme.js`
- Gerencia o tema da aplicação (claro/escuro)
- Persiste a preferência do usuário

#### `useTaskFilters.js`
- Implementa a lógica de filtragem de tarefas
- Gerencia a navegação entre períodos
- Calcula estatísticas como horas utilizadas e disponíveis

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

### 4. Tema e UI
- **Alternância de Tema**: `Header.js`, `useTheme.js`
- **Layout Responsivo**: Implementado com Tailwind CSS em todos os componentes

## Considerações Técnicas

### Formato de Dados
- As tarefas são armazenadas com atributos como `id`, `nome`, `data`, `horas`, `minutos`, `cluster` e `horasTotal`
- Datas são armazenadas no formato brasileiro (DD/MM/YYYY) para exibição, mas também mantidas como objetos Date para filtragem

### Desafios Resolvidos
- **Manipulação de Datas**: Implementação de conversões consistentes entre formatos de data
- **UI Adaptativa**: Interface que funciona em vários dispositivos e tamanhos de tela
- **Persistência de Dados**: Armazenamento seguro de dados no localStorage com backup/restauração

## Extensibilidade

A arquitetura permite fácil extensão para:
- Adicionar novos tipos de visualizações
- Implementar sincronização com um backend
- Adicionar recursos como notificações ou integração com calendários 