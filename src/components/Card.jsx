import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

function Card({ card, index, onClick }) {
  // Calculate subtask completion percentage
  const subtasksCompleted = card.subtasks ? card.subtasks.filter(task => task.completed).length : 0;
  const subtasksTotal = card.subtasks ? card.subtasks.length : 0;
  const subtasksPercentage = subtasksTotal > 0 ? (subtasksCompleted / subtasksTotal) * 100 : 0;
  
  const handleClick = (e) => {
    // Prevent click from interfering with drag operations
    if (onClick) {
      onClick(card);
    }
  };
  
  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided) => (
        <div
          className="card"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={handleClick}
        >
          <h4 className="card-title">{card.title}</h4>
          
          {card.description && (
            <p className="card-description">{card.description}</p>
          )}
          
          {subtasksTotal > 0 && (
            <div className="subtasks-container">
              <div className="subtasks-info">
                <span>{subtasksCompleted}/{subtasksTotal} subtasks</span>
              </div>
              <div className="subtasks-progress">
                <div 
                  className="subtasks-progress-bar" 
                  style={{ width: `${subtasksPercentage}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Display tags at the top, left-aligned */}
          {card.tags && card.tags.length > 0 && (
            <div className="card-tags">
              {card.tags.map((tag, i) => (
                <span key={i} className={`card-tag ${tag.toLowerCase()}`}>
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="card-footer">
            <div className="card-stats">
              {card.comments && card.comments.length > 0 && (
                <div className="card-stat">
                  <span>💬</span>
                  <span>{card.comments.length}</span>
                </div>
              )}
              
              {card.attachments && card.attachments.length > 0 && (
                <div className="card-stat">
                  <span>📎</span>
                  <span>{card.attachments.length}</span>
                </div>
              )}
            </div>
            
            <div className="card-due-date">
              {card.dueDate && (
                <span>{new Date(card.dueDate).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default Card;