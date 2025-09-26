
"use client";

import { useState, useEffect, Suspense } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Database, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getLocationCacheContents, clearLocationCache } from '@/lib/storage';

type CacheEntry = {
    id: string;
    suggestions: { placeName: string; placeAddress: string }[];
};

function DatabaseCacheViewerPage() {
    const [cacheEntries, setCacheEntries] = useState<CacheEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchCache = async () => {
        setIsLoading(true);
        const contents = await getLocationCacheContents();
        setCacheEntries(contents);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchCache();
    }, []);

    const handleClearCache = async () => {
        setIsLoading(true);
        await clearLocationCache();
        await fetchCache();
        toast({
            title: "Cache Cleared",
            description: "The location cache has been successfully cleared.",
        });
        setIsLoading(false);
    };

    return (
        <AppLayout>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Database />
                            Location Cache Viewer
                        </CardTitle>
                        <CardDescription>
                            A real-time view of the globally cached location searches in Firestore.
                        </CardDescription>
                    </div>
                    <Button variant="destructive" onClick={handleClearCache} disabled={isLoading}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear All
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Search Term (ID)</TableHead>
                                    <TableHead>Cached Suggestions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cacheEntries.length > 0 ? (
                                    cacheEntries.map((entry) => (
                                        <TableRow key={entry.id}>
                                            <TableCell className="font-mono font-medium">{entry.id}</TableCell>
                                            <TableCell>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    {entry.suggestions.map((s, index) => (
                                                        <li key={index} className="text-sm">
                                                            <strong>{s.placeName}</strong> - <span className="text-muted-foreground">{s.placeAddress}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={2} className="h-24 text-center">
                                            The location cache is currently empty.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </AppLayout>
    );
}

export default function DatabasePage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <DatabaseCacheViewerPage />
        </Suspense>
    );
}
