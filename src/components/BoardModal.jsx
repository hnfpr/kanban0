import React, { useState } from 'react';

function BoardModal({ isOpen, onClose, onSave, initialData = {} }) {
  const [boardData, setBoardData] = useState({
    title: initialData.title || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBoardData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    if (!boardData.title.trim()) return;
    onSave(boardData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="task-modal-overlay">
      <div className="board-modal">
        <div className="task-modal-header">
          <h2>{initialData.title ? 'Edit board' : 'Add new board'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="task-modal-content">
          <div className="task-modal-main">
            <input
              type="text"
              name="title"
              value={boardData.title}
              onChange={handleChange}
              placeholder="Board Title"
              className="task-title-input"
              autoFocus
            />
          </div>
          
          <div className="task-modal-footer">
            <button className="cancel-button" onClick={onClose}>Cancel</button>
            <button className="save-button" onClick={handleSave}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BoardModal;