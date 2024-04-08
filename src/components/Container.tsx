import {ReactNode} from "react";


export const Container = ({children}: {children: ReactNode}) => {
    return (
        <main className="min-h-screen p-6 flex justify-center bg-accent">
            <div className="w-[500px] h-[700px] rounded-2xl bg-white py-8 px-12">
                {children}
            </div>
        </main>
    )
}