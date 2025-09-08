
import type { Booking, Route } from "./types";

const isBrowser = typeof window !== "undefined";

const initialBookings: Booking[] = [
  {
    id: "#BK001",
    client: "John Smith",
    destination: "Paris, France",
    departureDate: new Date("2023-08-15T09:00:00"),
    returnDate: new Date("2023-08-22T17:00:00"),
    amount: 2450,
    status: "Confirmed",
    mobile: "1234567890",
    travelers: "2",
  },
  {
    id: "#BK002",
    client: "Emma Wilson",
    destination: "Bali, Indonesia",
    departureDate: new Date("2023-08-22T10:00:00"),
    returnDate: new Date("2023-08-29T18:00:00"),
    amount: 1890,
    status: "Pending",
    mobile: "1234567890",
    travelers: "1",
  },
];

const initialRoutes: Route[] = [
    { 
        id: "1", 
        ownerName: 'Alice', 
        fromLocation: 'New York', 
        toLocation: 'Boston', 
        travelDate: new Date("2024-08-15T00:00:00"),
        departureTime: '08:00', 
        arrivalTime: '12:00', 
        availableSeats: 3, 
        vehicleType: 'Sedan',
        driverName: "Alice",
        driverMobile: "1234567890",
        price: 550,
        rating: 4.8
    },
    { 
        id: "2", 
        ownerName: 'Bob', 
        fromLocation: 'San Francisco', 
        toLocation: 'Los Angeles', 
        travelDate: new Date("2024-08-16T00:00:00"),
        departureTime: '10:00', 
        arrivalTime: '16:00', 
        availableSeats: 2, 
        vehicleType: 'SUV',
        driverName: "Bob",
        driverMobile: "1234567890",
        price: 750,
        rating: 4.9
    },
    { 
        id: "3", 
        ownerName: 'Charlie', 
        fromLocation: 'New York', 
        toLocation: 'Boston', 
        travelDate: new Date("2024-08-15T00:00:00"),
        departureTime: '14:00', 
        arrivalTime: '18:00', 
        availableSeats: 4, 
        vehicleType: 'Minivan',
        driverName: "Charlie",
        driverMobile: "1234567890",
        price: 500,
        rating: 4.5
    },
];

// Functions for bookings
export const getBookings = (): Booking[] => {
    if (!isBrowser) return initialBookings;
    try {
        const storedBookings = window.localStorage.getItem('bookings');
        if (storedBookings) {
            const parsed = JSON.parse(storedBookings);
            // Dates need to be converted back to Date objects
            return parsed.map((b: any) => ({
                ...b,
                departureDate: new Date(b.departureDate),
                returnDate: new Date(b.returnDate),
            }));
        }
    } catch (error) {
        console.error("Failed to parse bookings from localStorage", error);
    }
    return initialBookings;
};

export const saveBookings = (bookings: Booking[]) => {
    if (!isBrowser) return;
    try {
        window.localStorage.setItem('bookings', JSON.stringify(bookings));
    } catch (error) {
        console.error("Failed to save bookings to localStorage", error);
    }
};

// Functions for routes
export const getRoutes = (): Route[] => {
    if (!isBrowser) return initialRoutes;
    try {
        const storedRoutes = window.localStorage.getItem('routes');
        if (storedRoutes) {
            const parsed = JSON.parse(storedRoutes);
             // Dates need to be converted back to Date objects
            return parsed.map((r: any) => ({
                ...r,
                travelDate: new Date(r.travelDate),
            }));
        }
    } catch (error) {
        console.error("Failed to parse routes from localStorage", error);
    }
    return initialRoutes;
};

export const saveRoutes = (routes: Route[]) => {
    if (!isBrowser) return;
    try {
        window.localStorage.setItem('routes', JSON.stringify(routes));
    } catch (error) {
        console.error("Failed to save routes to localStorage", error);
    }
};
