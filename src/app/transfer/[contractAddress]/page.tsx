'use client';
import {Container} from "@/components/Container";
import {TabBar} from "@/components/TabBar";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {useParams, useSearchParams} from "next/navigation";
import {useLocalStorage} from "react-use";
import {GlobalConfig} from "@/constants";
import {getInvokeHash, invokeTx} from "@/core/account";
import {arrayBufferToHex, bufferDecodeHexString} from "@/core/utils";
import useSWR from "swr";
import {queryTokenBalance} from "@/services/wallet";
import {useState} from "react";
import {getDecimals} from "@/core/web3";
import {parseUnits} from "viem";
import toast from "react-hot-toast";


export default function TransferPage() {
    const searchParams = useSearchParams();
    const { contractAddress } = useParams();
    const symbol = searchParams.get('symbol');

    const [data] = useLocalStorage<any>(GlobalConfig.mossWalletKey, null);
    const account = data?.account;

    const { data: banlanceData } = useSWR(['balance', account?.contractAddress], () => queryTokenBalance(data?.account?.contractAddress));

    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('0');

    const currentData = banlanceData?.data?.tokenBalancesByOwnerAddress?.find((it:any) => it.token_contract_address === contractAddress);

    const handleClick = async () => {
        try {
            const decimals = await getDecimals(contractAddress as string);
            const amountWei = parseUnits(amount, Number(decimals)).toString();
            const transactions = [
                {
                    contractAddress: contractAddress as string,
                    entrypoint: 'transfer',
                    calldata: [recipient, amountWei, '0']
                }
            ];

            const deployHash = await getInvokeHash(account.publicKey, transactions);

            const publicKeyCredentialRequestOptions = {
                challenge: bufferDecodeHexString(deployHash),
                rpId: window.location.hostname, // 确保与当前页面的域名相匹配
            }
            const cred = await navigator.credentials.get({publicKey: publicKeyCredentialRequestOptions}) as any;

            const signature = cred?.response.signature;
            const signatureHex = arrayBufferToHex(signature);
            const authenticatorData = cred?.response.authenticatorData;
            const authenticatorDataHex = arrayBufferToHex(authenticatorData);

            // 获取最后四个字节的十六进制字符串
            const lastFourBytesHex = authenticatorDataHex.slice(-10);  // 获取最后8个字符

            // 解析十六进制为整数，假设大端序
            const signCount = parseInt(lastFourBytesHex, 16);  // 只取最后两位数

            const response = await invokeTx(account.publicKey, signatureHex.slice(2), signCount, transactions);
            console.log(response) //transaction_hash
            toast('Transaction submitted successfully');
        } catch (e:any) {
            toast.error(e.message);
        }
    }
    return (
        <Container>
            <TabBar title={`Transfer ${symbol}`}/>
            <div className="space-y-4 mt-8">
                <div className="flex justify-between">
                    <div className="text-sm">Balance</div>
                    <div>
                        <div className="font-semibold text-xl">{currentData?.balance_display} ETH</div>
                        {/*<div className="text-right text-sm">≈ $9,999.99 USD</div>*/}
                    </div>
                </div>
                <div>
                    <Label>To Address</Label>
                    <Input placeholder={'To Address'} value={recipient} onChange={e => setRecipient(e.target.value)}/>
                </div>
                <div>
                    <Label>Amount</Label>
                    <Input placeholder={'Enter Amount'} value={amount} onChange={e => setAmount(e.target.value)}/>
                </div>
                <div className={'pt-8'}>
                    <Button className={'w-full'} onClick={handleClick}>Transfer</Button>
                </div>
            </div>
        </Container>
    )
}