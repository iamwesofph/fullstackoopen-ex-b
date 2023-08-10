const express = require("express");
const app = express();
const cors = require("cors");
var morgan = require("morgan");
const date = new Date();

const requestLogger = (request, response, next) => {
    console.log("Method:", request.method);
    console.log("Path:  ", request.path);
    console.log("Body:  ", request.body);
    console.log("---");
    next();
};

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: "unknown endpoint" });
};

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(express.static("dist"));

// app.use(requestLogger);
// app.use(morgan("tiny"));
// app.use(morgan(":method :url :status :res[content-length] - :response-time ms :req-body"));
// app.use(morgan(":method :url :status :res[content-length] - :response-time ms :body"));

morgan.token("req-body", (req, res) => {
    return JSON.stringify(req.body);
});

// Use the custom token in the morgan format string
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :req-body :referrer"));

function generateRandomId() {
    // Define the range for the random ID
    const min = 100000; // Minimum value for the random ID
    const max = 999999; // Maximum value for the random ID

    // Generate a random number within the defined range
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;

    return randomId;
}

let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456",
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-5323523",
    },
    {
        id: 3,
        name: "Dan Abramov",
        number: "12-43-234345",
    },
    {
        id: 4,
        name: "Mary Poppendieck",
        number: "39-23-6423122",
    },
];

app.get("/api/persons", (request, response) => {
    response.json(persons);
});

app.get("/info", (request, response) => {
    response.send("<p>Phonebook has info for " + persons.length + " people.</p><p>" + date + "</p>");
});

app.get("/api/persons/:id", (request, response) => {
    const id = request.params.id;
    const person = persons.find((person) => person.id === Number(id));

    if (person) {
        response.json(person);
    } else {
        response.status(404).end();
    }
});

app.delete("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id);
    persons = persons.filter((person) => person.id !== id);

    response.status(204).end();
});

app.post("/api/persons", (request, response) => {
    const body = request.body;

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: "name or number missing",
        });
    }

    // Check if the name is already in the persons array
    const nameExists = persons.some((person) => person.name === body.name);

    if (nameExists) {
        return response.status(409).json({
            error: "name must be unique",
        });
    }

    const person = {
        id: generateRandomId(),
        name: body.name,
        number: body.number,
    };

    persons = persons.concat(person);

    response.json(person);
});

app.use(unknownEndpoint);

// const PORT = 3001;
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
