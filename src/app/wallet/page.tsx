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
        const cred = await navigator.credentials.get({ publicKey: publicKeyCredentialRequestOptions }) as any;

        const signature = cred?.response.signature;
        const signatureHex = arrayBufferToHex(signature);

        // 提取客户端数据JSON
        const clientDataJSON = cred?.response.clientDataJSON;


        // 获取authenticatorData，这里的assertion是一个PublicKeyCredential对象
        const authenticatorData = cred?.response.authenticatorData;


        const clientDataJSONHex = arrayBufferToHex(clientDataJSON);
        const authenticatorDataHex = arrayBufferToHex(authenticatorData);

        // 获取最后四个字节的十六进制字符串
        const lastFourBytesHex = authenticatorDataHex.slice(-10);  // 获取最后8个字符

        // 解析十六进制为整数，假设大端序
        const signCount = parseInt(lastFourBytesHex, 16);  // 只取最后两位数

        // 这里你可以将提取到的数据发送给服务器进行验证
        console.log(`Client Data JSON: ${clientDataJSONHex}`);
        console.log(`authenticatorData: ${authenticatorDataHex}`);
        console.log(`signCount: ${signCount}`);
        console.log(signatureHex);

        deployAccount(account.publicKey, signatureHex.slice(2), signCount);
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
