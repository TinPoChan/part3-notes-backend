require('dotenv').config()
const express = require('express')
const app = express()
var morgan = require('morgan')
const cors = require('cors')
app.use(express.static('build'))
const Person = require('./models/person')

app.use(cors())

morgan.token('body', function (req, res) {
  return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :req[body] - :response-time ms :body', {
  skip: function (req, res) {
    return res.statusCode >= 400
  }
}))

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


app.post('/api/persons', (request, response, next) => {
  const body = request.body

  // if (!body.name || !body.number) {
  //   return response.status(400).json({
  //     error: 'Name or number missing'
  //   })
  // }

  // if (persons.find(person => person.name === body.name)) {
  //   return response.status(400).json({
  //     error: 'Name must be unique'
  //   })
  // }


  const person = new Person({
    //id: generateId(),
    name: body.name,
    number: body.number
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
    .catch(error => next(error))

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

  const { name, number } = request.body

  Person.findByIdAndUpdate(request.params.id, { name, number }, { new: true, runValidators: true, context: 'query' }).then(result => {
    response.json(result)
  })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})