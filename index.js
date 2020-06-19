require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

morgan.token('requestContent', function (req, res) {
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :requestContent'))

app.get('/info', (request, response) => {
    const time = new Date()
    Person.countDocuments({})
        .then(count => {
            response.send(
            `<h1>Phonebook has currently info for ${count} people.</h1>
            <div>${time}</div>`
            )
        })
})

app.get('/api/persons', (request, response) => {
    Person.find({})
        .then(persons => {
            // which one is appropriate, as both return the same? error in the course content?
            response.json(persons.map(person => person.toJSON()))
            // response.json(persons)
        })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                // response.json(person)
                response.json(person.toJSON())
            } else {
                response.status(404).end()
            }
        })
        .catch(error => {
            next(error)
        })
})

app.delete('/api/persons/:id', (request, response) => {
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(404).json({
            error: 'Name or Number in request is missing.'
        })
    }

    Person.find({name: body.name})
        .then(person => {
            if (person.lenght > 0) {
                return response.status(400).json({
                    error: 'Provided name is already in use, it must be UNIQUE.'
                })
            } else {
                const person = new Person({
                    name: body.name,
                    number: body.number
                })
                person.save()
                    .then(savedPerson => {
                        response.json(savedPerson.toJSON())
                    })
                    .catch(error => next(error))
            }
        })
})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number
    }

    Person.findByIdAndUpdate(request.params.id, person, {new: true})
    .then(updatedPerson => {
        response.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({
            error: 'malformatted id'
        })
    }
    next(error)
}
app.use(errorHandler)

const unknownEndpoint = (request, response) => {response.status(404).send({error: 'unknown endpoint'})}
app.use(unknownEndpoint)


let PORT = process.env.PORT;
if (PORT == null || PORT == "") {
    PORT = 3001;
}
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
});