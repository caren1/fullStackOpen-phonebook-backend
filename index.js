const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

app.use(express.json())
app.use(cors())

morgan.token('requestContent', function (req, res) {
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :requestContent'))

let persons = [
    {
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
    response.json(persons)
})

app.get('/info', (request, response) => {
    const time = new Date()
    response.send(
        `<h1>Phonebook has currently info for ${persons.length} people.</h1>
        <div>${time}</div>`
    )
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if(person) {
        response.json(person)
    } else {
        return response.status(404).end()
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const id = Math.floor(Math.random() * (100 - persons.length)) + persons.length;
    const body = request.body

    if(!body.name || !body.number){
        return response.status(404).json({
            error: 'Name or Number in request is missing.'
        })
    } else if(persons.find(person => person.name === body.name)){
        return response.status(404).json({
            error: 'Provided name is already in use, it must be UNIQUE.'
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id,
    }

    console.log(person)
    persons = persons.concat(person);
    response.json(person)
})

const port = 3001
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})