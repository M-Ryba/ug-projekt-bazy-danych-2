import 'dotenv/config'
import express from 'express'

import { add, subtract } from './util.js'

console.log(add(5, 5))
console.log(subtract(10, 5))

const app = express()

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`)
})
