const mongoose = require('mongoose')

const password = process.argv[2]

const url =
  `mongodb+srv://ericchantinpo:${password}@fullstackopen.2v8xe.mongodb.net/personApp?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)

if(process.argv.length == 3) {
    Person.find({}).then(result => {
        console.log('Phonebook:')
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })
} else if(process.argv.length > 3) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4]
  })
  person.save().then(response => {
    console.log(`added ${person.name} number ${person.number} to phonebook`)
    mongoose.connection.close()
  })
} 


// console.log(process.argv[2]); // password
// console.log(process.argv[3]); // name
// console.log(process.argv[4]); // number

// const note = new Note({
//   content: 'HTML is Easy',
//   date: new Date(),
//   important: true,
// })

// note.save().then(result => {
//   console.log('note saved!')
//   mongoose.connection.close()
// })

// Note.find({}).then(result => {
//     result.forEach(note => {
//       console.log(note)
//     })
//     mongoose.connection.close()
//   })

