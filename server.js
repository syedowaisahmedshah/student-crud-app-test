const express = require('express')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient
const app = express()

// ========================
// Link to Database
// ========================
// Updates environment variables
require('./dotenv')

// Replace process.env.DB_URL with your actual connection string
const connectionString = process.env.DB_URL

MongoClient.connect(connectionString, { useUnifiedTopology: true })
  .then(client => {
    createApp(client)
  })
  .catch((e) => console.log(e))

function createApp(client) {
  console.log('Connected to Database')
  const db = client.db(process.env.DB_NAME)
  const studentsCollection = db.collection('students')

  // ========================
  // Middlewares
  // ========================
  app.set('view engine', 'ejs')
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json())
  app.use(express.static('public'))

  // ========================
  // Routes
  // ========================
  app.get('/', (req, res) => {
    db.collection('students').find().toArray()
      .then(students => {
        res.render('index.ejs', { students: students })
      })
      .catch(/* ... */)
  })

  app.get('/students', (req, res) => {
    db.collection('students').find().toArray().then(students => {
      res.json({ students: students })
    })
  })

  app.post('/students', (req, res) => {
    studentsCollection.insertOne(req.body)
      .then(result => {
        res.redirect('/')
      })
      .catch(error => console.error(error))
  })

  app.put('/students', (req, res) => {
    studentsCollection.findOneAndUpdate(
      { name: 'Student' },
      {
        $set: {
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          dob: req.body.dob,
          email: req.body.email,
          noofsubjects: req.body.noofsubjects,
          teacher: req.body.teacher,
          phone: req.body.phone,
          pic: req.body.pic
        }
      },
      {
        upsert: true
      }
    )
      .then(result => {
        console.log(result)
        res.json(result)
      })
      .catch(error => console.error(error))
  })
  app.put('/students/:attr/:value', (req, res) => {
    studentsCollection.findOneAndUpdate(
      { [req.params.attr]: req.params.value },
      {
        $set: {
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          dob: req.body.dob,
          email: req.body.email,
          noofsubjects: req.body.noofsubjects,
          teacher: req.body.teacher,
          phone: req.body.phone,
          pic: req.body.pic
        }
      },
      {
        upsert: true
      }
    )
    .then(result => {
      console.log(result)
      res.json(result)
    })
    .catch(error => console.error(error))
  })

  app.delete('/students', (req, res) => {
    studentsCollection.deleteOne(
      { name: req.body.name }
    )
    .then(result => {
      if (result.deletedCount === 0) {
        return res.json('No student to delete')
      }
      res.json('Deleted random student')
    })
    .catch(error => console.error(error))
  })

  // ========================
  // Listen
  // ========================
  const isProduction = process.env.NODE_ENV === 'PROD'
  const port = isProduction ? process.env.PORT || 7500 : 3000
  console.log(`Trying listening on ${port}`)
  app.listen(port, function () {
    console.log(`server listening on ${port}`)
  })
}