import { useState, useEffect, useRef } from 'react'
import { DragDropContext, Droppable } from 'react-beautiful-dnd'
import { v4 as uuidv4 } from 'uuid'
import { saveAs } from 'file-saver'
import './App.css'
import Board from './components/Board'
import TaskModal from './components/TaskModal'
import BoardModal from './components/BoardModal'

function App() {
  // Initial board data
  const initialBoards = [
    {
      id: 'board-1',
      title: 'To-do',
      cards: []
    },
    {
      id: 'board-2',
      title: 'In Progress',
      cards: []
    },
    {
      id: 'board-3',
      title: 'Review Ready',
      cards: []
    },
    {
      id: 'board-4',
      title: 'Completed',
      cards: []
    }
  ]

  // State for boards and cards
  const [boards, setBoards] = useState(initialBoards)
  const [timer, setTimer] = useState('0:00:00')
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isBoardModalOpen, setIsBoardModalOpen] = useState(false)
  const [currentBoardId, setCurrentBoardId] = useState(null)
  const [currentCard, setCurrentCard] = useState(null)
  const [currentBoard, setCurrentBoard] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showScrollIndicators, setShowScrollIndicators] = useState(false)
  const menuRef = useRef(null)
  
  // Timer state and controls
  const [seconds, setSeconds] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(true)
  const [timerInput, setTimerInput] = useState('')
  const [isEditingTimer, setIsEditingTimer] = useState(false)
  const boardsContainerRef = useRef(null)
  
  // Update timer
  useEffect(() => {
    let interval
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => {
          const newSeconds = prevSeconds + 1
          const hours = Math.floor(newSeconds / 3600)
          const minutes = Math.floor((newSeconds % 3600) / 60)
          const secs = newSeconds % 60
          setTimer(`${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`)
          return newSeconds
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])
  
  // Handle timer play/pause
  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning)
  }
  
  // Handle timer reset
  const resetTimer = () => {
    setSeconds(0)
    setTimer('0:00:00')
    setIsTimerRunning(true)
  }
  
  // Handle timer edit
  const handleTimerEdit = () => {
    setIsEditingTimer(true)
    setTimerInput(timer)
  }
  
  // Handle timer input change
  const handleTimerInputChange = (e) => {
    setTimerInput(e.target.value)
  }
  
  // Handle timer input submit
  const handleTimerInputSubmit = (e) => {
    e.preventDefault()
    const timePattern = /^(\d+):(\d{2}):(\d{2})$/
    const match = timerInput.match(timePattern)
    
    if (match) {
      const hours = parseInt(match[1])
      const minutes = parseInt(match[2])
      const secs = parseInt(match[3])
      
      if (minutes < 60 && secs < 60) {
        const totalSeconds = hours * 3600 + minutes * 60 + secs
        setSeconds(totalSeconds)
        setTimer(timerInput)
        setIsEditingTimer(false)
      }
    } else {
      // If invalid format, revert to current timer
      setTimerInput(timer)
      setIsEditingTimer(false)
    }
  }
  
  // Handle horizontal scroll with mouse wheel
  useEffect(() => {
    const handleWheel = (e) => {
      if (boardsContainerRef.current) {
        if (e.deltaY !== 0) {
          e.preventDefault()
          boardsContainerRef.current.scrollLeft += e.deltaY
        }
      }
    }
    
    const boardsContainer = boardsContainerRef.current
    if (boardsContainer) {
      boardsContainer.addEventListener('wheel', handleWheel, { passive: false })
    }
    
    return () => {
      if (boardsContainer) {
        boardsContainer.removeEventListener('wheel', handleWheel)
      }
    }
  }, [boardsContainerRef])
  
  // Check if scroll indicators should be shown
  useEffect(() => {
    const checkScrollIndicators = () => {
      if (boardsContainerRef.current) {
        const container = boardsContainerRef.current
        // Compare scrollWidth (total width including overflow) with clientWidth (visible width)
        setShowScrollIndicators(container.scrollWidth > container.clientWidth)
      }
    }
    
    // Check initially
    checkScrollIndicators()
    
    // Check on resize
    window.addEventListener('resize', checkScrollIndicators)
    
    // Create a MutationObserver to watch for changes to the boards container
    const observer = new MutationObserver(checkScrollIndicators)
    
    if (boardsContainerRef.current) {
      observer.observe(boardsContainerRef.current, { 
        childList: true, // Watch for changes to child elements
        subtree: true,   // Watch the entire subtree
        attributes: true // Watch for attribute changes
      })
    }
    
    return () => {
      window.removeEventListener('resize', checkScrollIndicators)
      observer.disconnect()
    }
  }, [boards]) // Re-run when boards change
  
  // Scroll board container left/right
  const scrollBoards = (direction) => {
    if (boardsContainerRef.current) {
      const scrollAmount = 300 // Adjust scroll amount as needed
      const currentScroll = boardsContainerRef.current.scrollLeft
      
      boardsContainerRef.current.scrollTo({
        left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  // Handle drag and drop
  const onDragEnd = (result) => {
    const { destination, source, type } = result

    // If there's no destination or the item is dropped back to its original position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return
    }

    // If dragging boards
    if (type === 'board') {
      const newBoards = [...boards]
      const [removed] = newBoards.splice(source.index, 1)
      newBoards.splice(destination.index, 0, removed)
      setBoards(newBoards)
      return
    }

    // If dragging cards
    const sourceBoard = boards.find(board => board.id === source.droppableId)
    const destBoard = boards.find(board => board.id === destination.droppableId)
    
    // If source or destination board not found
    if (!sourceBoard || !destBoard) return

    // If moving within the same board
    if (source.droppableId === destination.droppableId) {
      const newCards = [...sourceBoard.cards]
      const [removed] = newCards.splice(source.index, 1)
      newCards.splice(destination.index, 0, removed)
      
      const newBoards = boards.map(board => {
        if (board.id === sourceBoard.id) {
          return { ...board, cards: newCards }
        }
        return board
      })
      
      setBoards(newBoards)
    } else {
      // Moving from one board to another
      const sourceCards = [...sourceBoard.cards]
      const [removed] = sourceCards.splice(source.index, 1)
      const destCards = [...destBoard.cards]
      destCards.splice(destination.index, 0, removed)
      
      const newBoards = boards.map(board => {
        if (board.id === sourceBoard.id) {
          return { ...board, cards: sourceCards }
        }
        if (board.id === destBoard.id) {
          return { ...board, cards: destCards }
        }
        return board
      })
      
      setBoards(newBoards)
    }
  }

  // Add a new board
  const addBoard = () => {
    setCurrentBoard(null);
    setIsBoardModalOpen(true);
  }

  // Handle save from board modal
  const handleSaveBoard = (boardData) => {
    if (currentBoard) {
      // Editing an existing board
      const newBoards = boards.map(board => {
        if (board.id === currentBoard.id) {
          return { ...board, title: boardData.title };
        }
        return board;
      });
      setBoards(newBoards);
    } else {
      // Creating a new board
      const newBoard = {
        id: `board-${uuidv4()}`,
        title: boardData.title,
        cards: []
      };
      setBoards([...boards, newBoard]);
    }
    
    // Reset current board after saving
    setCurrentBoard(null);
  }

  // Add a new card to a board or edit existing card
  const addCard = (boardId, title = 'New Task') => {
    setCurrentBoardId(boardId);
    setCurrentCard(null); // Reset current card when adding a new one
    setIsTaskModalOpen(true);
  }
  
  // Handle card click for editing
  const handleCardClick = (boardId, card) => {
    setCurrentBoardId(boardId);
    setCurrentCard(card);
    setIsTaskModalOpen(true);
  }

  // Handle save from task modal
  const handleSaveTask = (taskData) => {
    if (currentCard) {
      // Editing an existing card
      const newBoards = boards.map(board => {
        if (board.id === currentBoardId) {
          const updatedCards = board.cards.map(card => {
            if (card.id === currentCard.id) {
              return {
                ...card,
                title: taskData.title,
                description: taskData.description || '',
                tags: taskData.tags || [],
                attachments: taskData.attachments || [],
                comments: taskData.comments || [],
                subtasks: taskData.subtasks || [],
                dueDate: taskData.dueDate || '',
                updatedAt: new Date().toISOString()
              };
            }
            return card;
          });
          return { ...board, cards: updatedCards };
        }
        return board;
      });
      setBoards(newBoards);
    } else {
      // Creating a new card
      const newCard = {
        id: `card-${uuidv4()}`,
        title: taskData.title,
        description: taskData.description || '',
        tags: taskData.tags || [],
        attachments: taskData.attachments || [],
        comments: taskData.comments || [],
        subtasks: taskData.subtasks || [],
        dueDate: taskData.dueDate || '',
        createdAt: new Date().toISOString()
      };

      const newBoards = boards.map(board => {
        if (board.id === currentBoardId) {
          return { ...board, cards: [...board.cards, newCard] };
        }
        return board;
      });

      setBoards(newBoards);
    }
    
    // Reset current card after saving
    setCurrentCard(null)
  }

  // Export boards data to a .kanban0 file
  const exportData = () => {
    const data = JSON.stringify(boards, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    saveAs(blob, `kanban0-export-${new Date().toISOString().slice(0, 10)}.kanban0`)
    setIsMenuOpen(false)
  }

  // Export boards as image (placeholder function)
  const exportAsImage = () => {
    alert('Export as image functionality coming soon')
    setIsMenuOpen(false)
  }

  // Reset all boards
  const resetBoards = () => {
    setBoards(initialBoards)
    setIsMenuOpen(false)
  }

  // Import boards data from a .kanban0 file
  const importData = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedBoards = JSON.parse(e.target.result)
        setBoards(importedBoards)
      } catch (error) {
        console.error('Error importing file:', error)
        alert('Invalid file format. Please select a valid .kanban0 file.')
      }
    }
    reader.readAsText(file)
    setIsMenuOpen(false)
  }
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuRef])

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-container">
          <div className="burger-menu-container" ref={menuRef}>
            <div className="burger-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>☰</div>
            {isMenuOpen && (
              <div className="dropdown-menu">
                <label className="dropdown-item">
                  <span>📁 Open</span>
                  <input 
                    type="file" 
                    accept=".kanban0" 
                    onChange={importData} 
                    style={{ display: 'none' }} 
                  />
                </label>
                <button className="dropdown-item" onClick={exportData}>
                  <span>💾 Save to...</span>
                </button>
                <button className="dropdown-item" onClick={exportAsImage}>
                  <span>🖼️ Export as image to...</span>
                </button>
                <button className="dropdown-item" onClick={resetBoards}>
                  <span>🗑️ Reset all Board</span>
                </button>
              </div>
            )}
          </div>
          <h1>Kanban0</h1>
        </div>
        <div className="timer-container">
          {isEditingTimer ? (
            <form onSubmit={handleTimerInputSubmit}>
              <input
                type="text"
                className="timer-input"
                value={timerInput}
                onChange={handleTimerInputChange}
                autoFocus
                onBlur={handleTimerInputSubmit}
              />
            </form>
          ) : (
            <div className="timer" onClick={handleTimerEdit}>{timer}</div>
          )}
          <div className="timer-controls">
            <button className="timer-button" onClick={toggleTimer}>
              {isTimerRunning ? '⏸' : '▶️'}
            </button>
            <button className="timer-button" onClick={resetTimer}>⟲</button>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={addBoard}>Add Board</button>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        {showScrollIndicators && (
          <>
            <div className="scroll-indicator scroll-left" onClick={() => scrollBoards('left')}>◀</div>
            <div className="scroll-indicator scroll-right" onClick={() => scrollBoards('right')}>▶</div>
          </>
        )}
        <Droppable droppableId="all-boards" direction="horizontal" type="board">
          {(provided) => (
            <div 
              className="boards-container"
              {...provided.droppableProps}
              ref={(el) => {
                provided.innerRef(el);
                boardsContainerRef.current = el;
              }}
            >
              {boards.map((board, index) => (
                <Board 
                  key={board.id} 
                  board={board} 
                  index={index} 
                  addCard={addCard} 
                  onCardClick={handleCardClick}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      {/* Task Modal */}
      <TaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        onSave={handleSaveTask} 
        initialData={currentCard || {}}
      />
      {/* Board Modal */}
      <BoardModal
        isOpen={isBoardModalOpen}
        onClose={() => setIsBoardModalOpen(false)}
        onSave={handleSaveBoard}
        initialData={currentBoard || {}}
      />
    </div>
  )
}

export default App
