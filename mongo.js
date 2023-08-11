const mongoose = require("mongoose");
const len = process.argv.length;

if (len < 3) {
    console.log("give password as argument");
    process.exit(1);
}

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];
const url = `mongodb+srv://wes:${password}@cluster0.ai8ufze.mongodb.net/phonebookApp?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
});

const Person = mongoose.model("Person", personSchema);

// Display all data if only password was given
if (len === 3) {
    Person.find({}).then((result) => {
        result.forEach((person) => {
            console.log(person);
        });
        mongoose.connection.close();
    });
} else {
    const person = new Person({
        name: name,
        number: number,
    });
    person.save().then((result) => {
        console.log("New person added");
        mongoose.connection.close();
    });
}
