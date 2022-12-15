const express = require("express");
const { v4: generateId } = require("uuid");
const dayjs = require("dayjs");

const database = require("./database");

const app = express();

function requestLogger(req, res, next) {
  res.once("finish", () => {
    const log = [req.method, req.path];
    if (req.body && Object.keys(req.body).length > 0) {
      log.push(JSON.stringify(req.body));
    }
    if (req.query && Object.keys(req.query).length > 0) {
      log.push(JSON.stringify(req.query));
    }
    log.push("->", res.statusCode);
    // eslint-disable-next-line no-console
    console.log(log.join(" "));
  });
  next();
}

app.use(requestLogger);
app.use(require("cors")());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/:offset", async (req, res) => {
  const { showToday } = req.query;
  const { offset } = req.params;

  const filter = {};
  const options = {
    skip: Number(offset),
    limit: 20,
  };
  if (showToday === "true") {
    filter.dueAt = dayjs().format("DD/MM/YYYY");
  }

  const todos = database.client.db("todos").collection("todos");
  const response = await todos
    .find(filter, options)
    .sort({ order: 1 })
    .toArray();
  const totalCount = await todos.count();
  res.status(200);
  res.json({ data: response, totalCount });
});

app.post("/", async (req, res) => {
  const { text, dueAt } = req.body;

  if (typeof text !== "string") {
    res.status(400);
    res.json({ message: "invalid 'text' expected string" });
    return;
  }
  const todos = database.client.db("todos").collection("todos");
  const totalCount = await todos.count();

  const todo = {
    id: generateId(),
    text,
    dueAt,
    completed: false,
    order: totalCount + 1,
  };
  await todos.insertOne(todo);
  res.status(201);
  res.json(todo);
});

app.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  if (typeof completed !== "boolean") {
    res.status(400);
    res.json({ message: "invalid 'completed' expected boolean" });
    return;
  }

  await database.client
    .db("todos")
    .collection("todos")
    .updateOne({ id }, { $set: { completed } });
  res.status(200);
  res.end();
});

app.post("/order", async (req, res) => {
  const { source, destination } = req.body;
  const todosCollection = database.client.db("todos").collection("todos");

  const todos = await todosCollection.find({}).toArray();

  // IF FIRST
  if (source.order === 1) {
    // Loop over lower order todos and decrement order
    const lowerOrderTodos = todos.filter(
      (todo) => todo.order <= destination.order && todo.order !== 1
    );
    lowerOrderTodos.forEach((todo) => {
      todosCollection.updateOne(
        { id: todo.id },
        { $set: { order: todo.order - 1 } }
      );
    });
  } else if (source.order === todos.length) {
    // Loop over higher order todos and increment order
    const higherOrderTodos = todos.filter(
      (todo) => todo.order >= destination.order && todo.order !== source.order
    );
    higherOrderTodos.forEach((todo) => {
      todosCollection.updateOne(
        { id: todo.id },
        { $set: { order: todo.order + 1 } }
      );
    });
  } else {
    // Update order at destination
    await todosCollection.updateOne(
      { id: destination.id },
      { $set: { order: source.order } }
    );
  }
  // Update order at source
  await todosCollection.updateOne(
    { id: source.id },
    { $set: { order: destination.order } }
  );

  res.status(200);
  res.end();
});

app.delete("/:id/:order/:offset", async (req, res) => {
  const { id, order, offset } = req.params;
  const todos = database.client.db("todos").collection("todos")

  // Update order of next todos
  const hiherOrderTodos = await todos.find({ order:{ $gt:Number(order) } }).toArray()
  hiherOrderTodos.forEach((todo) => {
      todos.updateOne(
        { id: todo.id },
        { $set: { order: todo.order - 1 } }
      );
    });

  // Delete the picked one
  await todos.deleteOne({ id });

  // Send the next not visible todo for pagination
  const nextTodo = await todos.findOne({}, { skip: Number(offset-1) } )

  res.status(203);
  res.json(nextTodo);

});

module.exports = app;
