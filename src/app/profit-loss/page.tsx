
"use client";

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getBookings, getRoutes, getProfile, getCurrentUser } from '@/lib/storage';
import type { Booking, Route, Profile } from '@/lib/types';
import { Suspense } from 'react';
import { IndianRupee, TrendingUp, TrendingDown, Wallet, Loader2 } from 'lucide-react';

const FUEL_PRICE_PER_LITER = 105; // Average fuel price in INR

function StatCard({ title, value, icon, color, description }: { title: string, value: string, icon: React.ElementType, color: string, description?: string }) {
    const Icon = icon;
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={`h-4 w-4 ${color}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </CardContent>
        </Card>
    );
}

function ProfitLossPageContent() {
    const [isLoading, setIsLoading] = useState(true);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalFuelCost, setTotalFuelCost] = useState(0);
    const [totalPromotionCost, setTotalPromotionCost] = useState(0);
    const [netProfit, setNetProfit] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);

    useEffect(() => {
        const calculateProfitLoss = async () => {
            const userEmail = getCurrentUser();
            if (!userEmail) {
                setIsLoading(false);
                return;
            }
            
            const [profile, allBookings, allRoutes] = await Promise.all([
                getProfile(userEmail),
                getBookings(true),
                getRoutes(true),
            ]);

            const ownerBookings = allBookings.filter(b => b.driverEmail === userEmail && b.status === 'Completed' && b.paymentStatus === 'Paid');
            const ownerRoutes = allRoutes.filter(r => r.ownerEmail === userEmail);
            
            // 1. Calculate Revenue
            const revenue = ownerBookings.reduce((acc, booking) => acc + booking.amount, 0);
            setTotalRevenue(revenue);

            // 2. Calculate Expenses
            // 2a. Fuel Cost
            let fuelCost = 0;
            if (profile?.mileage && profile.mileage > 0) {
                const totalDistance = ownerRoutes
                    .filter(route => ownerBookings.some(b => `${route.fromLocation} to ${route.toLocation}` === b.destination && new Date(route.travelDate).getTime() === new Date(b.departureDate).getTime() ))
                    .reduce((acc, route) => acc + (route.distance || 0), 0);
                
                fuelCost = (totalDistance / profile.mileage) * FUEL_PRICE_PER_LITER;
                setTotalFuelCost(fuelCost);
            }

            // 2b. Promotion Cost
            const promotionCost = ownerRoutes.filter(r => r.isPromoted).length * 100;
            setTotalPromotionCost(promotionCost);

            const expenses = fuelCost + promotionCost;
            setTotalExpenses(expenses);

            // 3. Calculate Net Profit
            setNetProfit(revenue - expenses);
            
            setIsLoading(false);
        };

        calculateProfitLoss();
    }, []);


    if (isLoading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle>Profit &amp; Loss Statement</CardTitle>
                    <CardDescription>A financial overview of your ride-sharing business.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                         <StatCard 
                            title="Total Revenue" 
                            value={`₹${totalRevenue.toFixed(2)}`} 
                            icon={TrendingUp} 
                            color="text-green-500"
                            description="From completed and paid rides."
                        />
                         <StatCard 
                            title="Total Expenses" 
                            value={`₹${totalExpenses.toFixed(2)}`} 
                            icon={TrendingDown} 
                            color="text-red-500"
                            description={`Fuel: ₹${totalFuelCost.toFixed(2)} | Promotions: ₹${totalPromotionCost.toFixed(2)}`}
                        />
                         <StatCard 
                            title="Net Profit" 
                            value={`₹${netProfit.toFixed(2)}`} 
                            icon={Wallet} 
                            color={netProfit >= 0 ? 'text-blue-500' : 'text-red-500'}
                            description="Revenue minus all expenses."
                        />
                    </div>
                    <Card className="bg-muted/50">
                        <CardHeader>
                            <CardTitle className="text-lg">Calculation Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                                <li><strong>Revenue</strong> is calculated from all your rides marked as 'Completed' and 'Paid'.</li>
                                <li><strong>Fuel Cost</strong> is an estimate based on the total distance of your completed routes and the mileage entered in your profile (Avg. Fuel Price: ₹{FUEL_PRICE_PER_LITER}/L).</li>
                                <li><strong>Promotion Cost</strong> is calculated at ₹100 for each route you have marked as 'Promoted'.</li>
                                <li>This is an estimate. Actual profit may vary based on maintenance, insurance, and other operational costs.</li>
                            </ul>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

export default function ProfitLossPage() {
    return(
        <Suspense>
            <ProfitLossPageContent />
        </Suspense>
    )
}
