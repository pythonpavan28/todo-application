const express = require("express");
const format = require("date-fns/format");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

const result = async (request, response) => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Error at ${e.message}`);
    process.exit(1);
  }
};
result();

const priorityAndStatusQuery = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const categoryAndStatus = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};
const categoryAndPriority = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

const priorityQuery = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const statusQuery = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const categoryQuery = (requestQuery) => {
  return requestQuery.category !== undefined;
};

app.get("/todos/", async (request, response) => {
  const { status, priority, search_q = "", category } = request.query;
  let result;
  switch (true) {
    case priorityAndStatusQuery(request.query):
      result = `SELECT id,todo,priority,status,category,due_date AS dueDate FROM todo 
        WHERE todo LIKE "%${search_q}%" AND priority = '${priority}' AND status = '${status}';`;
      break;
    case categoryAndStatus(request.query):
      result = `SELECT id,todo,priority,status,category,due_date AS dueDate FROM todo 
        WHERE todo LIKE "%${search_q}%" AND category LIKE "${category}" AND status = '${status}';`;
      break;
    case categoryAndPriority(request.query):
      result = `SELECT id,todo,priority,status,category,due_date AS dueDate FROM todo 
        WHERE todo LIKE "%${search_q}%" AND category = '${category}' AND priority = '${priority}';`;
      break;
    case priorityQuery(request.query):
      result = `SELECT id,todo,priority,status,category,due_date AS dueDate  FROM todo 
        WHERE todo LIKE "%${search_q}%" AND priority = '${priority}' ;`;
      break;
    case statusQuery(request.query):
      result = `SELECT id,todo,priority,status,category,due_date AS dueDate  FROM todo 
            WHERE todo LIKE "%${search_q}%" AND status = '${status}';`;
      break;

    case categoryQuery(request.query):
      result = `SELECT id,todo,priority,status,category,due_date AS dueDate  FROM todo 
        WHERE todo LIKE "%${search_q}%" AND category LIKE '${category}'`;
      break;

    default:
      result = `SELECT id,todo,priority,status,category,due_date AS dueDate  FROM todo 
        WHERE todo LIKE '%${search_q}%';`;
      break;
  }
  const dbResponse = await db.all(result);
  response.send(dbResponse);
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const gettingSpecificTodo = `SELECT id,todo,priority,status,category,due_date AS dueDate  FROM todo WHERE id = ${todoId};`;
  const dbResponse = await db.get(gettingSpecificTodo);
  response.send(dbResponse);
});
//API 3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const newDate = format(new Date(date), "yyyy-MM-dd");
  const todoDate = `SELECT id,todo,priority,status,category,due_date AS dueDate  FROM todo 
  WHERE due_date = '${newDate}';`;
  const dbResponse = await db.all(todoDate);
  response.send(dbResponse);
});

//API 4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, due_date } = request.body;
  const creatingTodo = `INSERT INTO todo (id,todo,priority,status,category,due_date)
    VALUES(${id},'${todo}','${priority}','${status}','${category}','${due_date}');`;
  await db.run(creatingTodo);
  response.send("Todo Successfully Added");
});

//API 5
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo, category, dueDate } = request.body;
  let updateData = "";
  let result = "";
  switch (true) {
    case status !== undefined:
      result = "Status";
      updateData = `UPDATE todo SET status = '${status}' WHERE id = ${todoId};`;
      break;
    case priority !== undefined:
      result = "Priority";
      updateData = `UPDATE todo SET priority = '${priority}' WHERE id = ${todoId};`;
      break;
    case todo !== undefined:
      result = "Todo";
      updateData = `UPDATE todo SET todo = '${todo}' WHERE id = ${todoId};`;
      break;
    case category !== undefined:
      result = "Category";
      updateData = `UPDATE todo SET category = '${category}' WHERE id = ${todoId};`;
      break;
    case dueDate !== undefined:
      result = "Due Date";
      updateData = `UPDATE todo SET due_date = '${dueDate}' WHERE id = ${todoId};`;
      break;
  }
  await db.run(updateData);
  response.send(`${result} Updated`);
});

//API 6

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodo = `DELETE FROM todo WHERE id = ${todoId};`;
  await db.run(deleteTodo);
  response.send("Todo Deleted");
});
module.exports = app;
