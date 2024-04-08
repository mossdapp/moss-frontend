'use client';
import {useLocalStorage} from "react-use";
import {GlobalConfig} from "@/constants";
import {useEffect} from "react";
import { Button } from "@/components/ui/button";
import {deployAccount, getDeployHash} from "@/core/account";
import {arrayBufferToHex, bufferDecodeHexString} from "@/core/utils";
import {Container} from "@/components/Container";
import useSWR from "swr";
import {queryContractInfo, queryTokenBalance} from "@/services/wallet";
import {shortenAddress} from "@/utils/common";
import {CopyText} from "@/components/CopyText";


export default function Wallet() {
    const [data] = useLocalStorage<any>(GlobalConfig.mossWalletKey, null);

    const { data: banlanceData } = useSWR(['balance', data?.account?.contractAddress], () => queryTokenBalance(data?.account?.contractAddress));

    const account = data?.account;

    const { data: contractInfo } = useSWR(['contractInfo', data?.account?.contractAddress], () => queryContractInfo(data?.account?.contractAddress));


    const handleDeploy = async () => {
        //
        const deployHash = getDeployHash(account.publicKey);

        const publicKeyCredentialRequestOptions = {
            challenge: bufferDecodeHexString(deployHash),
            rpId: window.location.hostname, // 确保与当前页面的域名相匹配
        }
        const cred = await navigator.credentials.get({ publicKey: publicKeyCredentialRequestOptions });

        const signature = cred?.response.signature;
        const signatureHex = arrayBufferToHex(signature);

        console.log(signatureHex);

        deployAccount(account.publicKey, signatureHex.slice(2));
    }

    console.log(contractInfo);

    return (
        <Container>
            <div className={'text-center font-bold text-lg'}>
                Wallet
            </div>
            <div className={'flex justify-center text-foreground text-md font-bold mt-5'}>
                <CopyText text={account?.contractAddress}>
                    {shortenAddress(account?.contractAddress)}
                </CopyText>
            </div>
            <div className={'flex justify-end items-center mt-5'}>
                <Button onClick={handleDeploy}>Deploy Account</Button>
            </div>

            <div className={'mt-8'}>
                <div className={'font-bold text-lg'}>
                    Tokens
                </div>
                <div className={'mt-4'}>
                    {
                        banlanceData?.data?.tokenBalancesByOwnerAddress.map((item: any) => {
                            return (
                                <div key={item.id} className={'flex items-center justify-between'}>
                                    <img className={'w-3'} src={item.contract_token_contract.icon_url}
                                         alt={item.contract_token_contract.symbol}/>
                                    <span>{item.contract_token_contract.symbol}</span>
                                    <span>{item.balance_display}</span>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </Container>
    )
}