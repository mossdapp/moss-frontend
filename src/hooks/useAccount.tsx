import {useLocalStorage} from "react-use";
import {GlobalConfig} from "@/constants";

export const useAccount = () => {
    const [data] = useLocalStorage<any>(GlobalConfig.mossWalletKey, null);
    const account = data?.account;
    return { account };
}