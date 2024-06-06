'use client';
import { TabBar } from '@/components/TabBar';
import { Container } from '@/components/Container';
import { useAccount, useAccountABI } from '@/hooks/useAccount';
import { useTransactionStore } from '@/components/PendingTransactions';
import { DappList } from '@/constants';
import { Button } from '@/components/ui/button';
import useSWR from 'swr';
import { fetchTokenInfo, queryNFTBalance, queryTokenBalance } from '@/services/wallet';
import { NFTIcon } from '@/components/Icons';
import { Suspense, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React from 'react';
import { cairo, Contract, hash, num, uint256 } from 'starknet';
import { provider, writeContract } from '@/core/account';
import toast from 'react-hot-toast';
import { Modal } from '@/components/Modal';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { getDecimals } from '@/core/web3';
import { formatUnits, parseUnits } from 'viem';
import { Select } from '@/components/Select';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { shortenAddress } from '@/utils/common';
import { chunk } from 'lodash';

const MarketDapp = DappList.find((it) => it.name === 'NFTMarket');

const NFTPanel = () => {
  const { account } = useAccount();
  const { data: banlanceData } = useSWR(['nft-balance', account?.contractAddress], () =>
    queryNFTBalance(account!.contractAddress)
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
    queryTokenBalance(account!.contractAddress)
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
          contractAddress: account!.contractAddress,
          entrypoint: 'execute_own_dapp',
          calldata: [MarketDapp!.classHash, Selector, [nftContract, res1.low, res1.high, address, res.low, res.high]]
        }
      ];
      const response = await writeContract(account!.publicKey, transactions);
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
  saler,
  onSuccess
}: {
  order: any;
  orderID: string;
  saler: string;
  onSuccess: () => void;
}) => {
  const [open, setOpen] = useState(false);
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
          contractAddress: account!.contractAddress,
          entrypoint: 'execute_own_dapp',
          calldata: [TokenManageDapp!.classHash, Selector, [order.asset_contract, saler, res.low, res.high]]
        },
        {
          contractAddress: saler,
          entrypoint: 'execute_own_dapp',
          calldata: [MarketDapp!.classHash, BuySelector, [TokenManageDapp?.classHash, orderID]]
        }
      ];
      const response = await writeContract(account!.publicKey, transactions);
      console.log(response); //transaction_hash
      push(response.transaction_hash);
      toast.success('Transaction submitted successfully');
      const result = await provider.waitForTransaction(response.transaction_hash);
      console.log(result, 'rr');
      if (result.execution_status === 'SUCCEEDED') {
        setOpen(false);
        toast.success('Transaction has been confirmed');
        onSuccess();
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
      trigger={
        <Button loading={loading} className={'w-full mt-2'} size={'sm'}>
          Buy
        </Button>
      }
    >
      <div>
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold">Buy NFT</div>
        </div>
        <div className="mt-4">
          <Label>NFT</Label>
          <div>{shortenAddress(order.nft_contract)}</div>
        </div>
        <div className="mt-4">
          <Label>Token ID</Label>
          <div>{order.token_id}</div>
        </div>
        {/*<div className="mt-4">*/}
        {/*  <Label>Sale Token</Label>*/}
        {/*  <div>{shortenAddress(order.asset_contract)}</div>*/}
        {/*</div>*/}
        <div className="mt-4">
          <Label>Price</Label>
          <div>
            {order.formattedPrice} {order.tokenInfo?.symbol}
          </div>
        </div>
      </div>
    </Modal>
  );
};

const BuyPanel = () => {
  const { address: salerAddress } = useParams<{ address: string }>();
  const [saler, setSaler] = useState('');
  const [open, setOpen] = useState(false);
  const { account } = useAccount();
  const { abi } = useAccountABI(account!.contractAddress);
  const { push } = useTransactionStore();
  const [id, setId] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  const getOrderList = async () => {
    try {
      const Selector = hash.getSelectorFromName('get_active_orders');
      const contract = new Contract(abi!, salerAddress!, provider);
      console.log(salerAddress, abi);
      const result = await contract.read_own_dapp(MarketDapp!.classHash, Selector, []);
      const [lenInt, ...rest] = result;
      const len = Number(BigInt(lenInt).toString());
      console.log(len, rest, result);
      if (len > 0) {
        const orderArr = chunk(rest, 8)?.map(async (it: any[]) => {
          const token = await fetchTokenInfo(num.toHex(it[4]), account?.contractAddress);
          console.log(it, token, 'it');
          const price = uint256.uint256ToBN({ low: it[5], high: it[6] }).toString();
          return {
            order_id: BigInt(it[0]).toString(),
            nft_contract: num.toHex(it[1]),
            token_id: uint256.uint256ToBN({ low: it[2], high: it[3] }).toString(),
            asset_contract: num.toHex(it[4]),
            price: price,
            seller: it[7],
            tokenInfo: token,
            formattedPrice: formatUnits(BigInt(price), Number(token!.decimals))
          };
        });
        return await Promise.all(orderArr);
      }
      return [];
    } catch (e) {
      console.error(e);
    }
  };

  const { data, mutate } = useSWR(abi && salerAddress ? ['nft-orders', salerAddress, abi] : null, getOrderList);

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
      setOpen(true);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleEnter = () => {
    router.push(`/owndapp/${saler}/nft_market`);
  };
  console.log(salerAddress, data);

  return (
    <div className={'py-8'}>
      {salerAddress ? (
        <div className={'space-y-6'}>
          {data?.length ? (
            data?.map((it, index) => {
              return (
                <div key={index} className={'flex justify-between border rounded-xl py-2 px-4'}>
                  <div className="flex items-center gap-2">
                    <div
                      className={
                        'text-primary text-md font-medium w-6 h-6 rounded-full bg-secondary flex justify-center items-center'
                      }
                    >
                      {it.order_id}
                    </div>
                    <div className="text-center">
                      <NFTIcon className={'w-10 h-10'} />
                      <div>#{it.token_id}</div>
                    </div>
                  </div>
                  <div className="p-2">
                    <div>
                      <div>
                        {it.formattedPrice} {it.tokenInfo?.symbol}
                      </div>
                      <BuyModal order={it} orderID={it.order_id} saler={salerAddress!} onSuccess={() => mutate()} />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={'text-center py-6 text-primary/60'}>No Data</div>
          )}
        </div>
      ) : (
        <div className={'flex gap-2 items-center'}>
          <Input placeholder={'Input saler address'} value={saler} onChange={(e) => setSaler(e.target.value)} />
          <Button onClick={handleEnter}>Enter</Button>
        </div>
      )}
    </div>
  );
};

export default function NFTMarket() {
  return (
    <Suspense>
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
    </Suspense>
  );
}
