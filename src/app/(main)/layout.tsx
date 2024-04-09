'use client';
import {ReactNode} from "react";
import {LayoutGrid, WalletCards} from "lucide-react";
import {Container} from "@/components/Container";
import {usePathname, useRouter} from "next/navigation";
import {cn} from "@/lib/utils";

export default function Layout({children}:{children: ReactNode}) {
    const path = usePathname();
    const router = useRouter();

    const nav = (path: string) => {
        router.push(path);
    }

    console.log(path);
    return (
        <Container>
            {children}
            <div className={'flex items-center gap-5 justify-center rounded-md absolute bottom-5 w-full left-0'}>
                <div onClick={() => nav('/wallet')} className={cn('flex text-sm justify-center flex-col items-center space-y-2 w-[100px] text-muted-foreground cursor-pointer hover:text-primary/80', path === '/wallet' ? 'text-primary' : '')}>
                    <WalletCards/>
                    <div>Wallet</div>
                </div>
                <div onClick={() => nav('/app')} className={cn('flex text-sm justify-center flex-col items-center space-y-2 w-[100px] text-muted-foreground cursor-pointer hover:text-primary/80', path === '/app' ? 'text-primary' : '')}>
                    <LayoutGrid/>
                    <div>App</div>
                </div>
            </div>
        </Container>
    )
}