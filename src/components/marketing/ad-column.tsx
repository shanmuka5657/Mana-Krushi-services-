
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AxisBanner, BajajBanner, IndusIndBanner, KotakBanner, PoonawallaBanner } from "./ad-banners";

export function AdColumn() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Offers For You</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <KotakBanner />
                    <PoonawallaBanner />
                    <AxisBanner />
                    <IndusIndBanner />
                    <BajajBanner />
                </CardContent>
            </Card>
        </div>
    )
}
