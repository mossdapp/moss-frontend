'use client';
import {TabBar} from "@/components/TabBar";
import {Container} from "@/components/Container";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {useState} from "react";
import {Button} from "@/components/ui/button";
import { Contract, hash, shortString} from "starknet";
import {provider, writeContract} from "@/core/account";
import toast from "react-hot-toast";
import {useAccount} from "@/hooks/useAccount";
import {DappList} from "@/constants";
import {useTransactionStore} from "@/components/PendingTransactions";


export default function TagDapp() {
    const [address, setAddress] = useState('');
    const [tag, setTag] = useState('');
    const { account } = useAccount();
    const {push} = useTransactionStore();
    const SocialDapp = DappList.find(it => it.name === 'SocialTag');



    const getTag = async () => {
        try {
            const Selector = hash.getSelectorFromName('get_user_tags');
            console.log('Selector =', Selector);
            const { abi } = await provider.getClassAt(account?.contractAddress);
            const contract = new Contract(abi, account?.contractAddress, provider);
            const result = await contract.read_own_dapp(SocialDapp!.classHash, Selector, [address]);
            console.log(result) //transaction_hash
            setTag(shortString.decodeShortString(result[0]?.toString()));
        } catch (e: any) {
            console.error("交易出错：", e);
            toast.error(e.message);
        }
    }
    const updateTag = async () => {
        try {
            const Selector = hash.getSelectorFromName('add_tag');
            console.log('Selector =', Selector);
            const str = shortString.encodeShortString(tag);
            const transactions = [
                {
                    contractAddress: address,
                    entrypoint: 'execute_own_dapp',
                    calldata: [SocialDapp!.classHash, Selector, [account?.contractAddress, str]]
                }
            ];
            const response = await writeContract(account.publicKey, transactions);
            console.log(response) //transaction_hash
            push(response.transaction_hash);
            toast.success('Transaction submitted successfully');
            const result = await provider.waitForTransaction(response.transaction_hash);
            console.log(result, 'rr')
        } catch (e: any) {
            console.error("交易出错：", e);
            toast.error(e.message);
        }
    }

    const removeTag = async () => {
        try {
            const Selector = hash.getSelectorFromName('remove_tag');
            console.log('Selector =', Selector);
            const transactions = [
                {
                    contractAddress: account?.contractAddress,
                    entrypoint: 'execute_own_dapp',
                    calldata: [SocialDapp!.classHash, Selector, [address]]
                }
            ];
            const response = await writeContract(account.publicKey, transactions);
            console.log(response) //transaction_hash
            push(response.transaction_hash);
            toast.success('Transaction submitted successfully');
            const result = await provider.waitForTransaction(response.transaction_hash);
            console.log(result, 'rr')
        } catch (e: any) {
            console.error("交易出错：", e);
            toast.error(e.message);
        }
    }
    return (
        <Container>
            <TabBar title={`Social Tag`}/>
            <div className="py-4 space-y-6 px-2">
                <div className={'space-y-2'}>
                    <Label>Address</Label>
                    <div className="flex gap-2">
                        <Input placeholder={'input address'} value={address}
                               onChange={e => setAddress(e.target.value)}/>
                        <Button onClick={getTag}>Get Tag</Button>
                    </div>
                </div>
                <div className={'space-y-2'}>
                    <Label>Tag</Label>
                    <Input placeholder={'input tag'} value={tag}
                           onChange={e => setTag(e.target.value)}/>
                </div>
                <div className="flex gap-4">
                    <Button onClick={updateTag}>Add Tag</Button>
                    <Button onClick={removeTag}>Remove Tag</Button>
                </div>
            </div>
        </Container>
    )
}