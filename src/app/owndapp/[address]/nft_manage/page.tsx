'use client';
import { TabBar } from '@/components/TabBar';
import { Container } from '@/components/Container';
import { useAccount } from '@/hooks/useAccount';
import useSWR from 'swr';
import { queryNFTBalance } from '@/services/wallet';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/Select';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cairo, Contract, hash } from 'starknet';
import { DappList } from '@/constants';
import { provider, writeContract } from '@/core/account';
import toast from 'react-hot-toast';
import { useTransactionStore } from '@/components/PendingTransactions';
import { Checkbox } from '@/components/ui/checkbox';
import { shortenAddress } from '@/utils/common';

export default function NFTManage() {
  const { account } = useAccount();
  const { data: banlanceData } = useSWR(['nft-balance', account?.contractAddress], () =>
    queryNFTBalance(account!.contractAddress)
  );
  const [address, setAddress] = useState('');
  const [spender, setSpender] = useState('');
  const [recipient, setRecipient] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [isApprovalAll, setApprovalAll] = useState(false);
  const [approvalById, setApprovalById] = useState(false);
  const [approvalResult, setApprovalResult] = useState(false);
  const [approvalAllResult, setApprovalAllResult] = useState(false);

  const { push } = useTransactionStore();
  const NFTManageDapp = DappList.find((it) => it.name === 'NFTManage');

  const handleGetAllowance = async () => {
    try {
      const Selector = hash.getSelectorFromName('nft_get_approved');
      console.log('Selector =', Selector);
      const { abi } = await provider.getClassAt(account!.contractAddress);
      const contract = new Contract(abi, account!.contractAddress, provider);
      const res = cairo.uint256(tokenId);
      const result = await contract.read_own_dapp(NFTManageDapp!.classHash, Selector, [address, res.low, res.high]);
      console.log(result); //transaction_hash
      setApprovalById(!!Number(result[0]));
    } catch (e: any) {
      console.error('交易出错：', e);
      toast.error(e.message);
    }
  };

  const handleTransfer = async () => {
    try {
      const res = cairo.uint256(tokenId);
      const Selector = hash.getSelectorFromName('nft_transfer');
      console.log('Selector =', Selector);
      const transactions = [
        {
          contractAddress: account!.contractAddress,
          entrypoint: 'execute_own_dapp',
          calldata: [NFTManageDapp!.classHash, Selector, [address, recipient, res.low, res.high]]
        }
      ];
      const response = await writeContract(account!.publicKey, transactions);
      console.log(response); //transaction_hash
      push(response.transaction_hash);
      toast.success('Transaction submitted successfully');
      const result = await provider.waitForTransaction(response.transaction_hash);
      console.log(result, 'rr');
    } catch (e: any) {
      console.error('交易出错：', e);
      toast.error(e.message);
    }
  };

  const handleApproval = async () => {
    try {
      const res = cairo.uint256(tokenId);
      const Selector = hash.getSelectorFromName('nft_approve');
      console.log('Selector =', Selector);
      const transactions = [
        {
          contractAddress: account!.contractAddress,
          entrypoint: 'execute_own_dapp',
          calldata: [NFTManageDapp!.classHash, Selector, [address, spender, res.low, res.high]]
        }
      ];
      const response = await writeContract(account!.publicKey, transactions);
      console.log(response); //transaction_hash
      push(response.transaction_hash);
      toast.success('Transaction submitted successfully');
      const result = await provider.waitForTransaction(response.transaction_hash);
      console.log(result, 'rr');
    } catch (e: any) {
      console.error('交易出错：', e);
      toast.error(e.message);
    }
  };

  const handleApprovalAll = async (isAll = true) => {
    try {
      const Selector = hash.getSelectorFromName(
        isAll ? 'nft_set_approval_for_all_all' : 'nft_set_approval_for_one_all'
      );
      console.log('Selector =', Selector);
      const transactions = [
        {
          contractAddress: account!.contractAddress,
          entrypoint: 'execute_own_dapp',
          calldata: [
            NFTManageDapp!.classHash,
            Selector,
            isAll ? [spender, isApprovalAll] : [address, spender, isApprovalAll]
          ]
        }
      ];
      const response = await writeContract(account!.publicKey, transactions);
      console.log(response); //transaction_hash
      push(response.transaction_hash);
      toast.success('Transaction submitted successfully');
      const result = await provider.waitForTransaction(response.transaction_hash);
      console.log(result, 'rr');
    } catch (e: any) {
      console.error('交易出错：', e);
      toast.error(e.message);
    }
  };

  const checkApprovalAll = async (isAll = true) => {
    try {
      const Selector = hash.getSelectorFromName(isAll ? 'nft_is_approved_for_all_all' : 'nft_is_approved_for_one_all');
      console.log('Selector =', Selector);
      const { abi } = await provider.getClassAt(account!.contractAddress);
      const contract = new Contract(abi, account!.contractAddress, provider);
      const result = await contract.read_own_dapp(
        NFTManageDapp!.classHash,
        Selector,
        isAll ? [spender] : [address, spender]
      );
      console.log(result);
      if (isAll) {
        setApprovalAllResult(!!Number(result[0]));
      } else {
        setApprovalResult(!!Number(result[0]));
      }
    } catch (e: any) {
      console.error('交易出错：', e);
      toast.error(e.message);
    }
  };
  return (
    <Container>
      <TabBar title={`Token Manage`} />
      <div className="py-4 space-y-6 px-2">
        <div>
          <Label>Select your token</Label>
          <Select
            value={address}
            onChange={(v) => {
              setAddress(v);
            }}
            options={
              banlanceData?.data?.nfts?.edges?.map((it: any) => {
                return {
                  label: `${it.node.name || shortenAddress(it.node.nft_contract_address)}-#${it.node.token_id}`,
                  value: it.node.nft_contract_address
                };
              }) || []
            }
          ></Select>
        </div>
        {address && (
          <>
            <div className={'space-y-2'}>
              <Label>Get nft approved</Label>
              <Input placeholder={'input spender'} value={spender} onChange={(e) => setSpender(e.target.value)} />
              <div className={'flex gap-2 items-center'}>
                <Input placeholder={'input token id'} value={tokenId} onChange={(e) => setTokenId(e.target.value)} />
                <Button onClick={handleGetAllowance}>Submit</Button>
              </div>
              <div>{`result: ${approvalById}`}</div>
            </div>

            <div>
              <Label>Transfer</Label>
              <div className={'space-y-4'}>
                <div>
                  <Label>recipient</Label>
                  <Input placeholder={'To Address'} value={recipient} onChange={(e) => setRecipient(e.target.value)} />
                </div>
                <div>
                  <Label>token id</Label>
                  <Input placeholder={'Enter token id'} value={tokenId} onChange={(e) => setTokenId(e.target.value)} />
                </div>
                <Button onClick={handleTransfer}>Submit</Button>
              </div>
            </div>
            <div>
              <Label>Approval</Label>
              <div className={'space-y-4'}>
                <div>
                  <Label>spender</Label>
                  <Input placeholder={'spender'} value={spender} onChange={(e) => setSpender(e.target.value)} />
                </div>
                <div>
                  <Label>token id</Label>
                  <Input placeholder={'Enter token id'} value={tokenId} onChange={(e) => setTokenId(e.target.value)} />
                </div>
                <Button onClick={handleApproval}>Approval</Button>
              </div>
            </div>
            <div>
              <Label>Approval one nft of all</Label>
              <div className={'space-y-4'}>
                <div>
                  <Label>spender {`result:${approvalResult}`}</Label>
                  <div className="flex gap-2 items-center">
                    <Input placeholder={'spender'} value={spender} onChange={(e) => setSpender(e.target.value)} />
                    <Button onClick={() => checkApprovalAll(false)}>Check</Button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="approval" checked={isApprovalAll} onCheckedChange={(e) => setApprovalAll(e as any)} />
                  <Label
                    htmlFor="approval"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    is approval all
                  </Label>
                </div>
                <Button onClick={() => handleApprovalAll(false)}>Submit</Button>
              </div>
            </div>
          </>
        )}
        <div>
          <Label>Approval all</Label>
          <div className={'space-y-4'}>
            <div>
              <Label>spender {`result:${approvalAllResult}`}</Label>
              <div className="flex gap-2 items-center">
                <Input placeholder={'spender'} value={spender} onChange={(e) => setSpender(e.target.value)} />
                <Button onClick={() => checkApprovalAll()}>Check</Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="approval" checked={isApprovalAll} onCheckedChange={(e) => setApprovalAll(e as any)} />
              <Label
                htmlFor="approval"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                is approval all
              </Label>
            </div>
            <Button onClick={() => handleApprovalAll()}>Submit</Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
