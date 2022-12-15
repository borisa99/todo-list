import { useState } from "react";

import { Button, Icon, Paper, Box, TextField, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import dayjs from "dayjs";

import DatePicker from "../DatePicker";
import { createTodo } from "../../api/todo";

const useStyles = makeStyles({
  addTodoContainer: { padding: 10 },
  addTodoButton: { marginLeft: 5 },
});

export default function TodoForm({ handleSubmit }) {
  const classes = useStyles();

  const [text, setText] = useState("");
  const [dueAt, setDueAt] = useState(dayjs());
  const [error, setError] = useState(null);

  async function addTodo() {
    if (!text) {
      setError("Please enter a valid todo");
      return;
    }
    const data = await createTodo(text, dueAt);
    handleSubmit(data);
    setText("");
    setError(null);
  }

  return (
    <Paper className={classes.addTodoContainer}>
      <Box display="flex" flexDirection="row">
        <Box flexGrow={1}>
          <TextField
            fullWidth
            value={text}
            onKeyPress={(event) => {
              if (event.key === "Enter") {
                addTodo(text);
              }
            }}
            onChange={(event) => {
              setText(event.target.value);
              setError("");
            }}
          />
        </Box>
        <Box>
          <DatePicker
            label="Due At"
            defaultValue={dueAt}
            onChange={(value) => setDueAt(value)}
          />
        </Box>
        <Button
          className={classes.addTodoButton}
          startIcon={<Icon>add</Icon>}
          onClick={addTodo}
        >
          Add
        </Button>
      </Box>
      {error != null && <Typography>{error}</Typography>}
    </Paper>
  );
}
