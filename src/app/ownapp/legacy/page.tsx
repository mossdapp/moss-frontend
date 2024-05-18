'use client';
import { Container } from '@/components/Container';
import { TabBar } from '@/components/TabBar';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/Drawer';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { cairo, Contract, hash, shortString } from 'starknet';
import { provider, writeContract } from '@/core/account';
import toast from 'react-hot-toast';
import { useAccount, useAccountABI } from '@/hooks/useAccount';
import { useTransactionStore } from '@/components/PendingTransactions';
import { DappList } from '@/constants';
import { Modal } from '@/components/Modal';
import useSWR from 'swr';
import { formatTime } from '@/utils/common';

const LegacyDapp = DappList.find((it) => it.name === 'Legacy');

const LegacySetting = () => {
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [duration, setDuration] = useState('');
  const { account } = useAccount();
  const { push } = useTransactionStore();

  const handleSubmit = async () => {
    console.log('submit');
    try {
      const Selector = hash.getSelectorFromName('set_legacy_receiver');
      const transactions = [
        {
          contractAddress: account?.contractAddress,
          entrypoint: 'execute_own_dapp',
          calldata: [LegacyDapp!.classHash, Selector, [address, duration]]
        }
      ];
      const response = await writeContract(account.publicKey, transactions);
      console.log(response); //transaction_hash
      push(response.transaction_hash);
      toast.success('Transaction submitted successfully');
      const result = await provider.waitForTransaction(response.transaction_hash);
      console.log(result, 'rr');
      setOpen(false);
    } catch (e: any) {
      console.error('交易出错：', e);
      toast.error(e.message);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={setOpen}
      trigger={<Button className={'w-full'}>Legacy Setting</Button>}
      onConfirm={handleSubmit}
    >
      <div className={'space-y-6'}>
        <div className="space-y-2">
          <Label>Legacy Receiver</Label>
          <Input placeholder={'Legacy Receiver'} value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Trigger Duration</Label>
          <Input placeholder={'Trigger duration'} value={duration} onChange={(e) => setDuration(e.target.value)} />
        </div>
      </div>
    </Modal>
  );
};

const LegacyClaimModal = () => {
  const [open, setOpen] = useState(false);
  const { account } = useAccount();
  const { abi } = useAccountABI(account?.contractAddress);
  const { push } = useTransactionStore();

  const getLegacyFunc = async (func: string) => {
    const Selector = hash.getSelectorFromName(func);
    const contract = new Contract(abi!, account?.contractAddress, provider);
    const result = await contract.read_own_dapp(LegacyDapp!.classHash, Selector, []);
    console.log(result, 'result');
    return Number(result[0]);
    // console.log(result, new Date(Number(result[0]) * 1000)); //transaction_hash
  };

  const triggerLegacy = async () => {
    console.log('submit');
    try {
      const Selector = hash.getSelectorFromName('trigger_legacy');
      const transactions = [
        {
          contractAddress: account?.contractAddress,
          entrypoint: 'execute_own_dapp',
          calldata: [LegacyDapp!.classHash, Selector, []]
        }
      ];
      const response = await writeContract(account.publicKey, transactions);
      console.log(response); //transaction_hash
      push(response.transaction_hash);
      toast.success('Transaction submitted successfully');
      const result = await provider.waitForTransaction(response.transaction_hash);
      console.log(result, 'rr');
      setOpen(false);
    } catch (e: any) {
      console.error('交易出错：', e);
      toast.error(e.message);
    }
  };

  const { data } = useSWR(['lastTime', account?.contractAddress], () => getLegacyFunc('get_last_interaction_time'));

  const { data: duration } = useSWR(['durationTime', account?.contractAddress], () =>
    getLegacyFunc('get_trigger_legacy_duration')
  );
  console.log(data, duration, 'data');
  return (
    <Modal
      trigger={<Button className={'w-full'}>Legacy Claim</Button>}
      onConfirm={triggerLegacy}
      open={open}
      onOpenChange={setOpen}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Last Active Time</Label>
          <div>{data ? formatTime(data) : 'No active time'}</div>
        </div>
        <div className="space-y-2">
          <Label>Trigger Duration</Label>
          <div>{duration ? formatTime(duration) : 'No active time'}</div>
        </div>
      </div>
    </Modal>
  );
};

export default function Legacy() {
  const { account } = useAccount();
  const { push } = useTransactionStore();
  const handlerByFunction = async (functionName: string) => {
    console.log('submit');
    try {
      const Selector = hash.getSelectorFromName(functionName);
      const transactions = [
        {
          contractAddress: account?.contractAddress,
          entrypoint: 'execute_own_dapp',
          calldata: [LegacyDapp!.classHash, Selector, []]
        }
      ];
      const response = await writeContract(account.publicKey, transactions);
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
  return (
    <Container>
      <TabBar title={'Legacy'} />
      <div className="py-4 mt-10">
        <div className={'text-center text-lg font-bold mb-10'}>
          <h2>Legacy Manage</h2>
        </div>
        <div className={'space-y-8 p-6 py-8 border rounded-xl'}>
          <div className={'text-muted-foreground text-center font-semibold'}>I want to set Legacy</div>

          <LegacySetting />

          <Button className={'w-full'} variant={'outline'} onClick={() => handlerByFunction('update_interaction_time')}>
            Update Active Time
          </Button>

          <Button className={'w-full'} variant={'destructive'} onClick={() => handlerByFunction('cancel_legacy')}>
            Cancel Legacy
          </Button>
        </div>

        <div className={'space-y-8 p-6 py-8 border rounded-xl mt-6'}>
          <div className={'text-muted-foreground text-center font-semibold'}>I&apos;m Legacy Receiver</div>

          <LegacyClaimModal />
        </div>
      </div>
    </Container>
  );
}
