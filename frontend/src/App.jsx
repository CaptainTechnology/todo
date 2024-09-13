import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { BsCheckLg } from 'react-icons/bs';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/todos`;

function App() {
  const [isCompleteScreen, setIsCompleteScreen] = useState(false);
  const [allTodos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [completedTodos, setCompletedTodos] = useState([]);
  const [currentEdit, setCurrentEdit] = useState("");
  const [currentEditedItem, setCurrentEditedItem] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(false); // New state to trigger refresh

  // Fetch todos whenever refreshTrigger changes
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await axios.get(API_URL);
        setTodos(response.data);
      } catch (error) {
        console.error('Error fetching todos:', error);
      }
    };

    fetchTodos();
  }, [refreshTrigger]); // Dependency array includes refreshTrigger

  const handleAddTodo = async () => {
    try {
      const newTodoItem = { title: newTitle, description: newDescription };
      const response = await axios.post(API_URL, newTodoItem);
      setTodos([...allTodos, response.data]);
      setNewTitle('');
      setNewDescription('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setRefreshTrigger(prev => !prev); // Toggle the refreshTrigger to fetch updated list
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleComplete = async (id) => {
    try {
      const now = new Date();
      const completedOn = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()} at ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
      const todoToComplete = allTodos.find(todo => todo._id === id);
      const updatedTodo = { ...todoToComplete, completedOn };

      // Update local state immediately
      setTodos(allTodos.map(todo => (todo._id === id ? updatedTodo : todo)));

      // Send update request to the backend
      await axios.put(`${API_URL}/${id}`, updatedTodo);

      // Toggle the refreshTrigger to fetch updated list
      setRefreshTrigger(prev => !prev);

    } catch (error) {
      console.error('Error completing todo:', error);
    }
  };

  const handleEdit = (id, item) => {
    setCurrentEdit(id);
    setCurrentEditedItem(item);
  };

  const handleUpdateTitle = (value) => {
    setCurrentEditedItem(prev => ({ ...prev, title: value }));
  };

  const handleUpdateDescription = (value) => {
    setCurrentEditedItem(prev => ({ ...prev, description: value }));
  };

  const handleUpdateToDo = async () => {
    try {
      await axios.put(`${API_URL}/${currentEdit}`, currentEditedItem);
      setTodos(allTodos.map(todo => (todo._id === currentEdit ? currentEditedItem : todo)));
      setCurrentEdit("");
      // Trigger refresh to ensure the list is up-to-date
      setRefreshTrigger(prev => !prev);
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  return (
    <div className="App">
      <h1>My Todos</h1>

      <div className="todo-wrapper">
        <div className="todo-input">
          <div className="todo-input-item">
            <label>Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="What's the task title?"
            />
          </div>
          <div className="todo-input-item">
            <label>Description</label>
            <input
              type="text"
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              placeholder="What's the task description?"
            />
          </div>
          <div className="todo-input-item">
            <button
              type="button"
              onClick={handleAddTodo}
              className="primaryBtn"
            >
              Add
            </button>
          </div>
        </div>

        <div className="btn-area">
          <button
            className={`secondaryBtn ${!isCompleteScreen && 'active'}`}
            onClick={() => setIsCompleteScreen(false)}
          >
            Todo
          </button>
          <button
            className={`secondaryBtn ${isCompleteScreen && 'active'}`}
            onClick={() => setIsCompleteScreen(true)}
          >
            Completed
          </button>
        </div>

        <div className="todo-list">
          {!isCompleteScreen &&
            allTodos.map((item) => {
              if (currentEdit === item._id) {
                return (
                  <div className='edit__wrapper' key={item._id}>
                    <input
                      placeholder='Updated Title'
                      onChange={(e) => handleUpdateTitle(e.target.value)}
                      value={currentEditedItem.title}
                    />
                    <textarea
                      placeholder='Updated Description'
                      rows={4}
                      onChange={(e) => handleUpdateDescription(e.target.value)}
                      value={currentEditedItem.description}
                    />
                    <button
                      type="button"
                      onClick={handleUpdateToDo}
                      className="primaryBtn"
                    >
                      Update
                    </button>
                  </div>
                );
              } else {
                if (!item.completedOn) {
                  return (
                    <div className="todo-list-item" key={item._id}>
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.description}</p>
                      </div>
                      <div>
                        <AiOutlineDelete
                          className="icon"
                          onClick={() => handleDeleteTodo(item._id)}
                          title="Delete?"
                        />
                        <BsCheckLg
                          className="check-icon"
                          onClick={() => handleComplete(item._id)}
                          title="Complete?"
                        />
                        <AiOutlineEdit
                          className="check-icon"
                          onClick={() => handleEdit(item._id, item)}
                          title="Edit?"
                        />
                      </div>
                    </div>
                  );
                }
              }
            })}

          {isCompleteScreen &&
            allTodos.map((item) => {
              if (item.completedOn) {
                return (
                  <div className="todo-list-item" key={item._id}>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                      <p><small>Completed on: {item.completedOn}</small></p>
                    </div>
                    <div>
                      <AiOutlineDelete
                        className="icon"
                        onClick={() => handleDeleteTodo(item._id)}
                        title="Delete?"
                      />
                    </div>
                  </div>
                );
              }
            })}
        </div>
      </div>
    </div>
  );
}

export default App;
