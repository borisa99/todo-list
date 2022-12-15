import React from "react";
import { Typography, Button, Icon, Box, Checkbox } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles({
  todoContainer: {
    borderTop: "1px solid #bfbfbf",
    marginTop: 5,
    "&:first-child": {
      margin: 0,
      borderTop: "none",
    },
    "&:hover": {
      "& $deleteTodo": {
        visibility: "visible",
      },
    },
  },
  todoTextCompleted: {
    textDecoration: "line-through",
  },
  deleteTodo: {
    visibility: "hidden",
  },
});

const TodoItem = React.forwardRef(
  (
    {
      index,
      data: { id, text, completed, dueAt, order },
      handleDelete,
      handleToggleCompleted,
      ...rest
    },
    ref
  ) => {
    const classes = useStyles();

    return (
      <Box
        ref={ref}
        display="flex"
        flexDirection="row"
        alignItems="center"
        className={classes.todoContainer}
        {...rest}
      >
        <Box display="flex" justifyContent="center" alignItems="center">
          <Typography variant="body1">{index + 1}.</Typography>
          <Checkbox
            checked={completed}
            onChange={() => handleToggleCompleted(id)}
          ></Checkbox>
        </Box>

        <Box flexGrow={1}>
          <Typography
            className={completed ? classes.todoTextCompleted : ""}
            variant="body1"
          >
            {text}
          </Typography>
        </Box>
        {dueAt && (
          <Typography variant="body1" sx={{ mr: 1 }}>
            Due At - {dueAt}
          </Typography>
        )}

        <Button
          className={classes.deleteTodo}
          startIcon={<Icon>delete</Icon>}
          onClick={() => handleDelete(id, order)}
        >
          Delete
        </Button>
      </Box>
    );
  }
);

export default TodoItem;
