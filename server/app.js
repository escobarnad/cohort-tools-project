const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require('cors')
const PORT = 5005;
const mongoose = require("mongoose");
const Student = require('./models/Student.model')
const Cohort = require('./models/Cohort.model');
const { restart } = require("nodemon");

// STATIC DATA
// Devs Team - Import the provided files with JSON data of students and cohorts here:
// ...
// const cohorts = require("./cohorts.json")
// const students = require("./students.json")


mongoose
  .connect("mongodb://127.0.0.1:27017/cohort-tools-api")
  .then(x => console.log(`Connected to Database: "${x.connections[0].name}"`))
  .catch(err => console.error("Error connecting to MongoDB", err));

// INITIALIZE EXPRESS APP - https://expressjs.com/en/4x/api.html#express
const app = express();


// MIDDLEWARE
// Research Team - Set up CORS middleware here:
// ...
app.use(cors())
app.use(express.json());
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// ROUTES - https://expressjs.com/en/starter/basic-routing.html
// Devs Team - Start working on the routes here:
// ...
app.get("/docs", (req, res) => {
  res.sendFile(__dirname + "/views/docs.html");
});

// app.get("/api/cohorts", (req, res) => {
//   res.json(cohorts);
// });

// app.get("/api/students", (req, res) => {
//   res.json(students);
// });

//Cohort routes

app.get("/api/cohorts", (req, res) => {
  Cohort.find({})
  .then ((cohorts) => {
    console.log("Retrieved cohorts ->", cohorts)
    res.status(200).send(cohorts)
  })
  .catch((error) => {
    console.error(error)
    res.status(500).send({ error: "Failed to retrieve cohorts"})
  })
})

app.get('/api/cohorts/:cohortId', async (req, res) => {
  const { cohortId } = req.params
  if (mongoose.isValidObjectId(cohortId)) {
    try {
      const currentCohort = await Cohort.findById(cohortId)
      if (currentCohort) {
        res.json({ cohort: currentCohort })
      } else {
        res.status(404).json({ message: 'Cohort not found' })
      }
    } catch (error) {
      console.log(error)
      res.status(400).json({ error })
    }
  } else {
    res.status(400).json({ message: 'The id seems wrong' })
  }
})

app.post("/api/cohorts", (req, res) => {
  Cohort.create(req.body)
  .then((createdCohort) => {
    console.log("Cohort created ->", createdCohort)
    res.status(201).send(createdCohort)
  })
  .catch((error) =>
  {console.error("Error while trying to create the cohorts ->", error)
  res.status(500).send({ error: "Failed to create the cohorts"})})
})

app.put('/api/cohorts/:cohortId', async (req, res) => {
  const { cohortId } = req.params

  console.log(cohortId)

  try {
    const newCohort = await Cohort.findByIdAndUpdate(cohortId, req.body, { new: true })
    res.status(202).json({ cohort: newCohort })
  } catch (error) {
    console.log(error)
    res.status(400).json({ error })
  }
})

app.delete('/api/cohorts/:cohortId', async (req, res) => {
  const { cohortId } = req.params

  await Cohort.findByIdAndDelete(cohortId)
  res.status(202).json({ message: 'Cohort deleted' })
})


//Students routes

app.get("/api/students", (req, res) => {
  Student.find({})
  .populate("cohort")
  .then ((students) => {
    console.log("Retrieved students ->", students)
    res.status(200).send(students)
  })
  .catch((error) => {
    console.error(error)
    res.status(500).send({ error: "Failed to retrieve students"})
  })
})

app.get('/api/students/:studentId', async (req, res) => {
  const { studentId } = req.params
  if (mongoose.isValidObjectId(studentId)) {
    try {
      const currentStudent = await Student.findById(studentId).populate('cohort')
      if (currentStudent) {
        res.json({ student: currentStudent })
      } else {
        res.status(404).json({ message: 'Student not found' })
      }
    } catch (error) {
      console.log(error)
      res.status(400).json({ error })
    }
  } else {
    res.status(400).json({ message: 'The id seems wrong' })
  }
})

app.get('/api/students/cohort/:cohortId', async (req, res) => {
  const { cohortId } = req.params
  if (mongoose.isValidObjectId(cohortId)) {
    try {
      const currentCohort = await Student.find({cohort: cohortId})
      if (currentCohort) {
        res.json({ cohort: currentCohort })
      } else {
        res.status(404).json({ message: 'Cohort students not found' })
      }
    } catch (error) {
      console.log(error)
      res.status(400).json({ error })
    }
  } else {
    res.status(400).json({ message: 'The id seems wrong' })
  }
})

app.post("/api/students", (req, res) => {
  Student.create(req.body)
  .then((createdStudent) => {
    console.log("Student created ->", createdStudent)
    res.status(201).send(createdStudent)
  })
  .catch((error) =>
  {console.error("Error while trying to create the student ->", error)
  res.status(500).send({ error: "Failed to create the student"})})
})

app.put('/api/students/:studentId', async (req, res) => {
  const { studentId } = req.params

  console.log(studentId)

  try {
    const newStudent = await Student.findByIdAndUpdate(studentId, req.body, { new: true })
    res.status(202).json({ user: newStudent })
  } catch (error) {
    console.log(error)
    res.status(400).json({ error })
  }
})

app.delete('/api/students/:studentId', async (req, res) => {
  const { studentId } = req.params

  await Student.findByIdAndDelete(studentId)
  res.status(202).json({ message: 'Student deleted' })
})


// START SERVER
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});