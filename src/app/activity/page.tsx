'use client';
import {Container} from "@/components/Container";
import {TabBar} from "@/components/TabBar";
import useSWR from "swr";
import {getTransactions} from "@/services/wallet";
import {useLocalStorage} from "react-use";
import {GlobalConfig} from "@/constants";


export default function ActivityPage() {
    const [data] = useLocalStorage<any>(GlobalConfig.mossWalletKey, null);
    const account = data?.account;

    console.log(account?.contractAddress)
    const { data: activityData } = useSWR(['activity', account?.contractAddress], () => getTransactions(account?.contractAddress));

    console.log(activityData)
    return (
        <Container>
            <TabBar title={'Activity'}/>
            <div className="p-6">

            </div>
        </Container>
    )
}