import React from 'react';
import { Plus } from 'lucide-react';

const EmptyState = ({ onAddTask }) => {
  return (
    <div className="text-center py-8 sm:py-12 flex flex-col sm:flex-row items-center justify-center gap-8">
      <div className="inline-block bg-secondary p-3 sm:p-4 rounded-full">
        <svg width="60" height="60" viewBox="0 0 800 600" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <g transform="matrix(1,0,0,1,-100,-100)">
              <g transform="matrix(1,0,0,1,0,46.064)">
                  <g transform="matrix(1,0,0,1,0,-46.064)">
                      <g transform="matrix(1.08333,0,0,1.08333,23.3333,23.3333)">
                          <path d="M392.7,53.936C585.4,53.936 741.4,209.9 741.4,392.7C741.4,585.4 585.4,741.4 392.7,741.4C200,741.4 44,585.4 44,392.7C44,209.9 200,53.936 392.7,53.936Z" style={{fill: 'var(--border)'}}/>
                      </g>
                      <g transform="matrix(1.08333,0,0,1.08333,23.3333,23.3333)">
                          <path d="M392.7,83.436C569.1,83.436 711.9,226.2 711.9,392.7C711.9,569.1 569.1,711.9 392.7,711.9C226.2,711.9 83.4,569.1 83.4,392.7C83.4,226.2 226.2,83.436 392.7,83.436Z" style={{fill: 'var(--background)'}}/>
                      </g>
                      <g transform="matrix(1.08333,0,0,1.08333,23.3333,23.3333)">
                          <path d="M392.7,83.436L392.7,392.7L585.4,392.7C585.4,226.2 489.1,83.436 392.7,83.436Z" style={{fill: 'var(--border)'}}/>
                      </g>
                      <g transform="matrix(1.08333,0,0,1.08333,23.3333,23.3333)">
                          <path d="M392.7,392.7L392.7,83.436C226.2,83.436 83.4,226.2 83.4,392.7L392.7,392.7Z" style={{fill: 'var(--muted)'}}/>
                      </g>
                      <g transform="matrix(1.08333,0,0,1.08333,23.3333,23.3333)">
                          <path d="M392.7,392.7L83.4,392.7C83.4,569.1 226.2,711.9 392.7,711.9L392.7,392.7Z" style={{fill: 'var(--muted)'}}/>
                      </g>
                      <g transform="matrix(1.08333,0,0,1.08333,23.3333,23.3333)">
                          <path d="M392.7,392.7L392.7,711.9C569.1,711.9 711.9,569.1 711.9,392.7L392.7,392.7Z" style={{fill: 'var(--border)'}}/>
                      </g>
                      <g transform="matrix(1.08333,0,0,1.08333,23.3333,23.3333)">
                          <path d="M392.7,53.936C200,53.936 44,209.9 44,392.7C44,399.7 44.4,406.7 45.2,413.5L392.7,413.5L392.7,53.936Z" style={{fill: 'var(--muted)'}}/>
                      </g>
                      <g transform="matrix(1.08333,0,0,1.08333,23.3333,23.3333)">
                          <path d="M413.5,392.7L413.5,45.2C406.7,44.4 399.7,44 392.7,44C209.9,44 53.9,200 53.9,392.7L413.5,392.7Z" style={{fill: 'var(--border)'}}/>
                      </g>
                      <g transform="matrix(1.08333,0,0,1.08333,23.3333,23.3333)">
                          <path d="M392.7,741.4C585.4,741.4 741.4,585.4 741.4,392.7C741.4,385.7 741,378.7 740.2,371.9L392.7,371.9L392.7,741.4Z" style={{fill: 'var(--border)'}}/>
                      </g>
                      <g transform="matrix(1.08333,0,0,1.08333,23.3333,23.3333)">
                          <path d="M371.9,392.7L371.9,740.2C378.7,741 385.7,741.4 392.7,741.4C585.4,741.4 741.4,585.4 741.4,392.7L371.9,392.7Z" style={{fill: 'var(--muted)'}}/>
                      </g>
                      <g transform="matrix(1.08333,0,0,1.08333,23.3333,23.3333)">
                          <circle cx="392.7" cy="392.7" r="29.5" style={{fill: 'var(--primary)'}}/>
                      </g>
                  </g>
              </g>
          </g>
      </svg>
      </div>
      <div className="text-center sm:text-left">
        <h3 className="text-lg font-medium mt-4">Nenhuma tarefa registrada</h3>
        <p className="text-muted-foreground mt-2">Comece a registrar suas tarefas para ver seu progresso.</p>
        <button 
          onClick={onAddTask}
          className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center gap-2 mx-auto sm:mx-0"
        >
          <Plus size={16} />
          Adicionar Tarefa
        </button>
      </div>
    </div>
  );
};

export default EmptyState;