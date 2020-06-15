const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('Pease provide the password as an argument: node mongo.js <password>');
    process.exit(1)
}

const password = process.argv[2]
console.log(password);


//Notice that if the name contains whitespace characters, it must be enclosed in quotes:
// node mongo.js yourpassword "Arto Vihavainen" 040-1234556

const url = `mongodb+srv://admin-wojciech:${password}@thephonebook-uyc2n.mongodb.net/phoneBook?retryWrites=true&w=majority`

mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => console.log('Connected'))
    .catch(err => console.log('Caught', err.stack));


const personSchema = new mongoose.Schema({
    name: String,
    number: Number
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
    name: process.argv[3],
    number: process.argv[4]
})


if (process.argv.length === 3) {
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(person);
        })
        mongoose.connection.close()
    })
} else if (process.argv.length > 3){
    person.save().then(result => {
        console.log(`added ${person.name} number ${person.number} to the phonebook`);
        mongoose.connection.close()
    })
}