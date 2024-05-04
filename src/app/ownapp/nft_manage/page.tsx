'use client';
import {TabBar} from "@/components/TabBar";
import {Container} from "@/components/Container";
import {useAccount} from "@/hooks/useAccount";
import useSWR from "swr";
import {queryTokenBalance} from "@/services/wallet";
import {Label} from "@/components/ui/label";
import {Select} from "@/components/Select";
import {useState} from "react";
import { Input } from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {cairo, Contract, hash, uint256} from "starknet";
import {DappList} from "@/constants";
import {provider, writeContract} from "@/core/account";
import toast from "react-hot-toast";
import {useTransactionStore} from "@/components/PendingTransactions";
import {getDecimals} from "@/core/web3";
import {formatUnits, parseUnits} from "viem";
import {Checkbox} from "@/components/ui/checkbox";


export default function TokenManage() {
    const { account } = useAccount();
    const { data: banlanceData } = useSWR(['token-balance', account?.contractAddress], () => queryTokenBalance(account?.contractAddress));
    const [address, setAddress] = useState('');
    const [spender, setSpender] = useState('');
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('0');
    const [isApprovalAll, setApprovalAll] = useState(false);
    const [allowance, setAllowance] = useState('');
    const [approvalResult, setApprovalResult] = useState(false);

    const {push} = useTransactionStore();
    const TokenManageDapp = DappList.find(it => it.name === 'TokenManage');

    const handleGetAllowance = async () => {
        try {
            const Selector = hash.getSelectorFromName('token_allowance');
            console.log('Selector =', Selector);
            const { abi } = await provider.getClassAt(account?.contractAddress);
            const contract = new Contract(abi, account?.contractAddress, provider);
            const result = await contract.read_own_dapp(TokenManageDapp!.classHash, Selector, [address, spender]);
            console.log(result) //transaction_hash
            const allowance = uint256.uint256ToBN({
                low: result[0],
                high: result[1],
            });
            console.log(allowance, allowance.toString(), 'all')
            const decimals = await getDecimals(address as string);
            const amountStr = formatUnits(allowance, Number(decimals));
            setAllowance(amountStr);
        } catch (e: any) {
            console.error("交易出错：", e);
            toast.error(e.message);
        }
    }

    const handleTransfer = async () => {
        try {
            const decimals = await getDecimals(address as string);
            const amountWei = parseUnits(amount, Number(decimals));
            const res = cairo.uint256(amountWei.toString());
            const Selector = hash.getSelectorFromName('token_transfer');
            console.log('Selector =', Selector);
            const transactions = [
                {
                    contractAddress: account?.contractAddress,
                    entrypoint: 'execute_own_dapp',
                    calldata: [TokenManageDapp!.classHash, Selector, [address, recipient, res.low, res.high]]
                }
            ];
            const response = await writeContract(account.publicKey, transactions);
            console.log(response) //transaction_hash
            push(response.transaction_hash);
            toast('Transaction submitted successfully');
            const result = await provider.waitForTransaction(response.transaction_hash);
            console.log(result, 'rr')
        } catch (e: any) {
            console.error("交易出错：", e);
            toast.error(e.message);
        }
    }

    const handleApproval = async () => {
        try {
            const decimals = await getDecimals(address as string);
            const amountWei = parseUnits(amount, Number(decimals));
            const res = cairo.uint256(amountWei.toString());
            const Selector = hash.getSelectorFromName('token_approve');
            console.log('Selector =', Selector);
            const transactions = [
                {
                    contractAddress: account?.contractAddress,
                    entrypoint: 'execute_own_dapp',
                    calldata: [TokenManageDapp!.classHash, Selector, [address, spender, res.low, res.high]]
                }
            ];
            const response = await writeContract(account.publicKey, transactions);
            console.log(response) //transaction_hash
            push(response.transaction_hash);
            toast('Transaction submitted successfully');
            const result = await provider.waitForTransaction(response.transaction_hash);
            console.log(result, 'rr')
        } catch (e: any) {
            console.error("交易出错：", e);
            toast.error(e.message);
        }
    }

    const handleApprovalAll = async () => {
        try {
            const Selector = hash.getSelectorFromName('token_approve_for_all');
            console.log('Selector =', Selector);
            const transactions = [
                {
                    contractAddress: account?.contractAddress,
                    entrypoint: 'execute_own_dapp',
                    calldata: [TokenManageDapp!.classHash, Selector, [spender, isApprovalAll]]
                }
            ];
            const response = await writeContract(account.publicKey, transactions);
            console.log(response) //transaction_hash
            push(response.transaction_hash);
            toast('Transaction submitted successfully');
            const result = await provider.waitForTransaction(response.transaction_hash);
            console.log(result, 'rr')
        } catch (e: any) {
            console.error("交易出错：", e);
            toast.error(e.message);
        }
    }

    const checkApprovalAll = async () => {
        try {
            const Selector = hash.getSelectorFromName('token_is_approve_for_all');
            console.log('Selector =', Selector);
            const { abi } = await provider.getClassAt(account?.contractAddress);
            const contract = new Contract(abi, account?.contractAddress, provider);
            const result = await contract.read_own_dapp(TokenManageDapp!.classHash, Selector, [spender]);
            console.log(result)
            setApprovalResult(!!Number(result[0]));
        } catch (e: any) {
            console.error("交易出错：", e);
            toast.error(e.message);
        }
    }
    return (
        <Container>
            <TabBar title={`Token Manage`}/>
            <div className="py-4 space-y-6">
                <div>
                    <Label>Select your token</Label>
                    <Select
                        value={address}
                        onChange={(v) => {
                            setAddress(v);
                        }}
                        options={banlanceData?.data?.tokenBalancesByOwnerAddress?.map(((it: any) => {
                            return {
                                label: it.contract_token_contract.symbol,
                                value: it.token_contract_address
                            }
                        })) || []}>
                    </Select>
                </div>
                {
                    address && (
                        <>
                            <div className={'space-y-2'}>
                                <Label>Get token allowance</Label>
                                <div className={'flex gap-2 items-center'}>
                                    <Input placeholder={'input spender address'} value={spender}
                                           onChange={e => setSpender(e.target.value)}/>
                                    <Button onClick={handleGetAllowance}>Submit</Button>
                                </div>
                                {
                                    allowance ? <div>
                                        result: {allowance}
                                    </div> : null
                                }
                            </div>

                            <div>
                                <Label>Transfer</Label>
                                <div className={'space-y-4'}>
                                    <div>
                                        <Label>recipient</Label>
                                        <Input placeholder={'To Address'} value={recipient}
                                               onChange={e => setRecipient(e.target.value)}/>
                                    </div>
                                    <div>
                                        <Label>amount</Label>
                                        <Input placeholder={'Enter Amount'} value={amount}
                                               onChange={e => setAmount(e.target.value)}/>
                                    </div>
                                    <Button onClick={handleTransfer}>Submit</Button>
                                </div>
                            </div>
                            <div>
                                <Label>Approval</Label>
                                <div className={'space-y-4'}>
                                    <div>
                                        <Label>spender</Label>
                                        <Input placeholder={'spender'} value={spender}
                                               onChange={e => setSpender(e.target.value)}/>
                                    </div>
                                    <div>
                                        <Label>amount</Label>
                                        <Input placeholder={'Enter Amount'} value={amount}
                                               onChange={e => setAmount(e.target.value)}/>
                                    </div>
                                    <Button onClick={handleApproval}>Approval</Button>
                                </div>
                            </div>
                        </>
                    )
                }
                <div>
                    <Label>Approval all</Label>
                    <div className={'space-y-4'}>
                        <div>
                            <Label>spender {`result:${approvalResult}`}</Label>
                            <div className="flex gap-2 items-center">
                                <Input placeholder={'spender'} value={spender}
                                       onChange={e => setSpender(e.target.value)}/>
                                <Button onClick={checkApprovalAll}>Check</Button>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="approval" checked={isApprovalAll} onCheckedChange={e => setApprovalAll(e as any)}/>
                            <Label
                                htmlFor="approval"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                is approval all
                            </Label>
                        </div>
                        <Button onClick={handleApprovalAll}>Submit</Button>
                    </div>
                </div>
            </div>
        </Container>
    )
}