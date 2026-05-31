import { DatabaseSync } from 'node:sqlite'

import { gigModel } from './models/gig.js'
import { venueModel } from './models/venue.js'

const database = new DatabaseSync(`${import.meta.dirname}/gigs.db`)

database.exec('PRAGMA foreign_keys = ON;')

database.exec(venueModel)
database.exec(gigModel)

console.log('SQLite Database initialized successfully with Foreign Key support.')

export default database