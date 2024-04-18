'use client';
import {Container} from "@/components/Container";
import {TabBar} from "@/components/TabBar";
import {getDecimals} from "@/core/web3";
import {parseUnits} from "viem";
import {cairo} from "starknet";
import {getInvokeHash, invokeTx, writeContract} from "@/core/account";
import {arrayBufferToHex, bufferDecodeHexString} from "@/core/utils";
import toast from "react-hot-toast";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useLocalStorage} from "react-use";
import {GlobalConfig} from "@/constants";
import useSWR from "swr";
import {queryTokenBalance} from "@/services/wallet";
import {useState} from "react";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

const tokens = {
    Moon: '0x05f288c0e38cab14e3e66c5427eecaee1753bc44f71f00526a55c1a0f741257b',
    Moss: '0x034f072411a9dde31e2bef9f24a170bdf3a0127fd9c882fdbd7b46aa7afbb6ca'
}

const nfts = {
    Planet: '0x035dc664b8b0b7a528edc118ffbd65e41b0311cf304d36e25453ae11c262a029',
    Astronaut: '0x0494c9d56519801d91e890e097fbeaf427a8d213a7e33b2d31a83202fc2e26b3'
}

export default function Faucet() {
    const [data] = useLocalStorage<any>(GlobalConfig.mossWalletKey, null);
    const account = data?.account;

    const [ids, setIds] = useState('');
    const [amount, setAmount] = useState('0');


    const mintERC20 = async (contractAddress: string) => {
        try {
            const decimals = await getDecimals(contractAddress as string);
            const amountWei = parseUnits(amount, Number(decimals));
            const res = cairo.uint256(amountWei.toString());
            console.log(res, 'rr')
            const transactions = [
                {
                    contractAddress: contractAddress as string,
                    entrypoint: 'mint',
                    calldata: [account?.contractAddress, res.low, res.high]
                }
            ];
            const response = await writeContract(account.publicKey, transactions);
            console.log(response) //transaction_hash
            toast('Transaction submitted successfully');
            // router.back();
        } catch (e: any) {
            console.error("交易出错：", e);
            toast.error(e.message);
        }
    }

    const mintNFT = async (contractAddress: string) => {
        try {
            const idArr = ids.split(',');
            const transactions = [
                {
                    contractAddress: contractAddress as string,
                    entrypoint: 'mint',
                    calldata: [account?.contractAddress, ...idArr]
                }
            ];
            const response = await writeContract(account.publicKey, transactions);
            console.log(response) //transaction_hash
            toast('Transaction submitted successfully');
            // router.back();
        } catch (e: any) {
            console.error("交易出错：", e);
            toast.error(e.message);
        }
    }
    return (
        <Container>
            <TabBar title={'Faucet'} />
            <Tabs defaultValue="token" className="w-[400px] mt-8">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="token">Token</TabsTrigger>
                    <TabsTrigger value="nft">NFT</TabsTrigger>
                </TabsList>
                <TabsContent value="token">
                    <div className={'p-4 space-y-6'}>
                        <div>
                            <Label>Amount</Label>
                            <Input placeholder={'Enter Amount'} value={amount}
                                   onChange={e => setAmount(e.target.value)}/>
                        </div>
                        <div className={'pt-8 flex gap-4'}>
                            <Button className={'w-full'} onClick={() => mintERC20(tokens.Moon)}>Mint (Moon)</Button>
                            <Button className={'w-full'} onClick={() => mintERC20(tokens.Moss)}>Mint (Moss)</Button>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="nft">
                    <div className={'p-4 space-y-6'}>
                        <div>
                            <Label>Token Id(多个用逗号隔开)</Label>
                            <Input placeholder={'Enter Token Id'} value={ids}
                                   onChange={e => setIds(e.target.value)}/>
                        </div>
                        <div className={'pt-8 flex gap-4'}>
                            <Button className={'w-full'} onClick={() => mintNFT(nfts.Planet)}>Mint (Planet)</Button>
                            <Button className={'w-full'} onClick={() => mintNFT(nfts.Astronaut)}>Mint (Astronaut)</Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </Container>
    )
}