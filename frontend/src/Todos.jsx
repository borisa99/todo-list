import { useState, useEffect, useCallback } from "react";
import makeStyles from "@mui/styles/makeStyles";
import {
  Container,
  Typography,
  Paper,
  Box,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import TodoItem from "./components/TodoItem";
import TodoForm from "./components/TodoForm/TodoForm";

import { getTodos, updateTodo, deleteTodo, updateTodoOrder } from "./api/todo";
const useStyles = makeStyles({
  addTodoContainer: { padding: 10 },
  addTodoButton: { marginLeft: 5 },
  todosContainer: {
    marginTop: 10,
    padding: 10,
    overflowY: "scroll",
    height: "70vh",
  },
});

function Todos() {
  const classes = useStyles();

  const [todos, setTodos] = useState([]);
  const [todosTotalCount, setTodosTotalCount] = useState(0);
  const [showToday, setShowToday] = useState(false);
  const [offset, setOffset] = useState(0);
  const [count, setCount] = useState(null);

  const fetchTodos = useCallback(
    (offset) => {
      getTodos(showToday, offset).then(({ data, totalCount }) => {
        setCount(totalCount);
        setTodos((prev) => {
          const newTodos = [...prev, ...data];
          setTodosTotalCount(newTodos.length);
          return newTodos;
        });
      });
    },
    [showToday]
  );

  useEffect(() => {
    fetchTodos(offset);
  }, [offset, fetchTodos]);

  function toggleTodoCompleted(id) {
    const todo = todos.find((todo) => todo.id === id).completed;
    updateTodo(id, !todo.completed).then(() => {
      const newTodos = [...todos];
      const modifiedTodoIndex = newTodos.findIndex((todo) => todo.id === id);
      newTodos[modifiedTodoIndex] = {
        ...newTodos[modifiedTodoIndex],
        completed: !newTodos[modifiedTodoIndex].completed,
      };
      setTodos(newTodos);
    });
  }

  function deleteTodoById(id, order) {
    deleteTodo(id, order, todos.length).then((nextTodo) => {
      const filterdOutTodos = [...todos].filter((todo) => todo.id !== id);
      if (nextTodo) {
        filterdOutTodos.push(nextTodo);
      }
      setTodos(filterdOutTodos);
    });
  }

  function handleScroll(e) {
    if (e.target.offsetHeight + e.target.scrollTop >= e.target.scrollHeight) {
      if (count !== todosTotalCount) {
        setOffset(todosTotalCount);
      }
    }
  }

  function reorder(list, startIndex, endIndex) {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  }

  async function handleDragEnd(result) {
    if (!result.destination) {
      return;
    }
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    if (sourceIndex === destinationIndex) {
      return;
    }

    const source = todos[sourceIndex];
    const destination = todos[destinationIndex];

    const newTodos = reorder(todos, sourceIndex, destinationIndex);
    setTodos(newTodos);

    await updateTodoOrder(source, destination);
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h3" component="h1" gutterBottom>
        Todos
      </Typography>
      <TodoForm handleSubmit={(newTodo) => setTodos([...todos, newTodo])} />
      {todos.length > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <Paper
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={classes.todosContainer}
                onScroll={handleScroll}
              >
                <Box display="flex" flexDirection="column" alignItems="stretch">
                  <Box>
                    <FormControlLabel
                      label="Show Today"
                      control={
                        <Checkbox
                          checked={showToday}
                          onChange={() => {
                            setTodos([]);
                            setShowToday((prev) => !prev);
                            setOffset(0);
                          }}
                        />
                      }
                    />
                  </Box>
                  {todos.map((data, index) => (
                    <Draggable
                      key={data.id}
                      draggableId={data.id}
                      index={index}
                    >
                      {(provided) => (
                        <TodoItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          index={index}
                          key={data.id}
                          data={data}
                          handleDelete={deleteTodoById}
                          handleToggleCompleted={toggleTodoCompleted}
                        />
                      )}
                    </Draggable>
                  ))}
                </Box>
              </Paper>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </Container>
  );
}

export default Todos;
