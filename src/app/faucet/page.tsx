'use client';
import { Container } from '@/components/Container';
import { TabBar } from '@/components/TabBar';
import { getDecimals } from '@/core/web3';
import { parseUnits } from 'viem';
import { cairo } from 'starknet';
import { writeContract } from '@/core/account';
import toast from 'react-hot-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccount } from '@/hooks/useAccount';
import { useTransactionStore } from '@/components/PendingTransactions';

const tokens = {
  Moon: '0x074f4646bd254ac291db5a0a4761749ea9c33a65245bd139a956c23a14615e5b',
  Moss: '0x04b3ca51489fdb9ec1dfdf0c0da9102e37b1cc652fb936de83f0e4ca2310133d'
};

const nfts = {
  Planet: '0x035dc664b8b0b7a528edc118ffbd65e41b0311cf304d36e25453ae11c262a029',
  Astronaut: '0x0494c9d56519801d91e890e097fbeaf427a8d213a7e33b2d31a83202fc2e26b3'
};

export default function Faucet() {
  const { account } = useAccount();
  const { push } = useTransactionStore();

  const [ids, setIds] = useState('');
  const [amount, setAmount] = useState('0');

  const mintERC20 = async (contractAddress: string) => {
    try {
      const decimals = await getDecimals(contractAddress as string);
      const amountWei = parseUnits(amount, Number(decimals));
      const res = cairo.uint256(amountWei.toString());
      console.log(res, 'rr');
      const transactions = [
        {
          contractAddress: contractAddress as string,
          entrypoint: 'mint',
          calldata: [account!.contractAddress, res.low, res.high]
        }
      ];
      const response = await writeContract(account!.publicKey, transactions);
      console.log(response); //transaction_hash
      push(response.transaction_hash);
      toast.success('Transaction submitted successfully');
      // router.back();
    } catch (e: any) {
      console.error('交易出错：', e);
      toast.error(e.message);
    }
  };

  const mintNFT = async (contractAddress: string) => {
    try {
      // const idArr = ids.split(',');
      const res = cairo.uint256(ids);
      const transactions = [
        {
          contractAddress: contractAddress as string,
          entrypoint: 'mint',
          calldata: [account!.contractAddress, 1, res.low, res.high]
        }
      ];
      const response = await writeContract(account!.publicKey, transactions);
      console.log(response); //transaction_hash
      push(response.transaction_hash);
      toast.success('Transaction submitted successfully');
      // router.back();
    } catch (e: any) {
      console.error('交易出错：', e);
      toast.error(e.message);
    }
  };
  return (
    <Container>
      <TabBar title={'Faucet'} />
      <Tabs defaultValue="token" className="w-[400px] mt-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="token">Token</TabsTrigger>
          <TabsTrigger value="nft">NFT</TabsTrigger>
        </TabsList>
        <TabsContent value="token">
          <div className={'p-4 space-y-6'}>
            <div>
              <Label>Amount</Label>
              <Input placeholder={'Enter Amount'} value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className={'pt-8 flex gap-4'}>
              <Button className={'w-full'} onClick={() => mintERC20(tokens.Moon)}>
                Mint (Moon)
              </Button>
              <Button className={'w-full'} onClick={() => mintERC20(tokens.Moss)}>
                Mint (Moss)
              </Button>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="nft">
          <div className={'p-4 space-y-6'}>
            <div>
              <Label>Token Id</Label>
              <Input placeholder={'Enter Token Id'} value={ids} onChange={(e) => setIds(e.target.value)} />
            </div>
            <div className={'pt-8 flex gap-4'}>
              <Button className={'w-full'} onClick={() => mintNFT(nfts.Planet)}>
                Mint (Planet)
              </Button>
              <Button className={'w-full'} onClick={() => mintNFT(nfts.Astronaut)}>
                Mint (Astronaut)
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Container>
  );
}
