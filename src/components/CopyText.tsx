import {Copy} from "lucide-react";
import {ReactNode, useEffect} from "react";
import {useCopyToClipboard} from "react-use";
import toast from "react-hot-toast";

export const CopyText = ({text, children}: {text: string; children: ReactNode}) => {
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
        <div className={'text-muted-foreground flex items-center gap-2'}>
            {children}
            <Copy className={'cursor-pointer'} size={16} onClick={() => copyToClipboard(text!)}/>
        </div>
    )
}