'use client';
import { TabBar } from '@/components/TabBar';
import { Container } from '@/components/Container';
import { useAccount, useAccountABI } from '@/hooks/useAccount';
import { useTransactionStore } from '@/components/PendingTransactions';
import { DappList } from '@/constants';
import { Button } from '@/components/ui/button';
import useSWR from 'swr';
import { queryNFTBalance, queryTokenBalance } from '@/services/wallet';
import { NFTIcon } from '@/components/Icons';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X } from 'lucide-react';
import * as React from 'react';
import { cairo, Contract, hash, num, shortString, uint256 } from 'starknet';
import { provider, writeContract } from '@/core/account';
import toast from 'react-hot-toast';
import { Modal } from '@/components/Modal';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { getDecimals } from '@/core/web3';
import { formatUnits, parseUnits } from 'viem';
import { Select } from '@/components/Select';
import { useSearchParam } from 'react-use';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createQueryString, shortenAddress } from '@/utils/common';

const MarketDapp = DappList.find((it) => it.name === 'NFTMarket');

const NFTPanel = () => {
  const { account } = useAccount();
  const { data: banlanceData } = useSWR(['nft-balance', account?.contractAddress], () =>
    queryNFTBalance(account?.contractAddress)
  );

  return (
    <div className={'mt-4 grid grid-cols-2 gap-3'}>
      {banlanceData?.data?.nfts?.edges?.map((item: any, index: number) => {
        return (
          <div
            key={index}
            className={'cursor-pointer shadow border rounded-md'}
            onClick={() => {
              //
            }}
          >
            <div className="w-full">
              {item.node.image_url ? (
                <img className={'w-full'} src={item.node.image_url} alt={item.node.name} />
              ) : (
                <NFTIcon className={'w-[100px] h-[100px] m-auto'} />
              )}
            </div>
            <div className="flex justify-between items-center p-2">
              <div className={'text-gray-600 text-lg font-semibold'}>{item.node.name || 'NFT'}</div>
              <span>#{item.node.token_id}</span>
            </div>
            <div className="p-2">
              <ListModal tokenID={item.node.token_id} nftContract={item.node.nft_contract_address} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ListModal = ({ nftContract, tokenID }: { nftContract: string; tokenID: string }) => {
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const { account } = useAccount();
  const { push } = useTransactionStore();
  const [loading, setLoading] = useState(false);
  const { data: banlanceData } = useSWR(['token-balance', account?.contractAddress], () =>
    queryTokenBalance(account?.contractAddress)
  );

  const handleSubmit = async () => {
    console.log('submit');
    try {
      setLoading(true);
      const Selector = hash.getSelectorFromName('list_nft');
      const decimals = await getDecimals(address as string);
      const amountWei = parseUnits(price, Number(decimals));
      const res = cairo.uint256(amountWei.toString());
      const res1 = cairo.uint256(tokenID);
      const transactions = [
        {
          contractAddress: account?.contractAddress,
          entrypoint: 'execute_own_dapp',
          calldata: [MarketDapp!.classHash, Selector, [nftContract, res1.low, res1.high, address, res.low, res.high]]
        }
      ];
      const response = await writeContract(account.publicKey, transactions);
      console.log(response); //transaction_hash
      push(response.transaction_hash);
      toast.success('Transaction submitted successfully');
      const result = await provider.waitForTransaction(response.transaction_hash);
      console.log(result, 'rr');
      if (result.execution_status === 'SUCCEEDED') {
        setOpen(false);
        toast.success('Transaction has been confirmed');
      } else {
        toast.error(result.revert_reason);
      }
    } catch (e: any) {
      console.error('交易出错：', e);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button onClick={() => setOpen(true)} className={'w-full'}>
          List for sale
        </Button>
      }
      onConfirm={handleSubmit}
      confirmButtonProps={{
        loading
      }}
    >
      <div className={'space-y-6'}>
        <div className="space-y-2">
          <Label>Sale Token</Label>
          <Select
            value={address}
            onChange={(v) => {
              setAddress(v);
            }}
            options={
              banlanceData?.data?.tokenBalancesByOwnerAddress?.map((it: any) => {
                return {
                  label: it.contract_token_contract.symbol,
                  value: it.token_contract_address
                };
              }) || []
            }
          ></Select>
          {/*<Input placeholder={'sale token'} value={address} onChange={(e) => setAddress(e.target.value)} />*/}
        </div>
        <div className="space-y-2">
          <Label>Price</Label>
          <Input placeholder={'price'} value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
      </div>
    </Modal>
  );
};

const BuyModal = ({
  order,
  orderID,
  open,
  setOpen,
  saler
}: {
  order: any;
  orderID: string;
  open: boolean;
  setOpen: (v: boolean) => void;
  saler: string;
}) => {
  const { account } = useAccount();
  const { push } = useTransactionStore();
  const [loading, setLoading] = useState(false);
  const TokenManageDapp = DappList.find((it) => it.name === 'TokenManage');

  const handleSubmit = async () => {
    console.log('submit');
    try {
      setLoading(true);
      const decimals = await getDecimals(order.asset_contract as string);
      const amountWei = parseUnits(order.price, Number(decimals));
      const res = cairo.uint256(amountWei.toString());
      const Selector = hash.getSelectorFromName('token_approve');
      console.log('Selector =', Selector);
      const BuySelector = hash.getSelectorFromName('buy_nft');
      const transactions = [
        {
          contractAddress: account?.contractAddress,
          entrypoint: 'execute_own_dapp',
          calldata: [TokenManageDapp!.classHash, Selector, [order.asset_contract, saler, res.low, res.high]]
        },
        {
          contractAddress: saler,
          entrypoint: 'execute_own_dapp',
          calldata: [MarketDapp!.classHash, BuySelector, [TokenManageDapp?.classHash, orderID]]
        }
      ];
      const response = await writeContract(account.publicKey, transactions);
      console.log(response); //transaction_hash
      push(response.transaction_hash);
      toast.success('Transaction submitted successfully');
      const result = await provider.waitForTransaction(response.transaction_hash);
      console.log(result, 'rr');
      if (result.execution_status === 'SUCCEEDED') {
        setOpen(false);
        toast.success('Transaction has been confirmed');
      } else {
        toast.error(result.revert_reason);
      }
    } catch (e: any) {
      console.error('交易出错：', e);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  console.log(order, 'rr');

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      onConfirm={handleSubmit}
      confirmButtonProps={{
        loading
      }}
    >
      <div>
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold">Buy NFT</div>
        </div>
        <div className="mt-4">
          <Label>Price</Label>
          <div>{order.formattedPrice}</div>
        </div>
        <div className="mt-4">
          <Label>NFT</Label>
          <div>{shortenAddress(order.nft_contract)}</div>
        </div>
        <div className="mt-4">
          <Label>Token ID</Label>
          <div>{order.token_id}</div>
        </div>
        <div className="mt-4">
          <Label>Sale Token</Label>
          <div>{shortenAddress(order.asset_contract)}</div>
        </div>
      </div>
    </Modal>
  );
};

const BuyPanel = () => {
  const searchParams = useSearchParams();
  const salerAddress = searchParams.get('saler');
  const [saler, setSaler] = useState('');
  const [open, setOpen] = useState(false);
  console.log(open, 'ss');
  const { account } = useAccount();
  const { abi } = useAccountABI(account?.contractAddress);
  const { push } = useTransactionStore();
  const [id, setId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  const getOrder = async () => {
    if (!id) {
      toast.error('Please input order id');
      return;
    }
    try {
      const Selector = hash.getSelectorFromName('get_order_status');
      const contract = new Contract(abi!, salerAddress!, provider);
      console.log(MarketDapp!.classHash, Selector, [id]);
      const result = await contract.read_own_dapp(MarketDapp!.classHash, Selector, [Number(id)]);
      console.log(result, 'result');
      const nft_contract = num.toHex(result[0]);
      const token_id = uint256
        .uint256ToBN({
          low: result[1],
          high: result[2]
        })
        .toString();
      const asset_contract = num.toHex(result[3]);
      const price = uint256
        .uint256ToBN({
          low: result[4],
          high: result[5]
        })
        .toString();
      const decimals = await getDecimals(asset_contract as string);

      setOrder({
        nft_contract,
        token_id,
        asset_contract,
        price,
        formattedPrice: formatUnits(BigInt(price), Number(decimals))
      });
      setOpen(true);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleEnter = () => {
    const params = createQueryString(searchParams, 'saler', saler);
    router.push(pathname + '?' + params);
  };

  return (
    <div className={'py-8'}>
      {salerAddress ? (
        <div className={'flex gap-2 items-center'}>
          <Input placeholder={'Input order id to search order'} value={id} onChange={(e) => setId(e.target.value)} />
          <Button onClick={getOrder}>Search</Button>
        </div>
      ) : (
        <div className={'flex gap-2 items-center'}>
          <Input placeholder={'Input saler address'} value={saler} onChange={(e) => setSaler(e.target.value)} />
          <Button onClick={handleEnter}>Enter</Button>
        </div>
      )}
      {order && <BuyModal order={order} orderID={id} open={open} setOpen={setOpen} saler={salerAddress!} />}
    </div>
  );
};

export default function NFTMarket() {
  const { account } = useAccount();

  const { push } = useTransactionStore();

  return (
    <Container>
      <TabBar title={`NFT Market`} />
      <div className="py-4 space-y-6 px-2">
        <Tabs defaultValue="market" className="w-full mt-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="nft">My NFT</TabsTrigger>
          </TabsList>
          <TabsContent value="market">
            <BuyPanel />
          </TabsContent>
          <TabsContent value="nft">
            <NFTPanel />
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
}
