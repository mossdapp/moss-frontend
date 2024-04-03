'use client';
import {useLocalStorage} from "react-use";
import {GlobalConfig} from "@/constants";
import {useEffect} from "react";
import { Button } from "@/components/ui/button";
import {deployAccount, getDeployHash} from "@/core/account";
import {arrayBufferToHex, bufferDecodeHexString} from "@/core/utils";


export default function Wallet() {
    const [data] = useLocalStorage(GlobalConfig.mossWalletKey, null);

    const account = data?.account;

    const handleDeploy = async () => {
        //
        const deployHash = getDeployHash(account.publicKey);

        const publicKeyCredentialRequestOptions = {
            challenge: bufferDecodeHexString(deployHash),
            rpId: window.location.hostname, // 确保与当前页面的域名相匹配
        }
        const cred = await navigator.credentials.get({ publicKey: publicKeyCredentialRequestOptions });

        const signature = cred.response.signature;

        const signatureHex = arrayBufferToHex(signature);

        // 提取客户端数据JSON
        const clientDataJSON = cred.response.clientDataJSON;


        // 获取authenticatorData，这里的assertion是一个PublicKeyCredential对象
        const authenticatorData = cred.response.authenticatorData;

        const clientDataJSONHex = arrayBufferToHex(clientDataJSON);
        const authenticatorDataHex = arrayBufferToHex(authenticatorData);

        // 这里你可以将提取到的数据发送给服务器进行验证
        console.log(`Client Data JSON: ${clientDataJSONHex}`);
        console.log(`authenticatorData: ${authenticatorDataHex}`);
        console.log(signatureHex);

        deployAccount(account.publicKey, signatureHex.slice(2));
    }

    useEffect(() => {
        const d = localStorage.getItem(GlobalConfig.mossWalletKey);
        console.log(account, d, JSON.parse(d))
    }, []);
    return (
        <div>
            <div>
                Wallet: {account?.contractAddress}
            </div>

            <div>
                <Button onClick={handleDeploy}>Deploy Account</Button>
            </div>
        </div>
    )
}
