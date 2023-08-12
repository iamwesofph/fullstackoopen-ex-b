require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
var morgan = require("morgan");
const date = new Date();
const Person = require("./models/person");

const requestLogger = (request, response, next) => {
    console.log("Method:", request.method);
    console.log("Path:  ", request.path);
    console.log("Body:  ", request.body);
    console.log("---");
    next();
};

const errorHandler = (error, request, response, next) => {
    console.error(error.message);

    if (error.name === "CastError") {
        return response.status(400).send({ error: "malformatted id" });
    }

    next(error);
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

// let persons = [
//     {
//         id: 1,
//         name: "Arto Hellas",
//         number: "040-123456",
//     },
//     {
//         id: 2,
//         name: "Ada Lovelace",
//         number: "39-44-5323523",
//     },
//     {
//         id: 3,
//         name: "Dan Abramov",
//         number: "12-43-234345",
//     },
//     {
//         id: 4,
//         name: "Mary Poppendieck",
//         number: "39-23-6423122",
//     },
// ];

app.get("/api/persons", (request, response) => {
    Person.find({}).then((persons) => {
        response.json(persons);
    });
});

app.get("/info", (request, response) => {
    Person.countDocuments({})
        .then((count) => {
            response.send(`<p>Phonebook has info for ${count} people.</p><p>${date}</p>`);
        })
        .catch((error) => {
            response.send(`Error counting documents: ${error}`);
        });
});

app.get("/api/persons/:id", (request, response, next) => {
    Person.findById(request.params.id)
        .then((person) => {
            if (person) {
                response.json(person);
            } else {
                response.status(404).send("<h1>Person not found</h1>");
            }
        })
        .catch((error) => next(error));
    // .catch(error => {
    //     console.log(error);
    //     response.status(400).send({ error: "malformatted id" });
    // });
});

// app.delete("/api/persons/:id", (request, response) => {
//     const id = Number(request.params.id);
//     persons = persons.filter((person) => person.id !== id);

//     response.status(204).end();
// });

app.delete("/api/persons/:id", (request, response, next) => {
    Person.findByIdAndRemove(request.params.id)
        .then((result) => {
            response.status(204).end();
        })
        .catch((error) => next(error));
});

app.post("/api/persons", (request, response) => {
    const body = request.body;

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: "name or number missing",
        });
    }

    // const nameExists = persons.some((person) => person.name === body.name);

    // if (nameExists) {
    //     return response.status(409).json({
    //         error: "name must be unique",
    //     });
    // }

    const person = new Person({
        name: body.name,
        number: body.number,
    });
    person.save().then((savedPerson) => {
        response.json(savedPerson);
    });
});

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
