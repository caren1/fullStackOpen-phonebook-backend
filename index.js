require('dotenv').config()
const Person = require('./models/person')
const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

morgan.token('requestContent', function (req, res) {
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :requestContent'))

let persons = [{
        name: 'Arto Hellas',
        number: '040-123456',
        id: 1
    },
    {
        name: 'Ada Lovelace',
        number: '39-44-5323523',
        id: 2
    },
    {
        name: 'Dan Abramov',
        numbeid: '12-43-234345',
        id: 3
    },
    {
        name: 'Mary Poppendieck',
        numbeid: '39-23-6423122',
        id: 4
    },
    {
        name: 'Wojciech Czarnocki',
        number: '123123123',
        id: 5
    }
]

app.get('/', (request, response) => {
    response.send('<h1>Welcome to phonebook!</h1>')
})

app.get('/api/persons', (request, response) => {
    // response.json(persons)
    Person.find({})
        .then(persons => {
            response.json(persons)
        })
})

app.get('/info', (request, response) => {
    const time = new Date()
    response.send(
        `<h1>Phonebook has currently info for ${persons.length} people.</h1>
        <div>${time}</div>`
    )
})



app.get('/api/persons/:id', (request, response, next) => {

    const person = Person.findById(request.params.id)
        .then(person => {
            if(person){
                response.json(person)
            } else {
                response.status(404).end()
            }
            response.json(person)
        })
        .catch(error => {next(error)})

    // const id = Number(request.params.id)
    // const person = persons.find(person => person.id === id)
    // if(person) {
    //     response.json(person)
    // } else {
    //     return response.status(404).end()
    // }
})

app.delete('/api/persons/:id', (request, response) => {
    // const id = Number(request.params.id)
    // persons = persons.filter(person => person.id !== id)
    // response.status(204).end()
    Person.findByIdAndRemove(request.params.id)
    .then(result => {
        response.status(204).end()
    })
    .catch(error => {
        next(error)
    })
})

app.post('/api/persons', (request, response) => {
    // const id = Math.floor(Math.random() * (100 - persons.length)) + persons.length;
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(404).json({
            error: 'Name or Number in request is missing.'
        })
    }
    // } else if (persons.find(person => person.name === body.name)) {
    //     return response.status(404).json({
    //         error: 'Provided name is already in use, it must be UNIQUE.'
    //     })
    // }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    // console.log(person)
    persons = persons.concat(person);
    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }

  app.use(unknownEndpoint)

  const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } 
    next(error)
  }
  
  app.use(errorHandler)

let PORT = process.env.PORT;
if (PORT == null || PORT == "") {
    PORT = 3001;
}
app.listen(PORT);