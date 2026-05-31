import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

const PORT = process.env.PORT || 8000
app.listen(PORT, () => console.log(`Server Running on PORT: ${PORT}`))