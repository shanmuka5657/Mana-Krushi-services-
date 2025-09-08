
import type { Booking, Route } from "./types";
import type { ProfileFormValues } from "@/components/dashboard/profile-form";


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
    // Set initial data if nothing is stored
    saveBookings(initialBookings);
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
    // Set initial data if nothing is stored
    saveRoutes(initialRoutes);
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

// Functions for profile
export const saveProfile = (profile: ProfileFormValues) => {
    if (!isBrowser) return;
    try {
        const userEmail = getCurrentUser();
        if (userEmail) {
            const profiles = getAllProfiles();
            profiles[userEmail] = profile;
            window.localStorage.setItem('userProfiles', JSON.stringify(profiles));
        }
    } catch (error) {
        console.error("Failed to save profile to localStorage", error);
    }
};

export const getProfile = (): ProfileFormValues | null => {
    if (!isBrowser) return null;
    try {
        const userEmail = getCurrentUser();
        if (userEmail) {
            const profiles = getAllProfiles();
            return profiles[userEmail] || null;
        }
        return null;
    } catch (error) {
        console.error("Failed to parse profile from localStorage", error);
        return null;
    }
};

const getAllProfiles = (): { [email: string]: ProfileFormValues } => {
    if (!isBrowser) return {};
    try {
        const storedProfiles = window.localStorage.getItem('userProfiles');
        return storedProfiles ? JSON.parse(storedProfiles) : {};
    } catch (error) {
        console.error("Failed to parse profiles from localStorage", error);
        return {};
    }
}


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
