'use client';
import {Container} from "@/components/Container";
import {TabBar} from "@/components/TabBar";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {useSearchParams} from "next/navigation";
import {useLocalStorage} from "react-use";
import {GlobalConfig} from "@/constants";
import {getDeployHash, invokeTx} from "@/core/account";
import {arrayBufferToHex, bufferDecodeHexString} from "@/core/utils";


export default function TransferPage() {
    const searchParams = useSearchParams();

    const symbol = searchParams.get('symbol');

    const [data] = useLocalStorage<any>(GlobalConfig.mossWalletKey, null);
    const account = data?.account;

    const handleClick = async () => {
        const deployHash = getDeployHash(account.publicKey);

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

        invokeTx(account.publicKey, signatureHex.slice(2), signCount);
    }
    return (
        <Container>
            <TabBar title={`Transfer ${symbol}`}/>
            <div className="space-y-4 mt-8">
                <div>
                    <Label>To Address</Label>
                    <Input placeholder={'To Address'}/>
                </div>
                <div>
                    <Label>Amount</Label>
                    <Input placeholder={'Enter Amount'}/>
                </div>
                <div className={'pt-8'}>
                    <Button className={'w-full'} onClick={handleClick}>Transfer</Button>
                </div>
            </div>
        </Container>
    )
}