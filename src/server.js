const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const app = express()
const port = 3000
app.use(express.json())

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})