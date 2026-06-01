import { useState, useEffect } from "react";
import { useRevalidator } from "react-router";
import type { IGig } from "../../types/IGig";
import type { Venue } from "../../types/IVenue";

import styles from "./GigModal.module.scss";

interface GigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: string;
  existingGig: IGig | null;
}

interface CreateGigPayload {
  date: string;
  payment: number;
  confirmed: boolean;
  venue_id?: number;
  venue?: {
    name: string;
    street: string;
    city: string;
    province: string;
    postal_code: string;
  };
}

export const GigModal = ({
  isOpen,
  onClose,
  currentDate,
  existingGig,
}: GigModalProps) => {
  const revalidator = useRevalidator();

  // --- State ---
  const [venues, setVenues] = useState<Venue[]>([]);
  const [venueId, setVenueId] = useState<string>(
    existingGig?.venue.venue_id.toString() || ""
  );
  const [payment, setPayment] = useState<string>(
    existingGig?.payment.toString() || ""
  );
  const [confirmed, setConfirmed] = useState<boolean>(
    existingGig?.confirmed || false
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- New Venue State ---
  const [isCreatingVenue, setIsCreatingVenue] = useState(false);
  const [newVenue, setNewVenue] = useState({
    name: "",
    street: "",
    city: "",
    province: "",
    postalCode: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetch(`${import.meta.env.VITE_API_URL}api/venues`)
        .then((res) => res.json())
        .then((data) => setVenues(data.data || []))
        .catch((err) => console.error("Failed to load venues", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleVenueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "NEW_VENUE") {
      setIsCreatingVenue(true);
      setVenueId("");
    } else {
      setIsCreatingVenue(false);
      setVenueId(value);
    }
  };

  const handleNewVenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewVenue({ ...newVenue, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Build the base payload
      const payload: CreateGigPayload = {
        date: currentDate,
        payment: parseFloat(payment),
        confirmed: confirmed,
      };

      // 2. Attach either the new venue object OR the existing venue ID
      if (isCreatingVenue) {
        payload.venue = {
          name: newVenue.name,
          street: newVenue.street,
          city: newVenue.city,
          province: newVenue.province,
          postal_code: newVenue.postalCode,
        };
      } else {
        payload.venue_id = parseInt(venueId, 10);
      }

      // 3. Determine URL and Method
      const url = existingGig?.gig_id
        ? `${import.meta.env.VITE_API_URL}api/gigs/${existingGig.gig_id}`
        : `${import.meta.env.VITE_API_URL}api/gigs`;

      const method = existingGig?.gig_id ? "PATCH" : "POST";

      // 4. Send the single transaction payload
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save gig and venue transaction");

      revalidator.revalidate();
      onClose();
    } catch (error) {
      console.error("Save Error:", error);
      alert("Failed to save gig/venue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedDate = new Date(`${currentDate}T12:00:00`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>{existingGig ? "Edit Gig" : "Add New Gig"}</h2>
        <p className={styles.dateSubtitle}>{formattedDate}</p>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Venue</label>
            <select
              value={isCreatingVenue ? "NEW_VENUE" : venueId}
              onChange={handleVenueChange}
              required
            >
              <option value="" disabled>Select a venue...</option>
              <option value="NEW_VENUE" className={styles.newVenueOption}>
                + Create New Venue
              </option>
              {venues.map((v) => (
                <option key={v.venue_id} value={v.venue_id}>
                  {v.name} - {v.city}
                </option>
              ))}
            </select>
          </div>

          {/* Conditional Rendering for New Venue Fields */}
          {isCreatingVenue && (
            <div className={styles.newVenueContainer}>
              <h4>New Venue Details</h4>
              <div className={styles.formGroup}>
                <input
                  type="text"
                  name="name"
                  placeholder="Venue Name"
                  value={newVenue.name}
                  onChange={handleNewVenueChange}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <input
                  type="text"
                  name="street"
                  placeholder="Street Address"
                  value={newVenue.street}
                  onChange={handleNewVenueChange}
                  required
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={newVenue.city}
                    onChange={handleNewVenueChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <input
                    type="text"
                    name="province"
                    placeholder="Prov/State"
                    value={newVenue.province}
                    onChange={handleNewVenueChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="Postal Code"
                    value={newVenue.postalCode}
                    onChange={handleNewVenueChange}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Payment ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
              required
              placeholder="e.g. 500.00"
            />
          </div>

          <div className={styles.checkboxGroup}>
            <label>
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              Gig is Confirmed
            </label>
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelBtn}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.confirmBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Gig"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
