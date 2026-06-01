import type { Venue } from "./IVenue";

export interface IGig {
    date: string
    payment: number
    confirmed: boolean
    venue: Venue

    createdAt: string | Date
    updatedAt: string | Date
}