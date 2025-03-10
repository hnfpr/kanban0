import React, { useState, useRef } from 'react';

function TaskModal({ isOpen, onClose, onSave, initialData = {} }) {
  const [taskData, setTaskData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    tags: initialData.tags || [],
    subtasks: initialData.subtasks || [],
    attachments: initialData.attachments || [],
    comments: initialData.comments || [],
    dueDate: initialData.dueDate || ''
  });

  const [activeTab, setActiveTab] = useState('todo');
  const [newSubtask, setNewSubtask] = useState('');
  const [newTag, setNewTag] = useState('');
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTaskData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    if (!taskData.title.trim()) return;
    onSave(taskData);
    onClose();
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    setTaskData(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, { id: Date.now().toString(), text: newSubtask, completed: false }]
    }));
    setNewSubtask('');
  };

  const handleToggleSubtask = (id) => {
    setTaskData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  const handleRemoveSubtask = (id) => {
    setTaskData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(task => task.id !== id)
    }));
  };

  const handleAddTag = () => {
    if (!newTag.trim() || taskData.tags.includes(newTag)) return;
    setTaskData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag]
    }));
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setTaskData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const newAttachments = files.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type
    }));

    setTaskData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
  };

  const calculateSubtaskProgress = () => {
    if (taskData.subtasks.length === 0) return 0;
    const completedCount = taskData.subtasks.filter(task => task.completed).length;
    return (completedCount / taskData.subtasks.length) * 100;
  };

  if (!isOpen) return null;

  return (
    <div className="task-modal-overlay">
      <div className="task-modal">
        <div className="task-modal-header">
          <h2>{initialData.title ? 'Edit task' : 'Add new task'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="task-modal-content">
          <div className="task-modal-main">
            <input
              type="text"
              name="title"
              value={taskData.title}
              onChange={handleChange}
              placeholder="Task Title"
              className="task-title-input"
              autoFocus
            />
            
            <textarea
              name="description"
              value={taskData.description}
              onChange={handleChange}
              placeholder="Add Description"
              className="task-description-input"
            />
          </div>
          
          <div className="task-modal-actions">
            <div className="action-buttons">
              <button 
                className={`action-button ${activeTab === 'attach' ? 'active' : ''}`}
                onClick={() => setActiveTab('attach')}
              >
                <span>📎</span> Attach
              </button>
              <button 
                className={`action-button ${activeTab === 'todo' ? 'active' : ''}`}
                onClick={() => setActiveTab('todo')}
              >
                <span>✓</span> Todo
              </button>
              <button 
                className={`action-button ${activeTab === 'tag' ? 'active' : ''}`}
                onClick={() => setActiveTab('tag')}
              >
                <span>🏷️</span> Tag
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'attach' && (
                <div className="attach-tab">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    onChange={handleFileChange}
                    multiple
                  />
                  <button className="file-browser-button" onClick={handleFileSelect}>
                    Browse Files
                  </button>
                  
                  {taskData.attachments.length > 0 && (
                    <div className="attachments-list">
                      <h4>Attachments ({taskData.attachments.length})</h4>
                      <ul>
                        {taskData.attachments.map(attachment => (
                          <li key={attachment.id} className="attachment-item">
                            <span className="attachment-name">{attachment.name}</span>
                            <button 
                              className="remove-button"
                              onClick={() => setTaskData(prev => ({
                                ...prev,
                                attachments: prev.attachments.filter(a => a.id !== attachment.id)
                              }))}
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'todo' && (
                <div className="todo-tab">
                  <div className="subtask-input-container">
                    <input
                      type="text"
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      placeholder="Add a subtask"
                      className="subtask-input"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                    />
                    <button className="add-subtask-button" onClick={handleAddSubtask}>Add</button>
                  </div>
                  
                  {taskData.subtasks.length > 0 && (
                    <div className="subtasks-list">
                      <div className="subtasks-header">
                        <h4>Subtasks</h4>
                        <span className="subtasks-counter">
                          {taskData.subtasks.filter(task => task.completed).length}/{taskData.subtasks.length} completed
                        </span>
                      </div>
                      
                      <div className="subtasks-progress">
                        <div 
                          className="subtasks-progress-bar" 
                          style={{ width: `${calculateSubtaskProgress()}%` }}
                        ></div>
                      </div>
                      
                      <ul>
                        {taskData.subtasks.map(subtask => (
                          <li key={subtask.id} className="subtask-item">
                            <label className="subtask-label">
                              <input
                                type="checkbox"
                                checked={subtask.completed}
                                onChange={() => handleToggleSubtask(subtask.id)}
                              />
                              <span className={subtask.completed ? 'completed' : ''}>{subtask.text}</span>
                            </label>
                            <button 
                              className="remove-button"
                              onClick={() => handleRemoveSubtask(subtask.id)}
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'tag' && (
                <div className="tag-tab">
                  <div className="tag-input-container">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      className="tag-input"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <button className="add-tag-button" onClick={handleAddTag}>Add</button>
                  </div>
                  
                  {taskData.tags.length > 0 && (
                    <div className="tags-list">
                      {taskData.tags.map((tag, index) => (
                        <div key={index} className="tag-badge">
                          <span>{tag}</span>
                          <button 
                            className="remove-tag-button"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="action-footer">
              <button className="cancel-button" onClick={onClose}>Cancel</button>
              <button className="create-button" onClick={handleSave}>
                {initialData.title ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskModal;