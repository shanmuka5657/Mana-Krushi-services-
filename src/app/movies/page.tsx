
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MoviesPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to the new entertainment page
        router.replace('/entertainment');
    }, [router]);

    return null; // Or a loading spinner
}

    