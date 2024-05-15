import {useLocalStorage} from "react-use";
import {GlobalConfig} from "@/constants";
import useSWR from "swr";
import {provider} from "@/core/account";

export const useAccount = () => {
    const [data] = useLocalStorage<any>(GlobalConfig.mossWalletKey, null);
    const account = data?.account;
    return { account };
}

export const useAccountABI = (address: string) => {
    const { data } = useSWR(['abi', address], () => provider.getClassAt(address));

    return {
        abi: data?.abi,
    }
}