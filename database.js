import mysql from 'mysql2';
import dotenv from 'dotenv';//Its for the db configuration. Use an external file ignored by git. 
dotenv.config();

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

export async function getTodosByID(id) {
  const [rows] = await pool.query(
    `
    SELECT todos.*, shared_todos.shared_with_id
    FROM todos
    LEFT JOIN shared_todos ON todos.id = shared_todos.todo_id
    WHERE todos.user_id = ? OR shared_todos.shared_with_id = ?
  `,
    [id, id]
  );
  return rows;
}

export async function getTodo(id) {//not uses yet on the app. Disabled import on app because that. 
  const [rows] = await pool.query(`SELECT * FROM todos WHERE id = ?`, [id]);
  return rows[0];
}

export async function getSharedTodoByID(id) {
  const [rows] = await pool.query(
    `SELECT * FROM shared_todos WHERE todo_id = ?`,
    [id]
  );
  return rows[0];
}

export async function getUserByID(id) {
  const [rows] = await pool.query(`SELECT * FROM users WHERE id = ?`, [id]);
  return rows[0];
}

export async function getUserByEmail(email) {
  const [rows] = await pool.query(`SELECT * FROM users WHERE email = ?`, [
    email,
  ]);
  // console.log(rows[0]);
  return rows[0];
}

export async function createTodo(user_id, title) {
  const [result] = await pool.query(
    `
    INSERT INTO todos (user_id, title)
    VALUES (?, ?)
  `,
    [user_id, title]
  );
  const todoID = result.insertId;
  console.log(`Tarea: ${title}, creada con exito.`);
  return getTodo(todoID);
}

export async function deleteTodo(id) {
  const [result] = await pool.query(
    `
    DELETE FROM todos WHERE id = ?;
    `,
    [id]
  );
  console.log(`Taréa Id: ${id} eliminada.`);
  return result;
}

  export async function toggleCompleted(id, value) {
    const newValue = value === true ? "TRUE" : "FALSE";
    console.log("value: " + value);
    // console.log("togleCompleted: " + newValue);
    const [result] = await pool.query(
      `
      UPDATE todos
      SET completed = ${newValue} 
      WHERE id = ?;
      `,
      [id]
    );
    return result;
  }

  //Agrego 23-10-24 para modificar un todo.
  export async function updateTodo(id, title, completed, user_id, shared_with_id ) {
  const newValueCompleted = completed === true ? "TRUE" : "FALSE";
  console.log("Data to update: ");
  console.log(" id: " + id);
  console.log(" user_id: " + user_id);
  console.log(" title: " + title);
  console.log(" completed: " + completed);
  console.log(" shared_with_id: " + shared_with_id);

  const [result] = await pool.query(
    `
    UPDATE todos
    SET title = ?, completed = ${newValueCompleted} 
    WHERE id = ?;
    `,
    [title, id]
  );
  return result;
}

export async function shareTodo(todo_id, user_id, shared_with_id) {
  const [result] = await pool.query(
    `
    INSERT INTO shared_todos (todo_id, user_id, shared_with_id) 
    VALUES (?, ?, ?);
    `,
    [todo_id, user_id, shared_with_id]
  );
  return result.insertId;
}
/**
 * Tests for development
 */
// console.log(await createTodo("test", "test"));

// const todos = await getTodos();
// console.log(todos);

// const todoByID = await getTodo(2);
// console.log(todoByID);

// await deleteTodo(2);

// await shareTodo(13, 2, 1);