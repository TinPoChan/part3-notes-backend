const express = require('express')
const app = express()
var morgan = require('morgan')
const cors = require('cors')
app.use(express.static('build'))

app.use(cors())

morgan.token('body', function (req, res) {
  return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :req[body] - :response-time ms :body', {
  skip: function (req, res) {
    return res.statusCode >= 400
  }
}))

let persons = 
  [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

app.use(express.json())

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

const generateId = () => {
  const randomID = Math.floor(Math.random() * 1000)
  if(persons.find(person => person.id === randomID)) {
    return generateId()
  }
  return randomID
}

app.get('/info' , (req, res) => {
  res.send(`<p>Phonebook has info for ${persons.length} people</p>
  <p>${new Date()}</p>`)
})


app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'Name or number missing' 
    })
  }

  if (persons.find(person => person.name === body.name)) {
    return response.status(400).json({
      error: 'Name must be unique'
    })
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(person)

  response.json(person)
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})