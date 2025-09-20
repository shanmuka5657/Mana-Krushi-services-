
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense, useState } from 'react';
import { Tv, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import YouTube from 'react-youtube';

const liveChannels = [
    { name: 'Aaj Tak', href: 'https://www.youtube.com/watch?v=5LafsV0iNqA', logo: 'https://yt3.googleusercontent.com/ytc/AIdro_k6_N24qI8T2hS-iHjVdJvj2bM9gG-c_i9g5k-w=s176-c-k-c0x00ffffff-no-rj' },
    { name: 'India TV', href: 'https://www.youtube.com/watch?v=XmmvI1s-2wM', logo: 'https://yt3.googleusercontent.com/ytc/AIdro_kH1dCPa_m3dM091Y2s3n2aF-sKk7b7wS-jY_Vw=s176-c-k-c0x00ffffff-no-rj' },
    { name: 'NDTV India', href: 'https://www.youtube.com/watch?v=WB-y7_B2p_c', logo: 'https://yt3.googleusercontent.com/ytc/AIdro_kH_Vd2yYg11f3TgywFqQzYwKqF-i8aD_vP9w=s176-c-k-c0x00ffffff-no-rj' },
    { name: 'ABP News', href: 'https://www.youtube.com/watch?v=nyd-xznCpJc', logo: 'https://yt3.googleusercontent.com/ytc/AIdro_kH_g_d_X-x_Vb5aW_mY_n3b9aD_zP5c_i9g5k-w=s176-c-k-c0x00ffffff-no-rj' },
    { name: 'DD News', href: 'https://www.youtube.com/watch?v=d_k8w8b8o0A', logo: 'https://yt3.googleusercontent.com/ytc/AIdro_k4_X-x_Vb5aW_mY_n3b9aD_zP5c_i9g5k-w=s176-c-k-c0x00ffffff-no-rj' },
    { name: 'TV9 Bharatvarsh', href: 'https://www.youtube.com/watch?v=k8vJ8v8j8wA', logo: 'https://yt3.googleusercontent.com/ytc/AIdro_kH_g_d_X-x_Vb5aW_mY_n3b9aD_zP5c_i9g5k-w=s176-c-k-c0x00ffffff-no-rj' },
    { name: 'Republic Bharat', href: 'https://www.youtube.com/watch?v=gS3aM8j8wA', logo: 'https://yt3.googleusercontent.com/ytc/AIdro_kH_g_d_X-x_Vb5aW_mY_n3b9aD_zP5c_i9g5k-w=s176-c-k-c0x00ffffff-no-rj' },
    { name: 'News18 India', href: 'https://www.youtube.com/watch?v=r_h8g_d_X-x_Vb5aW_mY_n3b9aD_zP5c_i9g5k-w', logo: 'https://yt3.googleusercontent.com/ytc/AIdro_kH_g_d_X-x_Vb5aW_mY_n3b9aD_zP5c_i9g5k-w=s176-c-k-c0x00ffffff-no-rj' },
    { name: 'National Geographic', href: 'https://www.youtube.com/watch?v=d4leS2K-fQo', logo: 'https://yt3.googleusercontent.com/ytc/AIdro_mUa3p-n3sU_sOdeT-2L8iHOUmD_w_B8Yg_dY_w=s176-c-k-c0x00ffffff-no-rj' },
];

function ChannelCard({ name, logo, onClick }: { name: string, logo: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="group w-full"
        >
            <Card className="h-full flex flex-col items-center justify-center p-4 text-center transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="relative h-20 w-20 mb-4 rounded-full overflow-hidden">
                    <Image src={logo} alt={`${name} logo`} layout="fill" objectFit="cover" />
                </div>
                <h3 className="font-semibold text-md text-foreground">{name}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                    Watch Live <ExternalLink className="h-3 w-3" />
                </p>
            </Card>
        </button>
    );
}

const extractVideoId = (url: string | null): string | null => {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            return urlObj.pathname.slice(1);
        }
        if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
            return urlObj.searchParams.get('v');
        }
    } catch (error) {
        console.error('Invalid URL for YouTube video:', url);
    }
    return null;
};


function LiveBroadcastsPageContent() {
    const [selectedChannel, setSelectedChannel] = useState<{name: string, href: string} | null>(null);

    const videoId = selectedChannel ? extractVideoId(selectedChannel.href) : null;

    const opts = {
        height: '390',
        width: '100%',
        playerVars: {
            autoplay: 1,
        },
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Tv /> Live Broadcasts
                        </CardTitle>
                        <CardDescription>Watch free live news channels from India.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {liveChannels.map((channel) => (
                                <ChannelCard 
                                    key={channel.name}
                                    name={channel.name}
                                    logo={channel.logo}
                                    onClick={() => setSelectedChannel(channel)}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
             <Dialog open={!!selectedChannel} onOpenChange={(isOpen) => !isOpen && setSelectedChannel(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{selectedChannel?.name}</DialogTitle>
                        <DialogDescription>Live Broadcast</DialogDescription>
                    </DialogHeader>
                    {videoId ? (
                        <YouTube videoId={videoId} opts={opts} className="w-full aspect-video" />
                    ) : (
                        <div className="w-full aspect-video flex items-center justify-center bg-muted text-muted-foreground">
                            <p>Could not load video.</p>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

export default function LiveBroadcastsPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <LiveBroadcastsPageContent />
        </Suspense>
    );
}

    