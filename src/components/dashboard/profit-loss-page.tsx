
"use client";

import { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getBookings, getRoutes, getProfile, getCurrentUser } from '@/lib/storage';
import type { Booking, Route, Profile } from '@/lib/types';
import { Suspense } from 'react';
import { IndianRupee, TrendingUp, TrendingDown, Wallet, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format, isWithinInterval } from 'date-fns';
import { cn, formatCurrency } from '@/lib/utils';

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
    const [profile, setProfile] = useState<Profile | null>(null);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalFuelCost, setTotalFuelCost] = useState(0);
    const [totalPromotionCost, setTotalPromotionCost] = useState(0);
    const [netProfit, setNetProfit] = useState(0);
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [date, setDate] = useState<DateRange | undefined>(undefined);

    useEffect(() => {
        const calculateProfitLoss = async () => {
            setIsLoading(true);
            const userEmail = getCurrentUser();
            if (!userEmail) {
                setIsLoading(false);
                return;
            }
            
            const [userProfile, allBookings, allRoutes] = await Promise.all([
                getProfile(userEmail),
                getBookings(true),
                getRoutes(true),
            ]);
            setProfile(userProfile);

            const dateInterval = date?.from && date?.to ? { start: date.from, end: date.to } : null;

            const ownerBookings = allBookings.filter(b => {
                const bookingInDateRange = dateInterval ? isWithinInterval(new Date(b.departureDate), dateInterval) : true;
                return b.driverEmail === userEmail && (b.status === 'Completed' || b.paymentStatus === 'Paid') && bookingInDateRange;
            });
            
            const ownerRoutesInDateRange = allRoutes.filter(r => {
                const routeInDateRange = dateInterval ? isWithinInterval(new Date(r.travelDate), dateInterval) : true;
                return r.ownerEmail === userEmail && routeInDateRange;
            });
            
            // 1. Calculate Revenue
            const revenue = ownerBookings.reduce((acc, booking) => acc + booking.amount, 0);
            setTotalRevenue(revenue);

            // 2. Calculate Expenses
            // 2a. Fuel Cost (based on completed routes)
            let fuelCost = 0;
            if (userProfile?.mileage && userProfile.mileage > 0) {
                 const completedRouteIdentifiers = new Set(
                    ownerBookings.map(b => `${format(new Date(b.departureDate), 'yyyy-MM-dd')}-${b.destination}`)
                );
                
                const completedRoutesForFuelCalc = allRoutes.filter(route => {
                    const routeIdentifier = `${format(new Date(route.travelDate), 'yyyy-MM-dd')}-${route.fromLocation} to ${route.toLocation}`;
                    return completedRouteIdentifiers.has(routeIdentifier);
                });

                const totalDistance = completedRoutesForFuelCalc.reduce((acc, route) => acc + (route.distance || 0), 0);
                
                fuelCost = (totalDistance / userProfile.mileage) * FUEL_PRICE_PER_LITER;
                setTotalFuelCost(fuelCost);
            }

            // 2b. Promotion Cost
            const promotionCost = ownerRoutesInDateRange.filter(r => r.isPromoted).length * 100;
            setTotalPromotionCost(promotionCost);

            const expenses = fuelCost + promotionCost;
            setTotalExpenses(expenses);

            // 3. Calculate Net Profit
            setNetProfit(revenue - expenses);
            
            setIsLoading(false);
        };

        calculateProfitLoss();
    }, [date]);


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
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Profit &amp; Loss Statement</CardTitle>
                            <CardDescription>A financial overview of your ride-sharing business.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                    "w-[300px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.from ? (
                                    date.to ? (
                                        <>
                                        {format(date.from, "LLL dd, y")} -{" "}
                                        {format(date.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(date.from, "LLL dd, y")
                                    )
                                    ) : (
                                    <span>Pick a date range</span>
                                    )}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    mode="range"
                                    defaultMonth={date?.from}
                                    selected={date}
                                    onSelect={setDate}
                                    numberOfMonths={2}
                                />
                                </PopoverContent>
                            </Popover>
                             {date && <Button variant="ghost" onClick={() => setDate(undefined)}>Reset</Button>}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                         <StatCard 
                            title="Total Revenue" 
                            value={formatCurrency(totalRevenue, profile?.country)} 
                            icon={TrendingUp} 
                            color="text-green-500"
                            description="From completed rides."
                        />
                         <StatCard 
                            title="Total Expenses" 
                            value={formatCurrency(totalExpenses, profile?.country)} 
                            icon={TrendingDown} 
                            color="text-red-500"
                            description={`Fuel: ${formatCurrency(totalFuelCost, profile?.country)} | Promotions: ${formatCurrency(totalPromotionCost, profile?.country)}`}
                        />
                         <StatCard 
                            title="Net Profit" 
                            value={formatCurrency(netProfit, profile?.country)} 
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
                                <li><strong>Revenue</strong> is calculated from all your rides marked as 'Completed' or 'Paid' within the selected date range.</li>
                                <li><strong>Fuel Cost</strong> is an estimate based on the total distance of completed routes and your profile's mileage (Avg. Fuel Price: ₹{FUEL_PRICE_PER_LITER}/L). Fuel cost is always in INR.</li>
                                <li><strong>Promotion Cost</strong> is calculated at ₹100 for each route created within the selected date range that was marked as 'Promoted'.</li>
                                <li>This is an estimate. Actual profit may vary based on maintenance, insurance, and other operational costs.</li>
                            </ul>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

export default ProfitLossPageContent;
