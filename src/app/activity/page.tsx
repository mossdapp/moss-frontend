'use client';
import {Container} from "@/components/Container";
import {TabBar} from "@/components/TabBar";
import useSWR from "swr";
import {getTransactions} from "@/services/wallet";
import {useLocalStorage} from "react-use";
import {GlobalConfig} from "@/constants";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import { formatTime, shortenAddress} from "@/utils/common";


export default function ActivityPage() {
    const [data] = useLocalStorage<any>(GlobalConfig.mossWalletKey, null);
    const account = data?.account;

    console.log(account?.contractAddress)
    const { data: activityData } = useSWR(['activity', account?.contractAddress], () => getTransactions(account?.contractAddress));

    console.log(activityData)

    const openScan = (it: any) => {
        console.log(it)
        window.open(GlobalConfig.scanUrl + it.node.transaction_hash, '_blank');
    }
    return (
        <Container>
            <TabBar title={'Activity'}/>
            <div className="pt-6 space-y-6">
                {
                    activityData?.data?.transactions?.edges?.map((it:any, i:number) => {
                        return (
                            <Card key={i} onClick={() => openScan(it)}>
                                <CardContent className={'pt-4 px-4 cursor-pointer'}>
                                    <div className="flex justify-between">
                                        <div className="text-lg font-bold">{it.node.transaction_type}</div>
                                        <Badge className="text-xs font-light">{it.node.transaction_status}</Badge>
                                    </div>
                                    <div>
                                        {it.node.main_calls?.map((item:any, index: number) => {
                                            return (
                                                <div key={index} className="flex justify-between mt-2">
                                                    <div className="text-sm text-gray-500">{shortenAddress(item.contract_address)}</div>
                                                    <div className="text-sm text-gray-500">{item.selector_name}</div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-4">{formatTime(it.node.timestamp)}</div>
                                </CardContent>
                            </Card>
                        )
                    })
                }
            </div>
        </Container>
    )
}