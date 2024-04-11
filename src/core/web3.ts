import {provider} from "@/core/account";
import {Contract} from "starknet";


export const getDecimals = async (tokenAddress: string) => {
    const { abi } = await provider.getClassAt(tokenAddress);
    const contract = new Contract(abi, tokenAddress, provider);
    const decimals = await contract.decimals();

    return decimals;
}