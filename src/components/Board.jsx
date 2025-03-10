import { useState } from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import Card from './Card';

function Board({ board, index, addCard, onCardClick }) {
  // We no longer need the local state for adding cards
  // as we'll directly open the TaskModal
  
  const handleAddCard = () => {
    // Directly call addCard with the board ID
    // This will open the TaskModal in the parent component
    addCard(board.id);
  };

  return (
    <Draggable draggableId={board.id} index={index}>
      {(provided) => (
        <div
          className="board"
          {...provided.draggableProps}
          ref={provided.innerRef}
        >
          <div className="board-header" {...provided.dragHandleProps}>
            <h3 className="board-title">
              {board.title}
              <span className="board-title-count">{board.cards.length}</span>
            </h3>
            <div className="board-actions">
              <button onClick={handleAddCard}>+</button>
            </div>
          </div>
          
          <Droppable droppableId={board.id} type="card">
            {(provided) => (
              <div
                className="board-content"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {board.cards.length === 0 ? (
                  <div className="empty-board">
                    <p>No tasks currently. Board is empty</p>
                    <button 
                      className="create-task-button"
                      onClick={handleAddCard}
                    >
                      Create Task
                    </button>
                  </div>
                ) : (
                  <>
                    {board.cards.map((card, cardIndex) => (
                      <Card 
                        key={card.id} 
                        card={card} 
                        index={cardIndex} 
                        onClick={() => onCardClick(board.id, card)}
                      />
                    ))}
                  </>
                )}
                
                {board.cards.length > 0 && (
                  <div 
                    className="add-card-button"
                    onClick={handleAddCard}
                  >
                    + Add Task
                  </div>
                )}
                
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      )}
    </Draggable>
  );
}

export default Board;