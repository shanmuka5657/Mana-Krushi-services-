
"use client";

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IndianRupee } from 'lucide-react';
import { ShoppingCart } from 'lucide-react';

export function KotakBanner() {
    return (
        <a href="https://clnk.in/w6hB" target="_blank" rel="noopener noreferrer" className="block w-full group mb-6">
            <Card className="w-full overflow-hidden relative text-white bg-blue-900 aspect-[4/1] md:aspect-[5/1]">
                 <Image 
                    src="https://picsum.photos/seed/kotak-account/1200/240"
                    alt="Kotak 811 Digital Savings Account"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105 opacity-20"
                    data-ai-hint="bank account"
                />
                <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-center items-center text-center">
                    <h3 className="text-lg md:text-2xl font-bold">Kotak 811 Digital Savings Account</h3>
                    <p className="mt-1 text-xs md:text-sm max-w-md">Open a zero balance savings account online in minutes.</p>
                    <Button size="sm" className="mt-3 w-fit bg-white text-blue-900 hover:bg-gray-100 text-xs md:text-sm">
                        Open Account
                    </Button>
                </div>
            </Card>
        </a>
    )
}

export function PoonawallaBanner() {
    return (
        <a href="https://clnk.in/w6hE" target="_blank" rel="noopener noreferrer" className="block w-full group mt-6">
            <Card className="w-full overflow-hidden relative text-white bg-green-900 aspect-[4/1] md:aspect-[5/1]">
                 <Image 
                    src="https://picsum.photos/seed/poonawalla-loan/1200/240"
                    alt="Poonawalla Fincorp Instant Loan"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105 opacity-20"
                    data-ai-hint="finance loan"
                />
                <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-center items-center text-center">
                    <h3 className="text-lg md:text-2xl font-bold">Poonawalla Fincorp Instant Loan</h3>
                    <p className="mt-1 text-xs md:text-sm max-w-md">Get instant personal loans with attractive interest rates.</p>
                    <Button size="sm" className="mt-3 w-fit bg-white text-green-900 hover:bg-gray-100 text-xs md:text-sm">
                        Apply Now
                    </Button>
                </div>
            </Card>
        </a>
    )
}

export function IndusIndBanner() {
    return (
        <a href="https://clnk.in/w6hk" target="_blank" rel="noopener noreferrer" className="block w-full group mb-6">
            <Card className="w-full overflow-hidden relative text-white bg-indigo-900 aspect-[4/1] md:aspect-[5/1]">
                 <Image 
                    src="https://picsum.photos/seed/indusind-loan/1200/240"
                    alt="IndusInd Bank Saving Account"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105 opacity-20"
                    data-ai-hint="bank offer"
                />
                <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-center items-center text-center">
                    <h3 className="text-lg md:text-2xl font-bold">Open an IndusInd Saving Account</h3>
                    <p className="mt-1 text-xs md:text-sm max-w-md">Get exclusive benefits with an IndusInd online saving account.</p>
                    <Button size="sm" className="mt-3 w-fit bg-white text-indigo-900 hover:bg-gray-100 text-xs md:text-sm">
                        Apply Now <IndianRupee className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </Card>
        </a>
    )
}

export function BajajBanner() {
    return (
        <a href="https://clnk.in/w6hf" target="_blank" rel="noopener noreferrer" className="block w-full group mt-6">
            <Card className="w-full overflow-hidden relative text-white bg-blue-900 aspect-[4/1] md:aspect-[5/1]">
                 <Image 
                    src="https://picsum.photos/seed/bajaj-loan/1200/240"
                    alt="Bajaj Finserv Personal Loan"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105 opacity-20"
                    data-ai-hint="finance loan"
                />
                <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-center items-center text-center">
                    <h3 className="text-lg md:text-2xl font-bold">Get a Personal Loan up to ₹40 Lakh</h3>
                    <p className="mt-1 text-xs md:text-sm max-w-md">Bajaj Finserv offers instant approval and disbursal in 24 hours.</p>
                    <Button size="sm" className="mt-3 w-fit bg-white text-blue-900 hover:bg-gray-100 text-xs md:text-sm">
                        Apply Now <IndianRupee className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </Card>
        </a>
    )
}

export function AxisBanner() {
    return (
        <a href="https://clnk.in/w6f1" target="_blank" rel="noopener noreferrer" className="block w-full group mb-6">
            <Card className="w-full overflow-hidden relative text-white aspect-[4/1] md:aspect-[5/1]">
                 <Image 
                    src="https://picsum.photos/seed/axis-banner/1200/240"
                    alt="Axis Bank Banner"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint="bank offer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-800/80 via-purple-600/60 to-transparent p-4 md:p-6 flex flex-col justify-center">
                    <h3 className="text-lg md:text-2xl font-bold">Axis Bank Digital Saving Account</h3>
                    <p className="mt-1 text-xs md:text-sm max-w-xs">Open a zero balance account online.</p>
                    <Button size="sm" className="mt-3 w-fit bg-white text-purple-900 hover:bg-gray-100 text-xs md:text-sm">
                        Apply Now <ShoppingCart className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </Card>
        </a>
    )
}
