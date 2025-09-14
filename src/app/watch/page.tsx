
"use client";

import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Suspense, useRef, useState } from 'react';
import { Link as LinkIcon, ChevronRight, Play, Pause } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';


const smartLinks = [
    { id: "so1", name: "Special Offer 1", href: "https://exportseats.com/hyartub4x?key=d892b1670480ffb487d89b3817e5e7ac" },
    { id: "ed1", name: "Exclusive Deal 1", href: "https://exportseats.com/dh3vxuj481?key=b7533711b8862e5c235d94f55f71534a" },
    { id: "ed2", name: "Exclusive Deal 2", href: "https://exportseats.com/g0hq2kzg4?key=3dc62533b21bbb2a8759a09979857f8e" },
    { id: "so2", name: "Special Offer 2", href: "https://exportseats.com/m2jivq7i5?key=21be6efcb2e0598d5cc7a099cc5be61d" },
    { id: "lto", name: "Limited Time Offer", href: "https://exportseats.com/dpmz0i2c?key=7daf2adf8e65b73e02e8812c28801773" },
    { id: "so3", name: "Special Offer 3", href: "https://exportseats.com/qkjn3gymx?key=f37d577acabc18cde27215069997adf6" },
    { id: "so4", name: "Special Offer 4", href: "https://exportseats.com/cmpjkdem?key=29b9d93e0b8a07adb2edb7530ce75418" },
    { id: "so5", name: "Special Offer 5", href: "https://exportseats.com/jmnqe1gc?key=53755058a15fd950718897e97e84b512" },
    { id: "so6", name: "Special Offer 6", href: "https://exportseats.com/khjxsva4?key=e2f5f35bde660d3decfd60ad68291dc1" },
    { id: "so7", name: "Special Offer 7", href: "https://exportseats.com/yscmceke?key=325c6afc1d7d83b30524372aa1e584c4" },
    { id: "so8", name: "Special Offer 8", href: "https://exportseats.com/vp1ge6k02?key=c489b06da0cf1ceed18ed4d4ad470ee4" },
    { id: "so9", name: "Special Offer 9", href: "https://exportseats.com/krm37igh?key=c7763dda3bed41d5ec713d55160ce80b" },
];

const bestOffers = [
    { name: "Smartlink_8", href: "https://exportseats.com/khjxsva4?key=e2f5f35bde660d3decfd60ad68291dc1" },
    { name: "Smartlink_6", href: "https://exportseats.com/cmpjkdem?key=29b9d93e0b8a07adb2edb7530ce75418" },
    { name: "Smartlink_20", href: "https://exportseats.com/g7cwyrik?key=03a95b8789ff420064cca469e6e0d8d3" },
    { name: "Smartlink_11", href: "https://exportseats.com/krm37igh?key=c7763dda3bed41d5ec713d55160ce80b" },
    { name: "Smartlink_16", href: "https://exportseats.com/sb4j0zvt?key=3a41f3bde6ddfae280c3822b2368bc6c" },
    { name: "Smartlink_14", href: "https://exportseats.com/pif8hc06e3?key=806a5ce2c19b5b4e9dc48141dfc476dd" },
    { name: "Smartlink_10", href: "https://exportseats.com/vp1ge6k02?key=c489b06da0cf1ceed18ed4d4ad470ee4" },
    { name: "Smartlink_9", href: "https://exportseats.com/yscmceke?key=325c6afc1d7d83b30524372aa1e584c4" },
    { name: "Smartlink_19", href: "https://exportseats.com/cg9hjv2957?key=aa535d9cefc044de0c3f116f9fc0df30" },
    { name: "Smartlink_13", href: "https://exportseats.com/yhpbyr1hc0?key=121375fe1b6d287983723ef859ac6d7d" },
    { name: "Smartlink_7", href: "https://exportseats.com/jmnqe1gc?key=53755058a15fd950718897e97e84b512" },
    { name: "Smartlink_17", href: "https://exportseats.com/ridvqpvr7?key=270c4065b81c3e649f001d289f315113" },
    { name: "Smartlink_15", href: "https://exportseats.com/qyy895we?key=cdd8d956b2f9b5f1260f3d939a32116c" },
    { name: "Smartlink_12", href: "https://exportseats.com/tzshk4sn?key=6497b840915a8293b880426b63b520d9" },
    { name: "Smartlink_18", href: "https://exportseats.com/rrch2di8?key=2ea9f6e97d4f2313dbd9d0ec759a10db" },
    { name: "Smartlink_1", href: "https://exportseats.com/dh3vxuj481?key=b7533711b8862e5c235d94f55f71534a" },
    { name: "Smartlink_2", href: "https://exportseats.com/g0hq2kzg4?key=3dc62533b21bbb2a8759a09979857f8e" },
    { name: "Smartlink_4", href: "https://exportseats.com/m2jivq7i5?key=21be6efcb2e0598d5cc7a099cc5be61d" },
    { name: "Smartlink_3", href: "https://exportseats.com/dpmz0i2c?key=7daf2adf8e65b73e02e8812c28801773" },
    { name: "Smartlink_5", href: "https://exportseats.com/qkjn3gymx?key=f37d577acabc18cde27215069997adf6" },
];

const bumperOffers = [
    { name: 'Bumper Offer 1', href: 'https://exportseats.com/khjxsva4?key=e2f5f35bde660d3decfd60ad68291dc1' },
    { name: 'Bumper Offer 2', href: 'https://exportseats.com/cmpjkdem?key=29b9d93e0b8a07adb2edb7530ce75418' },
    { name: 'Bumper Offer 3', href: 'https://exportseats.com/g7cwyrik?key=03a95b8789ff420064cca469e6e0d8d3' },
    { name: 'Bumper Offer 4', href: 'https://exportseats.com/krm37igh?key=c7763dda3bed41d5ec713d55160ce80b' },
    { name: 'Bumper Offer 5', href: 'https://exportseats.com/sb4j0zvt?key=3a41f3bde6ddfae280c3822b2368bc6c' },
    { name: 'Bumper Offer 6', href: 'https://exportseats.com/pif8hc06e3?key=806a5ce2c19b5b4e9dc48141dfc476dd' },
    { name: 'Bumper Offer 7', href: 'https://exportseats.com/vp1ge6k02?key=c489b06da0cf1ceed18ed4d4ad470ee4' },
    { name: 'Bumper Offer 8', href: 'https://exportseats.com/yscmceke?key=325c6afc1d7d83b30524372aa1e584c4' },
    { name: 'Bumper Offer 9', href: 'https://exportseats.com/cg9hjv2957?key=aa535d9cefc044de0c3f116f9fc0df30' },
    { name: 'Bumper Offer 10', href: 'https://exportseats.com/yhpbyr1hc0?key=121375fe1b6d287983723ef859ac6d7d' },
    { name: 'Bumper Offer 11', href: 'https://exportseats.com/jmnqe1gc?key=53755058a15fd950718897e97e84b512' },
    { name: 'Bumper Offer 12', href: 'https://exportseats.com/ridvqpvr7?key=270c4065b81c3e649f001d289f315113' },
    { name: 'Bumper Offer 13', href: 'https://exportseats.com/qyy895we?key=cdd8d956b2f9b5f1260f3d939a32116c' },
    { name: 'Bumper Offer 14', href: 'https://exportseats.com/tzshk4sn?key=6497b840915a8293b880426b63b520d9' },
    { name: 'Bumper Offer 15', href: 'https://exportseats.com/rrch2di8?key=2ea9f6e97d4f2313dbd9d0ec759a10db' },
    { name: 'Bumper Offer 16', href: 'https://exportseats.com/gn0rtp68h?key=38b9ae24fed8c22d67b7cda26b9f9185' },
    { name: 'Bumper Offer 17', href: 'https://exportseats.com/r063ky9w?key=f9b0b6300cbf3d57324614a2d90f413f' },
    { name: 'Bumper Offer 18', href: 'https://exportseats.com/xs9sbkqc8?key=a44ee277986f2ccdc153fd06cd2285dd' },
    { name: 'Bumper Offer 19', href: 'https://exportseats.com/u73vga5j?key=d0d54abbdb12ed811cf25ed960bdf59f' },
    { name: 'Bumper Offer 20', href: 'https://exportseats.com/iq8f7uk8ij?key=0ecfa4f0c7dc637ddf44da1b78b2d903' },
    { name: 'Bumper Offer 21', href: 'https://exportseats.com/jxdwpjxc?key=8562e589a2f895a6a12e5363c982dc2d' },
    { name: 'Bumper Offer 22', href: 'https://exportseats.com/vkjz7dn73?key=7176105a20b0a64185eaae28824c5968' },
    { name: 'Bumper Offer 23', href: 'https://exportseats.com/qp903znizm?key=655122a1d4e9439c8542dcc0989b5baa' },
    { name: 'Bumper Offer 24', href: 'https://exportseats.com/hfugq62u?key=fed2d0b5fc3b21b5a5be8857f795d410' },
    { name: 'Bumper Offer 25', href: 'https://exportseats.com/u84i3t7wm?key=1336d3b6c2c7e7955dc2fcb79a6e2153' },
    { name: 'Bumper Offer 26', href: 'https://exportseats.com/buuq41vt5?key=32b03f1855563c3adc0beb3fcc2a7690' },
    { name: 'Bumper Offer 27', href: 'https://exportseats.com/kk4i62rfe6?key=75a0be631d8f31823386826601228548' },
    { name: 'Bumper Offer 28', href: 'https://exportseats.com/yp328dgin?key=f6fec4ba6327dc952736839f224b7aec' },
    { name: 'Bumper Offer 29', href: 'https://exportseats.com/yhyzuqqa?key=787f92844e2098bedeebc799636e4e91' },
    { name: 'Bumper Offer 30', href: 'https://exportseats.com/emxqiu94?key=baa83d37604740c29c944b9dbf02683b' },
    { name: 'Bumper Offer 31', href: 'https://exportseats.com/qe8dcevpm1?key=498c423c0beb0a9c80b61d6f219fe2eb' },
    { name: 'Bumper Offer 32', href: 'https://exportseats.com/e6gqdbj6f?key=5db17bdc596ae2ab99a42c7be9dfeec3' },
    { name: 'Bumper Offer 33', href: 'https://exportseats.com/d5en51r13y?key=971ca5910cd9434e490111167ef7cbe1' },
    { name: 'Bumper Offer 34', href: 'https://exportseats.com/xtb530c2rv?key=703a94e4cf472df707d4977b42731370' },
    { name: 'Bumper Offer 35', href: 'https://exportseats.com/v767rswz?key=8162889e026f093e758edd5855900adf' },
    { name: 'Bumper Offer 36', href: 'https://exportseats.com/zs451ueu?key=574f7aebbe45c78edf46a892241338fd' },
    { name: 'Bumper Offer 37', href: 'https://exportseats.com/fbpemmyjj?key=c4294d6fb165bc6898fdf1a8730e0f73' },
    { name: 'Bumper Offer 38', href: 'https://exportseats.com/g7qbgcj1q?key=cee9b57e78ae0bbcb449ec8e0c89fd92' },
    { name: 'Bumper Offer 39', href: 'https://exportseats.com/xd2kgbv5g?key=89e04c1ed586fca8d28ee7de7b02cb52' },
    { name: 'Bumper Offer 40', href: 'https://exportseats.com/g053i6er?key=225822b23fb863ce7996aa7242026ed3' },
    { name: 'Bumper Offer 41', href: 'https://exportseats.com/e7jamkj30f?key=fa62dbb4e3966c3178ef7b198cce3b75' },
    { name: 'Bumper Offer 42', href: 'https://exportseats.com/tg71wanixh?key=b5e500ada5f349b9d537da224bd9bd51' },
    { name: 'Bumper Offer 43', href: 'https://exportseats.com/mmqmpbx6m?key=91e1c1cd8424b63541ae72d94d60b016' },
    { name: 'Bumper Offer 44', href: 'https://exportseats.com/nkg78yrg7g?key=80ed3305092bdd5c539e6d33e4885b05' },
    { name: 'Bumper Offer 45', href: 'https://exportseats.com/eei7x7xdw?key=f0d3b86b86235f21c6ed0ab1f18dca5d' },
    { name: 'Bumper Offer 46', href: 'https://exportseats.com/q6f3jmt5nu?key=ab9041d89ee6a96bfd6b0ee0dff79b51' },
    { name: 'Bumper Offer 47', href: 'https://exportseats.com/zcb45qdjzs?key=4a05dfeaa6869f0da3bbcc4e186df2d0' },
    { name: 'Bumper Offer 48', href: 'https://exportseats.com/hn73x4yi?key=c01aa251f7a5b871e96e45608f3285f7' },
    { name: 'Bumper Offer 49', href: 'https://exportseats.com/xw0mi72qt?key=abf8519b4dccb962ee2aa0ce954bdeba' },
    { name: 'Bumper Offer 50', href: 'https://exportseats.com/x90bd38z?key=07b0621c5e8f466ca07f3f35cf564ab3' },
    { name: 'Bumper Offer 51', href: 'https://exportseats.com/bnxq7vfp?key=5af973d8ac99651bac01520b94d1c357' },
    { name: 'Bumper Offer 52', href: 'https://exportseats.com/sq647ymd5q?key=fa3b0486011ed311108bd78092b26993' },
    { name: 'Bumper Offer 53', href: 'https://exportseats.com/rfrd2rhixa?key=3d2bd8c7d2d19996ad49a859879169dd' },
    { name: 'Bumper Offer 54', href: 'https://exportseats.com/g4hxj6ny?key=3b9f4774de04abaa1ada196aa7337a76' },
    { name: 'Bumper Offer 55', href: 'https://exportseats.com/r5q32emv?key=d6be4848fe582f8ca84769bea45994fd' },
    { name: 'Bumper Offer 56', href: 'https://exportseats.com/qnmfqgsr?key=9412d42b1e2e6a4713263ec5fff33ae4' },
    { name: 'Bumper Offer 57', href: 'https://exportseats.com/bhrmzq27ux?key=b6a53409eed46c65d61372435133dfad' },
    { name: 'Bumper Offer 58', href: 'https://exportseats.com/rrr6zc4j63?key=ce5e24c29d6a14c6ccec1facbb199770' },
    { name: 'Bumper Offer 59', href: 'https://exportseats.com/dkrveexhsv?key=bcde9b7e2b5bea89c71e52a01a53d2dc' },
    { name: 'Bumper Offer 60', href: 'https://exportseats.com/sd3yeigra?key=2340ad9becb93e241c0dbcd86a5303f7' },
    { name: 'Bumper Offer 61', href: 'https://exportseats.com/f3h6ypjxp1?key=f354aef79d713ebaa38daf47e1e65343' },
    { name: 'Bumper Offer 62', href: 'https://exportseats.com/esy5j2mk?key=2654f886e898eaff863585aff8d597a6' },
    { name: 'Bumper Offer 63', href: 'https://exportseats.com/cmenkms4gw?key=88c7ba72174cbc13809891a54835ef17' },
    { name: 'Bumper Offer 64', href: 'https://exportseats.com/jqaa5dxp?key=19ae05f6f7597fbb63f851f0f5ff9105' },
    { name: 'Bumper Offer 65', href: 'https://exportseats.com/v6wecyfj?key=c2b2c3ceb03917c2b46a8f1f5044937e' },
    { name: 'Bumper Offer 66', href: 'https://exportseats.com/ra1fgr7ck?key=8b68a001f101afd0349e4d31f5ca3582' },
    { name: 'Bumper Offer 67', href: 'https://exportseats.com/bmdecj7cu3?key=8917197b182eedddb528df51529f4a91' },
    { name: 'Bumper Offer 68', href: 'https://exportseats.com/nd52c22u?key=1940d387517798d52d530d570ff5d4d9' },
    { name: 'Bumper Offer 69', href: 'https://exportseats.com/ehhyhc54i?key=d11d8fb0a44ff6334f564e30084eedd5' },
    { name: 'Bumper Offer 70', href: 'https://exportseats.com/rxth8kmrkw?key=d199e08e7122b7113ee8291679c14539' },
    { name: 'Bumper Offer 71', href: 'https://exportseats.com/p7v8cjrzut?key=9a564266b68ce852eeb350b9689a2ee9' },
    { name: 'Bumper Offer 72', href: 'https://exportseats.com/ir89sjyf0t?key=583686fb2939d2f12edd11d7dd11f7f3' },
    { name: 'Bumper Offer 73', href: 'https://exportseats.com/qjinuju42v?key=ed44cad107012942d43b0d1a3c044fa3' },
    { name: 'Bumper Offer 74', href: 'https://exportseats.com/rm37x3xg7?key=ed041b2f4f81f7f524c80279032be265' },
    { name: 'Bumper Offer 75', href: 'https://exportseats.com/dvfb5pzj?key=a8db13bf914f846c86595a9f4fbb5ff6' },
    { name: 'Bumper Offer 76', href: 'https://exportseats.com/pk7h0x1bfx?key=42617f87e99f70163d4e35803b68a7e1' },
    { name: 'Bumper Offer 77', href: 'https://exportseats.com/uc8y55jzp?key=ad0090fdaa19f3da1763e7b54a5ece18' },
    { name: 'Bumper Offer 78', href: 'https://exportseats.com/mpiueehzw?key=1727e2ee70f697a6b65b0b3fb3e00899' },
    { name: 'Bumper Offer 79', href: 'https://exportseats.com/sghy1vhj?key=2ea6fc859046c5e3ebf658152a2b5d68' },
    { name: 'Bumper Offer 80', href: 'https://exportseats.com/ag0iiu8z?key=1e13aed67f636173db5b1da68333bcc9' },
    { name: 'Bumper Offer 81', href: 'https://exportseats.com/e0udjkbps?key=4e1e6cff619ad2e43830a931486b77de' },
    { name: 'Bumper Offer 82', href: 'https://exportseats.com/vmw3ax5iwn?key=15d57449189e7ec2187e3a7b366cf6af' },
    { name: 'Bumper Offer 83', href: 'https://exportseats.com/nb67hpitgr?key=c54a2e87a2fd3a762da8474b7f82f968' },
    { name: 'Bumper Offer 84', href: 'https://exportseats.com/c0rxr5v9?key=d22a3cbf3ff44e4609f6f9c415095a80' },
    { name: 'Bumper Offer 85', href: 'https://exportseats.com/s4w39h0f4s?key=1f3b1e3cf78d78f94634e4c2fde10a79' },
    { name: 'Bumper Offer 86', href: 'https://exportseats.com/z3hhmbus6?key=69284bd26ab917ca4a453a73acdb4d36' },
    { name: 'Bumper Offer 87', href: 'https://exportseats.com/hg51tbe9?key=233c19adc285dc3719e1237337b2b9a4' },
    { name: 'Bumper Offer 88', href: 'https://exportseats.com/crv2z3ny1?key=30c734df2be5fb63b46d63e854e9d33f' },
    { name: 'Bumper Offer 89', href: 'https://exportseats.com/cruqtkgp?key=39bc960307a978613e3b325e8df56950' },
    { name: 'Bumper Offer 90', href: 'https://exportseats.com/p06jxwi03?key=35cf16909c769f713a64f04379e4dc09' },
    { name: 'Bumper Offer 91', href: 'https://exportseats.com/x9ctpr69fz?key=8a3c9d6268864a573d49fa76a8f986ab' },
    { name: 'Bumper Offer 92', href: 'https://exportseats.com/t26dp9ce?key=1fd2aec8a5bb33e8be24f527345b3096' },
    { name: 'Bumper Offer 93', href: 'https://exportseats.com/ugakz7feiv?key=e7ef39829e7e88858c19b157badd506f' },
    { name: 'Bumper Offer 94', href: 'https://exportseats.com/e5knw0sa?key=65ad749104d67fb12b8a980fffe0cddb' },
    { name: 'Bumper Offer 95', href: 'https://exportseats.com/s45aiknt?key=649b1f9bc9163e11a150d8334bf39c7f' },
    { name: 'Bumper Offer 96', href: 'https://exportseats.com/dh3vxuj481?key=b7533711b8862e5c235d94f55f71534a' },
    { name: 'Bumper Offer 97', href: 'https://exportseats.com/g0hq2kzg4?key=3dc62533b21bbb2a8759a09979857f8e' },
    { name: 'Bumper Offer 98', href: 'https://exportseats.com/m2jivq7i5?key=21be6efcb2e0598d5cc7a099cc5be61d' },
    { name: 'Bumper Offer 99', href: 'https://exportseats.com/dpmz0i2c?key=7daf2adf8e65b73e02e8812c28801773' },
    { name: 'Bumper Offer 100', href: 'https://exportseats.com/qkjn3gymx?key=f37d577acabc18cde27215069997adf6' }
];

function SmartLinkCard({ name, href }: { name: string, href: string }) {
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="block w-full group">
            <Card className="w-full transition-all hover:bg-muted/50 hover:shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <LinkIcon className="h-6 w-6 text-primary" />
                        <p className="font-semibold text-foreground">{name}</p>
                    </div>
                    <ChevronRight className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                </CardContent>
            </Card>
        </a>
    )
}

function SpecialOffer1Card({ onClick }: { onClick: () => void }) {
    return (
         <div onClick={onClick} className="block w-full group cursor-pointer">
            <Card className="w-full transition-all hover:bg-muted/50 hover:shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <LinkIcon className="h-6 w-6 text-primary" />
                        <p className="font-semibold text-foreground">Special Offer 1</p>
                    </div>
                    <ChevronRight className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                </CardContent>
            </Card>
        </div>
    );
}

function ExclusiveDeal1Card({ onClick }: { onClick: () => void }) {
    return (
         <div onClick={onClick} className="block w-full group cursor-pointer">
            <Card className="w-full transition-all hover:bg-muted/50 hover:shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <LinkIcon className="h-6 w-6 text-primary" />
                        <p className="font-semibold text-foreground">Exclusive Deal 1</p>
                    </div>
                    <ChevronRight className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                </CardContent>
            </Card>
        </div>
    );
}

function WatchPageContent() {
    const { toast } = useToast();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const [activeProcess, setActiveProcess] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);
    const [nextOffer, setNextOffer] = useState('');

    const stopProcess = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setActiveProcess(null);
        setProgress(0);
        setNextOffer('');
        toast({ title: "Process Stopped", description: "The automatic offer opening has been stopped." });
    };

    const startSequentialOpening = (offers: {name: string, href: string}[], processName: string) => {
        if (intervalRef.current) {
            toast({ title: "Process already running", description: "Another offer opening process is already in progress.", variant: "destructive" });
            return;
        }

        let currentIndex = 0;
        setActiveProcess(processName);
        
        toast({
            title: `Starting ${processName}`,
            description: `A new offer will open every 40 seconds.`,
        });

        const openNextLink = () => {
            if (currentIndex < offers.length) {
                const offer = offers[currentIndex];
                window.open(offer.href, '_blank');
                toast({
                    title: `Opening Offer ${currentIndex + 1}/${offers.length}`,
                    description: offer.name,
                });
                
                if (currentIndex + 1 < offers.length) {
                    setNextOffer(offers[currentIndex + 1].name);
                } else {
                    setNextOffer('All offers opened!');
                }

                currentIndex++;
            } else {
                stopProcess();
                toast({ title: `${processName} Complete`, description: "All offers have been opened." });
            }
        };

        openNextLink(); // Open the first link immediately
        intervalRef.current = setInterval(openNextLink, 40000); // Open subsequent links every 40 seconds
    };

    const handleSpecialOfferClick = () => {
        const specialOffers = [
            smartLinks.find(link => link.id === 'so1'),
            smartLinks.find(link => link.id === 'so2'),
            smartLinks.find(link => link.id === 'so3'),
            smartLinks.find(link => link.id === 'so4'),
            smartLinks.find(link => link.id === 'so5'),
            smartLinks.find(link => link.id === 'so6'),
            smartLinks.find(link => link.id === 'so7'),
            smartLinks.find(link => link.id === 'so8'),
            smartLinks.find(link => link.id === 'so9'),
        ].filter(Boolean) as {name: string, href: string}[];

        startSequentialOpening(specialOffers, "Special Offers");
    };
    
    const handleExclusiveDealClick = () => {
        const exclusiveDeals = [
            smartLinks.find(link => link.id === 'ed1'),
            smartLinks.find(link => link.id === 'ed2'),
        ].filter(Boolean) as {name: string, href: string}[];
        startSequentialOpening(exclusiveDeals, "Exclusive Deals");
    }

    const handleBestOffersClick = () => startSequentialOpening(bestOffers, "Best Offers");
    const handleBumperOfferClick = () => startSequentialOpening(bumperOffers, "Bumper Offers");


    return (
        <AppLayout>
            <Card>
                <CardHeader>
                    <CardTitle>Offers</CardTitle>
                    <CardDescription>Explore these exclusive links and offers.</CardDescription>
                </CardHeader>
                <CardContent>
                    {activeProcess && (
                        <Card className="mb-4 bg-muted/50">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>{activeProcess} in Progress...</span>
                                    <Button variant="destructive" size="sm" onClick={stopProcess}>
                                        <Pause className="mr-2 h-4 w-4" />
                                        Stop
                                    </Button>
                                </CardTitle>
                                <CardDescription>Next offer: {nextOffer}</CardDescription>
                            </CardHeader>
                        </Card>
                    )}
                    <Tabs defaultValue="special">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="special">Special Offers & Deals</TabsTrigger>
                            <TabsTrigger value="best">Best Offers</TabsTrigger>
                            <TabsTrigger value="bumper">Bumper Offer</TabsTrigger>
                        </TabsList>
                        <TabsContent value="special" className="pt-4">
                             <div className="space-y-3">
                                {smartLinks.map((link) => {
                                    if (link.id === 'so1') {
                                        return <SpecialOffer1Card key={link.id} onClick={handleSpecialOfferClick} />;
                                    }
                                    if (link.id.startsWith('so') && link.id !== 'so1') {
                                        return null;
                                    }
                                        if (link.id === 'ed1') {
                                        return <ExclusiveDeal1Card key={link.id} onClick={handleExclusiveDealClick} />;
                                    }
                                        if (link.id === 'ed2') {
                                        return null;
                                    }
                                    return <SmartLinkCard key={link.id} name={link.name} href={link.href} />;
                                })}
                            </div>
                        </TabsContent>
                        <TabsContent value="best" className="pt-4">
                             <div className="space-y-3">
                                <Button onClick={handleBestOffersClick} className="w-full" disabled={!!activeProcess}>
                                    <Play className="mr-2 h-4 w-4" />
                                    Open All Best Offers Sequentially
                                </Button>
                                {bestOffers.map((link, index) => (
                                    <SmartLinkCard key={index} name={link.name} href={link.href} />
                                ))}
                            </div>
                        </TabsContent>
                        <TabsContent value="bumper" className="pt-4">
                            <div className="space-y-3">
                                <Button onClick={handleBumperOfferClick} className="w-full" disabled={!!activeProcess}>
                                    <Play className="mr-2 h-4 w-4" />
                                    Open All Bumper Offers Sequentially
                                </Button>
                                {bumperOffers.map((link, index) => (
                                    <SmartLinkCard key={index} name={link.name} href={link.href} />
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </AppLayout>
    );
}

export default function WatchPage() {
    return (
        <Suspense fallback={<AppLayout><div>Loading...</div></AppLayout>}>
            <WatchPageContent />
        </Suspense>
    );
}
