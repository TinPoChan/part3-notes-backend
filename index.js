require('dotenv').config()
const express = require('express')
const app = express()
var morgan = require('morgan')
const cors = require('cors')
app.use(express.static('build'))
const Person = require('./models/person')
const mongoose = require('mongoose')

// const password = process.argv[2]

// const url =
//   `mongodb+srv://ericchantinpo:${password}@fullstackopen.2v8xe.mongodb.net/personApp?retryWrites=true&w=majority`

// mongoose.connect(url)

// const personSchema = new mongoose.Schema({
//   name: String,
//   number: String
// })

// personSchema.set('toJSON', {
//   transform: (document, returnedObject) => {
//     returnedObject.id = returnedObject._id.toString()
//     delete returnedObject._id
//     delete returnedObject.__v
//   }
// })

// const Person = mongoose.model('Person', personSchema)

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
  if (persons.find(person => person.id === randomID)) {
    return generateId()
  }
  return randomID
}

app.get('/info', (req, res) => {
  Person.find({}).then(result => {
    const date = new Date()
    const info = `<p>Phonebook has info for ${result.length} people</p>
    <p>${date}</p>`
    res.send(info)
  })
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

  const person = new Person({
    id: generateId(),
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })

  // persons = persons.concat(person)

  // response.json(person)
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(result => {
    res.json(result)
  })
})

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndRemove(request.params.id).then(result => {
    response.status(204).end()
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  // const id = Number(request.params.id)
  // const person = persons.find(person => person.id === id)

  // if (person) {
  //   response.json(person)
  // } else {
  //   response.status(404).end()
  // }
  Person.findById(request.params.id).then(result => {
    if (result) {
      response.json(result)
    } else {
      response.status(404).end()
    }
  })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true }).then(result => {
    response.json(result)
  })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})