'use client';
import {ArrowLeft} from "lucide-react";
import {useRouter} from "next/navigation";

export const TabBar = ({title}: {title: string}) => {
    const router = useRouter();
    return (
        <div className={'flex justify-center font-bold text-lg relative'}>
            <ArrowLeft onClick={() => {
                router.back();
            }} className={'absolute left-5 top-[50%] mt-[-12px] cursor-pointer hover:text-foreground/60'}/>
            <div>
                {title}
            </div>
        </div>
    )
}