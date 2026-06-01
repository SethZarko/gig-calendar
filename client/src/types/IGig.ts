import type { Venue } from "./IVenue";

export interface IGig {
    gig_id: number;
    date: string
    payment: number
    confirmed: boolean
    venue: Venue

    createdAt?: string | Date
    updatedAt?: string | Date
}