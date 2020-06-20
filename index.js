/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

const Person = require('./models/person')

app.use(cors())
app.use(express.static('build'))
app.use(express.json())

morgan.token('requestContent', function (request, response) {
  return JSON.stringify(request.body)
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
      response.json(persons.map(person => person.toJSON()))
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person.toJSON())
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      next(error)
    })
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(savedPerson => savedPerson.toJSON())
    .then(savedAndFormattedPerson => {
      response.json(savedAndFormattedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, {
    new: true
  })
    .then(updatedPerson => updatedPerson.toJSON())
    .then(updatedAndFormattedPerson => {
      response.json(updatedAndFormattedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message)
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}
app.use(errorHandler)

let PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})