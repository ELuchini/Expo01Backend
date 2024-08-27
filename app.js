import express from "express";
// TO RUN: YARN DEV

import {
  // getTodo,
  shareTodo,
  deleteTodo,
  getTodosByID,
  createTodo,
  toggleCompleted,
  getUserByEmail,
  getUserByID,
  getSharedTodoByID,
} from "./database.js";
import bodyParser from "body-parser";
import cors from "cors";

const corsOptions = {
  origin: ["http://127.0.0.1:8081", "http://192.168.1.2:8080", "http://192.168.1.2:8081", "http://localhost:8081", "http://192.168.1.7" ], // specify the allowed origin
  methods: ["POST", "GET", "PUT", "DELETE"], // specify the allowed methods
  // credentials: true, // allow sending credentials (cookies, authentication)
};
//****************************************
//HAY QUE CONFIGURAR EL COTEJAMIENTO/CODIFICACIÓN DE CARACTERES DE LA TABLA A UN FORMATO QUE SOPORTE UNICODE COMO UTF8MB4
//PARA EL FUNCIONAMIENTO/ALMACENAMIENTO DE EMOJIS.
//****************************************


// const developers = [
//   { id: 1, name: "John Doe", apiKey: "abcdef123456" },
//   { id: 2, name: "Jane Doe", apiKey: "ghijkl789012" },
// ];

// const ckeckApiKey = (req, res, next) => {
//   const apiKey = req.headers["x-api-key"];
//   const developer = developers.find((d) => d.apiKey === apiKey); //check if we have a dev with that key
//   if (!developer) {
//     return res.status(401).json({ message: "Unauthorized, invalid Api Key" });
//   }
//   req.developer = developer;
//   next();
// };

const app = express();
app.use(bodyParser.json());
app.use(express.json());
// app.use(cors());
app.use(cors(corsOptions));
// app.use(ckeckApiKey);


app.get("/todos/:id", async (req, res) => {
  const todos = await getTodosByID(req.params.id);
  res.status(200).send(todos);
});

app.get("/todos/shared_todos/:id", async (req, res) => {
  const todo = await getSharedTodoByID(req.params.id);
  const author = await getUserByID(todo.user_id);
  const shared_with = await getUserByID(todo.shared_with_id);
  res.status(200).send({ author, shared_with });
});

app.get("/users/:id", async (req, res) => {
  const user = await getUserByID(req.params.id);
  res.status(200).send(user);
});

app.put("/todos/:id", async (req, res) => {
  const { value } = req.body;
  // console.log("Body: "+ JSON.stringify(req.body));
  const todo = await toggleCompleted(req.params.id, value);
  res.status(200).send(todo);
});

app.delete("/todos/:id", async (req, res) => {
  console.log("SolicBKND Delete: "+ req.params.id)
  await deleteTodo(req.params.id);
  res.send({ message: "Todo deleted successfully" });
});

app.post("/todos/shared_todos", async (req, res) => {
  const { todo_id, user_id, email } = req.body;
  // const { todo_id, user_id, shared_with_id } = req.body;
  const userToShare = await getUserByEmail(email);
  const sharedTodo = await shareTodo(todo_id, user_id, userToShare.id);
  // res.status(201).send(sharedTodo);
  res.sendStatus(201).send(sharedTodo);
});

// app.get("/todos/:id", async (req, res) => {
//   const id = req.params.id;
//   const todo = await getTodo(id);
//   res.status(200).send(todo);
// });

app.post("/todos", async (req, res) => {
  const { user_id, title } = req.body;
  const todo = await createTodo(user_id, title);
  res.status(201).send(todo);
});

app.listen(8080, () => {
  console.log("Server running on port 8080");
});

////////////////////////////////////////////////////////////////////
