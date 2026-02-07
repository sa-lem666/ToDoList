
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); 
app.use(express.json()); 

// This is the "Register" door your frontend is knocking on
app.post('/register', (req, res) => {
    console.log("Registering user:", req.body);
    res.status(201).json({ message: "User created successfully!" });
});


app.listen(3000, () => {
    console.log('SERVER IS ALIVE at http://localhost:3000');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log("Login attempt for:", username);

    
    if (username && password) {
        res.json({ 
            token: "mock-jwt-token-12345", 
            message: "Login successful!" 
        });
    } else {
        res.status(401).json({ message: "Invalid credentials" });
    }
});

// Temporary database
let todos = [];

//all todos for a user
app.get('/todos', (req, res) => {
    
    res.json(todos);
});

//new todo
app.post('/todos', (req, res) => {
    const { title, description } = req.body;
    
    const newTodo = {
        _id: Date.now().toString(), // Generate a temporary unique ID
        title,
        description: description || "",
        completed: false
    };

    todos.push(newTodo);
    console.log("Added Todo:", newTodo);
    res.status(201).json(newTodo);
});

//update todo
app.put('/todos/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    const index = todos.findIndex(t => t._id === id);
    if (index !== -1) {
        // Update only the fields that were sent in the request
        if (title !== undefined) todos[index].title = title;
        if (description !== undefined) todos[index].description = description;
        if (completed !== undefined) todos[index].completed = completed;
        
        res.json(todos[index]);
    } else {
        res.status(404).json({ message: "Todo not found" });
    }
});

//deleta a todo
app.delete('/todos/:id', (req, res) => {
    const { id } = req.params;
    todos = todos.filter(t => t._id !== id);
    res.json({ message: "Todo deleted" });
});

