'use client';
import {useLocalStorage} from "react-use";
import {GlobalConfig} from "@/constants";
import {ReactNode, useEffect} from "react";
import {redirect} from "next/navigation";


export function ClientLayout({children}: {children: ReactNode}) {
    const [data] = useLocalStorage(GlobalConfig.mossWalletKey, null);

    useEffect(() => {
        redirect(data ? '/wallet' : '/create')
    }, [data])


    return children;
}
