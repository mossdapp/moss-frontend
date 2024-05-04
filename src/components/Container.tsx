import {ReactNode} from "react";
import {ScrollArea} from "@/components/ui/scroll-area";


export const Container = ({children}: {children: ReactNode}) => {
    return (
        <main className="min-h-screen flex justify-center items-center bg-accent">
            <ScrollArea className="w-[500px] h-[95vh] rounded-2xl bg-white py-8 px-12 relative">
                {children}
            </ScrollArea>
        </main>
    )
}