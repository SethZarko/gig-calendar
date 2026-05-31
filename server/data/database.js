import { DatabaseSync } from 'node:sqlite'
import __dirname from '../utils/dirname.js'

import { gigModel } from './models/gig.js'
import { venuModel } from './models/venue.js'

const database = new DatabaseSync(`${__dirname}/gigs.db`)

database.exec('PRAGMA foreign_keys = ON;')

database.exec(venueModel)
database.exec(gigModel)

console.log('SQLite Database initialized successfully with Foreign Key support.')

export default database