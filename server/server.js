import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { initDatabase } from './data/database.js';
import { corsOptions } from './utils/corsOptions.js'

import gigsRouter from './routes/gigRoutes.js';
import venuesRouter from './routes/venueRoutes.js';

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors(corsOptions))

await initDatabase()

app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/api/gigs', gigsRouter);
app.use('/api/venues', venuesRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong on the server." });
});

const PORT = process.env.PORT || 8000
app.listen(PORT, () => console.log(`Server Running on PORT: ${PORT}`))