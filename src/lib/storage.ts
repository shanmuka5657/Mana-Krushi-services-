

import type { Booking, Route } from "./types";
import type { ProfileFormValues } from "@/components/dashboard/profile-form";
import { getBookingsFromFirestore, saveBookingsToFirestore, getRoutesFromFirestore, saveRoutesToFirestore, addRouteToFirestore, getProfileFromFirestore, saveProfileToFirestore } from './firebase';


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
        ownerName: 'Srinivas',
        fromLocation: 'Kurnool',
        toLocation: 'Hyderabad',
        travelDate: new Date("2024-08-15T00:00:00"),
        departureTime: '09:00',
        arrivalTime: '18:00',
        availableSeats: 3,
        vehicleType: 'Sedan',
        driverName: "Srinivas",
        driverMobile: "1234567890",
        price: 500,
        rating: 4.5
    },
    {
        id: "2",
        ownerName: 'Srinivas',
        fromLocation: 'Kurnool',
        toLocation: 'Hyderabad',
        travelDate: new Date("2024-08-16T00:00:00"),
        departureTime: '09:00',
        arrivalTime: '18:00',
        availableSeats: 2,
        vehicleType: 'SUV',
        driverName: "Srinivas",
        driverMobile: "1234567890",
        price: 500,
        rating: 4.5
    },
    {
        id: "3",
        ownerName: 'Srinivas',
        fromLocation: 'Kurnool',
        toLocation: 'Hyderabad',
        travelDate: new Date("2024-08-15T00:00:00"),
        departureTime: '09:00',
        arrivalTime: '18:00',
        availableSeats: 4,
        vehicleType: 'Minivan',
        driverName: "Srinivas",
        driverMobile: "1234567890",
        price: 550,
        rating: 4.5
    },
];

// Functions for bookings
export const getBookings = async (): Promise<Booking[]> => {
    if (!isBrowser) return [];
    try {
        const bookings = await getBookingsFromFirestore();
        if (bookings.length === 0) {
            await saveBookingsToFirestore(initialBookings);
            return initialBookings;
        }
        return bookings;
    } catch (error) {
        console.error("Error getting bookings:", error);
        return [];
    }
};

export const saveBookings = async (bookings: Booking[]) => {
     if (!isBrowser) return;
    await saveBookingsToFirestore(bookings);
};

// Functions for routes
export const getRoutes = async (): Promise<Route[]> => {
    if (!isBrowser) return [];
    try {
        const routes = await getRoutesFromFirestore();
        if (routes.length === 0) {
            await saveRoutesToFirestore(initialRoutes);
            return initialRoutes;
        }
        return routes;
    } catch(e) {
        console.error("Error getting routes:", e);
        return [];
    }
};

export const saveRoutes = async (routes: Route[]) => {
    if (!isBrowser) return;
    await saveRoutesToFirestore(routes);
};

export const addRoute = async (route: Omit<Route, 'id'>): Promise<Route> => {
    if (!isBrowser) throw new Error("This function can only be called from the browser.");
    return await addRouteToFirestore(route);
}

// Functions for profile
export const saveProfile = async (profile: ProfileFormValues) => {
    if (!isBrowser) return;
    const userEmail = getCurrentUser();
    if (userEmail) {
        await saveProfileToFirestore({ ...profile, email: userEmail });
    }
};

export const getProfile = async (): Promise<ProfileFormValues | null> => {
    if (!isBrowser) return null;
    const userEmail = getCurrentUser();
    if (userEmail) {
        return await getProfileFromFirestore(userEmail);
    }
    return null;
};


// Functions for user session
export const saveCurrentUser = (email: string, name: string) => {
    if (!isBrowser) return;
    try {
        window.sessionStorage.setItem('currentUserEmail', email);
        window.sessionStorage.setItem('currentUserName', name);
    } catch (error) {
        console.error("Failed to save current user to sessionStorage", error);
    }
}

export const getCurrentUser = (): string | null => {
    if (!isBrowser) return null;
    return window.sessionStorage.getItem('currentUserEmail');
}

export const getCurrentUserName = (): string | null => {
    if (!isBrowser) return null;
    return window.sessionStorage.getItem('currentUserName');
}

export const clearCurrentUser = () => {
    if (!isBrowser) return;
    window.sessionStorage.removeItem('currentUserEmail');
    window.sessionStorage.removeItem('currentUserName');
}
