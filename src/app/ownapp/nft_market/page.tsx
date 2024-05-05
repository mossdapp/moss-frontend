'use client';
import {TabBar} from "@/components/TabBar";
import {Container} from "@/components/Container";
import {useAccount} from "@/hooks/useAccount";
import {useTransactionStore} from "@/components/PendingTransactions";
import {DappList} from "@/constants";
import {Button} from "@/components/ui/button";
import useSWR from "swr";
import {queryNFTBalance} from "@/services/wallet";
import {NFTIcon} from "@/components/Icons";
import {useState} from "react";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {X} from "lucide-react";
import * as React from "react";

const NFTPanel = () => {
    const { account } = useAccount();
    const { data: banlanceData } = useSWR(['nft-balance', account?.contractAddress], () => queryNFTBalance(account?.contractAddress));

    return (
    <div className={'mt-4 grid grid-cols-2 gap-3'}>
        {
            banlanceData?.data?.nfts?.edges?.map((item: any) => {
                return (
                    <div key={item.id}
                         className={'cursor-pointer shadow border rounded-md'}
                         onClick={() => {
                             //
                         }}>
                        <div className="w-full">
                            {
                                item.node.image_url ? <img className={'w-full'}
                                                           src={item.node.image_url}
                                                           alt={item.node.name}/> :
                                    <NFTIcon className={'w-[100px] h-[100px] m-auto'}/>
                            }
                        </div>
                        <div className="flex justify-between items-center p-2">
                            <div
                                className={'text-gray-600 text-lg font-semibold'}>{item.node.name || 'NFT'}</div>
                            <span>#{item.node.token_id}</span>
                        </div>
                        <div className="p-2">
                            <ListPanel/>
                        </div>
                    </div>
                )
            })
        }
    </div>
)
}

const ListPanel = () => {
    const [open, setOpen] = useState(false);
    console.log(open, 'ss')
    return (
        <>
            {
                open ? <div className="absolute bottom-0 left-0 w-full p-4 rounded-t-2xl border shadow z-10 bg-white">
                    <ScrollArea className={'h-[70vh]'}>
                        <div className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background"
                             onClick={() => {
                                 setOpen(false);
                                 console.log('11')
                             }}>
                            <X className="h-4 w-4"/>
                        </div>

                    </ScrollArea>
                </div> : null
            }
            <Button onClick={() => setOpen(true)} className={'w-full'}>List for sale</Button>
        </>
    )
}


export default function NFTMarket() {
    const {account} = useAccount();

    const {push} = useTransactionStore();
    const CurrentDapp = DappList.find(it => it.name === 'NFTMarket');

    return (
        <Container>
            <TabBar title={`NFT Market`}/>
            <div className="py-4 space-y-6 px-2">
                <Tabs defaultValue="market" className="w-full mt-8">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="market">Market</TabsTrigger>
                        <TabsTrigger value="nft">My NFT</TabsTrigger>
                    </TabsList>
                    <TabsContent value="market">
                        111
                    </TabsContent>
                    <TabsContent value="nft">
                        <NFTPanel/>
                    </TabsContent>
                </Tabs>
            </div>
        </Container>
    )
}