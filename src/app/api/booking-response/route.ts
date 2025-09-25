
import { NextResponse } from 'next/server';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { devFirebaseConfig } from '@/lib/firebase-config.dev';
import type { Booking } from '@/lib/types';

// Initialize Firebase Admin
const app = getApps().length ? getApp() : initializeApp(devFirebaseConfig);
const db = getFirestore(app);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get('bookingId');
  const action = searchParams.get('action');

  if (!bookingId || !action || (action !== 'confirm' && action !== 'reject')) {
    return new Response('<h1>Invalid Request</h1><p>Missing bookingId or action.</p>', {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    });
  }

  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    const bookingSnap = await getDoc(bookingRef);

    if (!bookingSnap.exists()) {
      return new Response('<h1>Booking Not Found</h1><p>The booking ID is invalid or has been deleted.</p>', {
        status: 404,
        headers: { 'Content-Type': 'text/html' },
      });
    }
    
    const booking = bookingSnap.data() as Booking;

    if (action === 'confirm') {
      if (booking.status === 'Confirmed') {
         return new Response('<h1>Already Confirmed</h1><p>This booking has already been confirmed.</p>', {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
        });
      }
      await updateDoc(bookingRef, { status: 'Confirmed' });
      return new Response('<h1>Booking Confirmed!</h1><p>Thank you. The passenger has been notified.</p>', {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    if (action === 'reject') {
       if (booking.status === 'Cancelled') {
         return new Response('<h1>Already Cancelled</h1><p>This booking has already been cancelled.</p>', {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
        });
      }
      await updateDoc(bookingRef, { status: 'Cancelled', cancellationReason: 'Rejected by driver' });
       return new Response('<h1>Booking Rejected</h1><p>The booking has been cancelled. The passenger will be notified.</p>', {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      });
    }

    return new Response('<h1>Invalid Action</h1><p>The provided action is not valid.</p>', {
      status: 400,
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (error) {
    console.error("Error updating booking:", error);
    return new Response('<h1>Server Error</h1><p>Could not update booking status.</p>', {
      status