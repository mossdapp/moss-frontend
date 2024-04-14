'use client';
import {Copy} from "lucide-react";
import {ReactNode, useEffect} from "react";
import {useCopyToClipboard} from "react-use";
import toast from "react-hot-toast";
import {cn} from "@/lib/utils";

export const CopyText = ({text, children, className}: {text: string; children: ReactNode;className?: string}) => {
    const [state, copyToClipboard] = useCopyToClipboard();

    useEffect(() => {
        if(state.value) {
            toast.success(`Copied ${state.value}`);
        }
        if(state.error) {
            toast.error(`Unable to copy value, ${state.error.message}`);
        }
    }, [state]);
    return (
        <div className={cn('text-muted-foreground flex items-center gap-2', className)}>
            {children}
            <Copy className={'cursor-pointer'} size={16} onClick={() => copyToClipboard(text!)}/>
        </div>
    )
}