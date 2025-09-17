
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense, useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import { MonitorPlay, Link as LinkIcon, ChevronRight, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Image from 'next/image';
import placeholderImages from '@/lib/placeholder-images.json';

const newSmartLinks = [
    { name: "Smartlink_1", href: "https://markswaitingrouge.com/hyartub4x?key=d892b1670480ffb487d89b3817e5e7ac" },
    { name: "Smartlink_116", href: "https://markswaitingrouge.com/n1xdeci80i?key=500f9321da5a8b8529d266ae1784d179" },
    { name: "Smartlink_110", href: "https://markswaitingrouge.com/y3hmr884a?key=399c36e2b0a2917cec9cf226e053fc00" },
    { name: "Smartlink_111", href: "https://markswaitingrouge.com/vtjmwpg4s?key=4c129b83d2b7dd6d48dc64c50d5eaa80" },
    { name: "Smartlink_8", href: "https://markswaitingrouge.com/khjxsva4?key=e2f5f35bde660d3decfd60ad68291dc1" },
    { name: "Smartlink_113", href: "https://markswaitingrouge.com/izku1pp2ks?key=eb1ec466c1cc5330451e5feca2b66911" },
    { name: "Smartlink_115", href: "https://markswaitingrouge.com/xi90ui3e?key=064d1222f50f3e4e8e5b0c7441d2737d" },
    { name: "Smartlink_6", href: "https://markswaitingrouge.com/cmpjkdem?key=29b9d93e0b8a07adb2edb7530ce75418" },
    { name: "Smartlink_20", href: "https://markswaitingrouge.com/g7cwyrik?key=03a95b8789ff420064cca469e6e0d8d3" },
    { name: "Smartlink_11", href: "https://markswaitingrouge.com/krm37igh?key=c7763dda3bed41d5ec713d55160ce80b" },
    { name: "Smartlink_16", href: "https://markswaitingrouge.com/sb4j0zvt?key=3a41f3bde6ddfae280c3822b2368bc6c" },
    { name: "Smartlink_14", href: "https://markswaitingrouge.com/pif8hc06e3?key=806a5ce2c19b5b4e9dc48141dfc476dd" },
    { name: "Smartlink_10", href: "https://markswaitingrouge.com/vp1ge6k02?key=c489b06da0cf1ceed18ed4d4ad470ee4" },
    { name: "Smartlink_9", href: "https://markswaitingrouge.com/yscmceke?key=325c6afc1d7d83b30524372aa1e584c4" },
    { name: "Smartlink_19", href: "https://markswaitingrouge.com/cg9hjv2957?key=aa535d9cefc044de0c3f116f9fc0df30" },
    { name: "Smartlink_13", href: "https://markswaitingrouge.com/yhpbyr1hc0?key=121375fe1b6d287983723ef859ac6d7d" },
    { name: "Smartlink_7", href: "https://markswaitingrouge.com/jmnqe1gc?key=53755058a15fd950718897e97e84b512" },
    { name: "Smartlink_17", href: "https://markswaitingrouge.com/ridvqpvr7?key=270c4065b81c3e649f001d289f315113" },
    { name: "Smartlink_15", href: "https://markswaitingrouge.com/qyy895we?key=cdd8d956b2f9b5f1260f3d939a32116c" },
    { name: "Smartlink_12", href: "https://markswaitingrouge.com/tzshk4sn?key=6497b840915a8293b880426b63b520d9" },
    { name: "Smartlink_18", href: "https://markswaitingrouge.com/rrch2di8?key=2ea9f6e97d4f2313dbd9d0ec759a10db" },
    { name: "Smartlink_30", href: "https://markswaitingrouge.com/gn0rtp68h?key=38b9ae24fed8c22d67b7cda26b9f9185" },
    { name: "Smartlink_35", href: "https://markswaitingrouge.com/r063ky9w?key=f9b0b6300cbf3d57324614a2d90f413f" },
    { name: "Smartlink_22", href: "https://markswaitingrouge.com/xs9sbkqc8?key=a44ee277986f2ccdc153fd06cd2285dd" },
    { name: "Smartlink_29", href: "https://markswaitingrouge.com/u73vga5j?key=d0d54abbdb12ed811cf25ed960bdf59f" },
    { name: "Smartlink_28", href: "https://markswaitingrouge.com/iq8f7uk8ij?key=0ecfa4f0c7dc637ddf44da1b78b2d903" },
    { name: "Smartlink_24", href: "https://markswaitingrouge.com/jxdwpjxc?key=8562e5a9a2f895a6a12e5363c982dc2d" },
    { name: "Smartlink_25", href: "https://markswaitingrouge.com/vkjz7dn73?key=7176105a20b0a64185eaae28824c5968" },
    { name: "Smartlink_37", href: "https://markswaitingrouge.com/qp903znizm?key=655122a1d4e9439c8542dcc0989b5baa" },
    { name: "Smartlink_39", href: "https://markswaitingrouge.com/hfugq62u?key=fed2d0b5fc3b21b5a5be8857f795d410" },
    { name: "Smartlink_52", href: "https://markswaitingrouge.com/u84i3t7wm?key=1336d3b6c2c7e7955dc2fcb79a6e2153" },
    { name: "Smartlink_53", href: "https://markswaitingrouge.com/buuq41vt5?key=32b03f1855563c3adc0beb3fcc2a7690" },
    { name: "Smartlink_62", href: "https://markswaitingrouge.com/kk4i62rfe6?key=75a0be631d8f318233868266e122a548" },
    { name: "Smartlink_65", href: "https://markswaitingrouge.com/yp328dgin?key=f6fec4ba6327dc952736839f224b7aec" },
    { name: "Smartlink_69", href: "https://markswaitingrouge.com/yhyzuqqa?key=787f92844e2098bedeebc799636e4e91" },
    { name: "Smartlink_78", href: "https://markswaitingrouge.com/emxqiu94?key=baa83d37604740c29c944b9dbf02683b" },
    { name: "Smartlink_95", href: "https://markswaitingrouge.com/qe8dcevpm1?key=498c423c0beb0a9c80b61d6f219fe2eb" },
    { name: "Smartlink_21", href: "https://markswaitingrouge.com/e6gqdbj6f?key=5db17bdc596ae2ab99a42c7be9dfeec3" },
    { name: "Smartlink_36", href: "https://markswaitingrouge.com/d5en51r13y?key=971ca5910cd9434e490111167ef7cbe1" },
    { name: "Smartlink_23", href: "https://markswaitingrouge.com/xtb530c2rv?key=703a94e4cf472df707d4977b42731370" },
    { name: "Smartlink_38", href: "https://markswaitingrouge.com/v767rswz?key=8162889e026f093e758edd5855900adf" },
    { name: "Smartlink_47", href: "https://markswaitingrouge.com/zs451ueu?key=574f7aebbe45c78edf46a892241338fd" },
    { name: "Smartlink_27", href: "https://markswaitingrouge.com/fbpemmyjj?key=c4294d6fb165bc6898fdf1a8730e0f73" },
    { name: "Smartlink_26", href: "https://markswaitingrouge.com/g7qbgcj1q?key=cee9b57e78ae0bbcb449ec8e0c89fd92" },
    { name: "Smartlink_55", href: "https://markswaitingrouge.com/xd2kgbv5g?key=89e04c1ed586fca8d28ee7de7b02cb52" },
    { name: "Smartlink_86", href: "https://markswaitingrouge.com/g053i6er?key=225822b23fb863ce7996aa7242026ed3" },
    { name: "Smartlink_48", href: "https://markswaitingrouge.com/e7jamkj30f?key=fa62dbb4e3966c3178ef7b198cce3b75" },
    { name: "Smartlink_41", href: "https://markswaitingrouge.com/tg71wanixh?key=b5e500ada5f349b9d537da224bd9bd51" },
    { name: "Smartlink_50", href: "https://markswaitingrouge.com/mmqmpbx6m?key=91e1c1cd8424b63541ae72d94d60b016" },
    { name: "Smartlink_77", href: "https://markswaitingrouge.com/nkg78yrg7g?key=80ed3305092bdd5c539e6d33e4885b05" },
    { name: "Smartlink_31", href: "https://markswaitingrouge.com/eei7x7xdw?key=f0d3b86b86235f21c6ed0ab1f18dca5d" },
    { name: "Smartlink_32", href: "https://markswaitingrouge.com/q6f3jmt5nu?key=ab9041d89ee6a96bfd6b0ee0dff79b51" },
    { name: "Smartlink_33", href: "https://markswaitingrouge.com/zcb45qdjzs?key=4a05dfeaa6869f0da3bbcc4e186df2d0" },
    { name: "Smartlink_40", href: "https://markswaitingrouge.com/hn73x4yi?key=c01aa251f7a5b871e96e45608f3285f7" },
    { name: "Smartlink_42", href: "https://markswaitingrouge.com/xw0mi72qt?key=abf8519b4dccb962ee2aa0ce954bdeba" },
    { name: "Smartlink_60", href: "https://markswaitingrouge.com/x90bd38z?key=07b0621c5e8f466ca07f3f35cf564ab3" },
    { name: "Smartlink_68", href: "https://markswaitingrouge.com/bnxq7vfp?key=5af973d8ac99651bac01520b94d1c357" },
    { name: "Smartlink_34", href: "https://markswaitingrouge.com/sq647ymd5q?key=fa3b0486011ed311108bd78092b26993" },
    { name: "Smartlink_45", href: "https://markswaitingrouge.com/rfrd2rhixa?key=3d2bd8c7d2d19996ad49a859879169dd" },
    { name: "Smartlink_57", href: "https://markswaitingrouge.com/g4hxj6ny?key=3b9f4774de04abaa1ada196aa7337a76" },
    { name: "Smartlink_43", href: "https://markswaitingrouge.com/r5q32emv?key=d6be4848fe582f8ca84769bea45994fd" },
    { name: "Smartlink_51", href: "https://markswaitingrouge.com/qnmfqgsr?key=9412d42b1e2e6a4713263ec5fff33ae4" },
    { name: "Smartlink_44", href: "https://markswaitingrouge.com/bhrmzq27ux?key=b6a53409eed46c65d61372435133dfad" },
    { name: "Smartlink_46", href: "https://markswaitingrouge.com/rrr6zc4j63?key=ce5e24c29d6a14c6ccec1facbb199770" },
    { name: "Smartlink_61", href: "https://markswaitingrouge.com/dkrveexhsv?key=bcde9b7e2b5bea89c71e52a01a53d2dc" },
    { name: "Smartlink_49", href: "https://markswaitingrouge.com/sd3yeigra?key=2340ad9becb93e241c0dbcd86a5303f7" },
    { name: "Smartlink_79", href: "https://markswaitingrouge.com/f3h6ypjxp1?key=f354aef79d713ebaa38daf47e1e65343" },
    { name: "Smartlink_80", href: "https://markswaitingrouge.com/esy5j2mk?key=2654f886e898eaff863585aff8d597a6" },
    { name: "Smartlink_56", href: "https://markswaitingrouge.com/cmenkms4gw?key=88c7ba72174cbc13809891a54835ef17" },
    { name: "Smartlink_54", href: "https://markswaitingrouge.com/jqaa5dxp?key=19ae05f6f7597fbb63f851f0f5ff9105" },
    { name: "Smartlink_58", href: "https://markswaitingrouge.com/v6wecyfj?key=c2b2c3ceb03917c2b46a8f1f5044937e" },
    { name: "Smartlink_67", href: "https://markswaitingrouge.com/ra1fgr7ck?key=8b68a001f101afd0349e4d31f5ca3582" },
    { name: "Smartlink_59", href: "https://markswaitingrouge.com/bmdecj7cu3?key=8917197b182eedddb528df51529f4a91" },
    { name: "Smartlink_89", href: "https://markswaitingrouge.com/nd52c22u?key=1940d387517798d52d530d570ff5d4d9" },
    { name: "Smartlink_92", href: "https://markswaitingrouge.com/ehhyhc54i?key=d11d8fb0a44ff6334f564e30084eedd5" },
    { name: "Smartlink_63", href: "https://markswaitingrouge.com/rxth8kmrkw?key=d199e08e7122b7113ee8291679c14539" },
    { name: "Smartlink_66", href: "https://markswaitingrouge.com/p7v8cjrzut?key=9a564266b68ce852eeb350b9689a2ee9" },
    { name: "Smartlink_72", href: "https://markswaitingrouge.com/ir89sjyf0t?key=583686fb2939d2f12edd11d7dd11f7f3" },
    { name: "Smartlink_64", href: "https://markswaitingrouge.com/qjinuju42v?key=ed44cad107012942d43b0d1a3c044fa3" },
    { name: "Smartlink_70", href: "https://markswaitingrouge.com/rm37x3xg7?key=ed041b2f4f81f7f524c80279032be265" },
    { name: "Smartlink_71", href: "https://markswaitingrouge.com/dvfb5pzj?key=a8db13bf914f846c86595a9f4fbb5ff6" },
    { name: "Smartlink_81", href: "https://markswaitingrouge.com/pk7h0x1bfx?key=42617f87e99f70163d4e35803b68a7e1" },
    { name: "Smartlink_87", href: "https://markswaitingrouge.com/uc8y55jzp?key=ad0090fdaa19f3da1763e7b54a5ece18" },
    { name: "Smartlink_94", href: "https://markswaitingrouge.com/mpiueehzw?key=1727e2ee70f697a6b65b0b3fb3e00899" },
    { name: "Smartlink_83", href: "https://markswaitingrouge.com/sghy1vhj?key=2ea6fc859046c5e3ebf658152a2b5d68" },
    { name: "Smartlink_73", href: "https://markswaitingrouge.com/ag0iiu8z?key=1e13aed67f636173db5b1da68333bcc9" },
    { name: "Smartlink_74", href: "https://markswaitingrouge.com/e0udjkbps?key=4e1e6cff619ad2e43830a931486b77de" },
    { name: "Smartlink_75", href: "https://markswaitingrouge.com/vmw3ax5iwn?key=15d57449189e7ec2187e3a7b366cf6af" },
    { name: "Smartlink_76", href: "https://markswaitingrouge.com/nb67hpitgr?key=c54a2e87a2fd3a762da8474b7f82f968" },
    { name: "Smartlink_90", href: "https://markswaitingrouge.com/c0rxr5v9?key=d22a3cbf3ff44e4609f6f9c415095a80" },
    { name: "Smartlink_93", href: "https://markswaitingrouge.com/s4w39h0f4s?key=1f3b1e3cf78d78f94634e4c2fde10a79" },
    { name: "Smartlink_91", href: "https://markswaitingrouge.com/z3hhmbus6?key=69284bd26ab917ca4a453a73acdb4d36" },
    { name: "Smartlink_82", href: "https://markswaitingrouge.com/hg51tbe9?key=233c19adc285dc3719e1237337b2b9a4" },
    { name: "Smartlink_84", href: "https://markswaitingrouge.com/crv2z3ny1?key=30c734df2be5fb63b46d63e854e9d33f" },
    { name: "Smartlink_85", href: "https://markswaitingrouge.com/cruqtkgp?key=39bc960307a978613e3b325e8df56950" },
    { name: "Smartlink_99", href: "https://markswaitingrouge.com/p06jxwi03?key=35cf16909c769f713a64f04379e4dc09" },
    { name: "Smartlink_96", href: "https://markswaitingrouge.com/x9ctpr69fz?key=8a3c9d6268864a573d49fa76a8f986ab" },
    { name: "Smartlink_88", href: "https://markswaitingrouge.com/t26dp9ce?key=1fd2aec8a5bb33e8be24f527345b3096" },
    { name: "Smartlink_100", href: "https://markswaitingrouge.com/ugakz7feiv?key=e7ef39829e7e88858c19b157badd506f" },
    { name: "Smartlink_97", href: "https://markswaitingrouge.com/e5knw0sa?key=65ad749104d67fb12b8a980fffe0cddb" },
    { name: "Smartlink_98", href: "https://markswaitingrouge.com/s45aiknt?key=649b1f9bc9163e11a150d8334bf39c7f" },
    { name: "Smartlink_105", href: "https://markswaitingrouge.com/t2v4e5tb?key=05ab942d2c1f30ad6138c7d4e43e776f" },
    { name: "Smartlink_101", href: "https://markswaitingrouge.com/wjwfriuk?key=d775af8e889e75b1796a55158a20ba1c" },
    { name: "Smartlink_103", href: "https://markswaitingrouge.com/exnp8ettz?key=7867a3e290377ead4f91c08e853a2d17" },
    { name: "Smartlink_106", href: "https://markswaitingrouge.com/h0uvrmmcg?key=69ee91d3c6ae5908e245dd17b87c4f90" },
    { name: "Smartlink_107", href: "https://markswaitingrouge.com/fqb6bz1kmh?key=529e4d117553029b5e735a7949e66600" },
    { name: "Smartlink_102", href: "https://markswaitingrouge.com/ebex3ajbj?key=33ac75a72570282a9b6c6160fb027424" },
    { name: "Smartlink_109", href: "https://markswaitingrouge.com/mk5frp98z?key=d88f61df3f9560e02f039296479ff6ea" },
    { name: "Smartlink_114", href: "https://markswaitingrouge.com/qvwtm2qjx?key=2ed7aabc34cc28ce688749c6ce12af8e" },
    { name: "Smartlink_104", href: "https://markswaitingrouge.com/siyd1infrn?key=868fc927362ce5d18c4b79fd78dcda39" },
    { name: "Smartlink_108", href: "https://markswaitingrouge.com/fxjbujzbs?key=ed1a1d3e8d82fcb894054cd12448d1e6" },
    { name: "Smartlink_112", href: "https://markswaitingrouge.com/rkwwwenc?key=c05fb95b924c107d98d3660603e79a29" },
];

function SmartLinkCard({ name, href }: { name: string; href: string }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="block w-full group">
            <Card className="w-full transition-all hover:bg-muted/50 hover:shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <LinkIcon className="h-5 w-5 text-primary" />
                        <p className="font-semibold text-foreground text-sm">{name}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </CardContent>
            </Card>
        </a>
    );
}

function AutoAdRotator() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [duration, setDuration] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const selectNewAd = () => {
            const nextIndex = Math.floor(Math.random() * newSmartLinks.length);
            const newDuration = Math.floor(Math.random() * 16) + 5; // Random time between 5 and 20 seconds
            
            setCurrentIndex(nextIndex);
            setDuration(newDuration);
            setTimeRemaining(newDuration);
        };

        selectNewAd(); // Initial selection

        const adInterval = setInterval(() => {
            selectNewAd();
        }, duration * 1000);

        return () => clearInterval(adInterval);
    }, [duration]);

    useEffect(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        
        intervalRef.current = setInterval(() => {
            setTimeRemaining(prevTime => {
                if (prevTime <= 1) {
                    return duration; // Reset for next ad
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [duration]);

    const currentAd = newSmartLinks[currentIndex];
    const progress = (timeRemaining / duration) * 100;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Timer />
                    Auto-Rotating Ad
                </CardTitle>
                <CardDescription>A new offer will be shown automatically.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg space-y-3">
                    <p className="font-semibold text-lg">{currentAd.name}</p>
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">Next ad in: {timeRemaining}s</p>
                        <Progress value={progress} className="w-full" />
                    </div>
                </div>
                 <a href={currentAd.href} target="_blank" rel="noopener noreferrer" className="block w-full">
                    <Button className="w-full">
                        <LinkIcon className="mr-2 h-4 w-4" />
                        View Offer
                    </Button>
                </a>
            </CardContent>
        </Card>
    )
}


function AdsPageContent() {
    const bannerAdScript = `
      atOptions = {
        'key' : '6563c4ab89bf446cc6ca2af6af14fc66',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };
    `;
    
    const banner468x60Script = `
      atOptions = {
		'key' : 'c6669511fdc1c44d2ff58fb29647cc91',
		'format' : 'iframe',
		'height' : 60,
		'width' : 468,
		'params' : {}
	  };
    `;
    
    const { adBanner1 } = placeholderImages;

    return (
        <AppLayout>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <MonitorPlay /> Advertisement Space
                        </CardTitle>
                        <CardDescription>This page is dedicated to displaying various ad formats.</CardDescription>
                    </CardHeader>
                </Card>
                
                <AutoAdRotator />

                <Card>
                    <CardContent className="p-4">
                        <a href="https://markswaitingrouge.com/hyartub4x?key=d892b1670480ffb487d89b3817e5e7ac" target="_blank" rel="noopener noreferrer">
                            <Image 
                                src={`https://picsum.photos/seed/${adBanner1.seed}/${adBanner1.width}/${adBanner1.height}`}
                                alt="Click here" 
                                width={adBanner1.width}
                                height={adBanner1.height}
                                className="w-full h-auto rounded-md" 
                                data-ai-hint={adBanner1.hint}
                            />
                        </a>
                    </CardContent>
                </Card>
                
                 {/* New Smartlinks Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Smartlinks</CardTitle>
                        <CardDescription>Direct URL ad links.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                        {newSmartLinks.map(link => (
                           <SmartLinkCard key={link.href} name={link.name} href={link.href} />
                        ))}
                    </CardContent>
                </Card>

                {/* Banner Ad 468x60 */}
                <Card>
                    <CardHeader>
                        <CardTitle>Banner Ad (468x60)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 flex items-center justify-center">
                        <div>
                            <Script id="adsterra-banner-468-config" strategy="lazyOnload">
                                {banner468x60Script}
                            </Script>
                            <Script async={true} src="//exportseats.com/c6669511fdc1c44d2ff58fb29647cc91/invoke.js" strategy="lazyOnload" />
                        </div>
                    </CardContent>
                </Card>
                
                {/* Banner Ad 320x50 */}
                <Card>
                    <CardHeader>
                        <CardTitle>Banner Ad (320x50)</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 flex items-center justify-center">
                        <div>
                            <Script id="adsterra-banner-config" strategy="lazyOnload">
                                {bannerAdScript}
                            </Script>
                            <Script async={true} src="//exportseats.com/6563c4ab89bf446cc6ca2af6af14fc66/invoke.js" strategy="lazyOnload" />
                        </div>
                    </CardContent>
                </Card>
                
                 {/* New "Click Here" button card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Special Promotion</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button 
                            className="w-full"
                            onClick={() => window.open('https://markswaitingrouge.com/hyartub4x?key=d892b1670480ffb487d89b3817e5e7ac', '_blank')}
                        >
                            Click Here
                        </Button>
                    </CardContent>
                </Card>

                {/* Direct Link Ad */}
                <Card>
                    <CardHeader>
                        <CardTitle>Adsterra Direct Link</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <a href="https://exportseats.com/m2jivq7i5?key=21be6efcb2e0598d5cc7a099cc5be61d" target="_blank" rel="noopener noreferrer">
                            <Button className="w-full">
                                <LinkIcon className="mr-2 h-4 w-4" />
                                Click to View Offer
                            </Button>
                        </a>
                    </CardContent>
                </Card>
                
                {/* PropellerAds Example Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>PropellerAds Direct Link</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <a href="https://propellerads.com/preview" target="_blank" rel="noopener noreferrer">
                            <Button className="w-full" variant="outline">
                                <LinkIcon className="mr-2 h-4 w-4" />
                                View PropellerAds Offer
                            </Button>
                        </a>
                    </CardContent>
                </Card>

                {/* Native Banner Ad */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recommended For You</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Script async={true} data-cfasync="false" src="//exportseats.com/143386acea5fdd4b99b856043235c82b/invoke.js" strategy="lazyOnload" />
                         <div id="container-143386acea5fdd4b99b856043235c82b"></div>
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}

export default function AdsPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <AdsPageContent />
        </Suspense>
    );
}

    