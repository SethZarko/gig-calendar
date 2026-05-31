import 'dotenv/config'
import express from 'express'
import './data/database.js';
import cors from 'cors'

import gigsRouter from './routes/gigRoutes.js';
import venuesRouter from './routes/venueRoutes.js';

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.use('/api/gigs', gigsRouter);
app.use('/api/venues', venuesRouter);

const PORT = process.env.PORT || 8000
app.listen(PORT, () => console.log(`Server Running on PORT: ${PORT}`))