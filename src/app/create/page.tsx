'use client';
import { Button } from '@/components/ui/button';
import { getPasskeyOptions } from '@/utils';
import { getAccountByPublicKey } from '@/core/account';
import { GlobalConfig } from '@/constants';
import { extractPublicKey } from '@/core/utils';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/Container';
import logoImg from '@/assets/moss.png';
import { Modal } from '@/components/Modal';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const CreateWalletModal = ({ onConfirm }: { onConfirm: (v: string) => void }) => {
  const [name, setName] = useState('');
  return (
    <Modal
      confirmButtonProps={{
        disabled: !name
      }}
      onConfirm={() => {
        onConfirm(name);
      }}
      header={'Create Wallet'}
      trigger={<Button className={'w-full'}>Create New Wallet</Button>}
    >
      <div className={'space-y-6'}>
        <div className="space-y-2">
          <Label>Wallet Name</Label>
          <Input placeholder={'Wallet Name'} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      </div>
    </Modal>
  );
};

export default function Home() {
  const router = useRouter();

  const handleCreate = async (name: string) => {
    try {
      const options = getPasskeyOptions(name);
      console.log(options);
      const cred = await navigator.credentials.create({
        publicKey: options
      });
      // const cred = await startRegistration(options);
      console.log(cred);
      const publicKey = extractPublicKey((cred as any).response.getPublicKey()) as string;
      const account = getAccountByPublicKey(publicKey);

      console.log(account);
      localStorage.setItem(
        GlobalConfig.mossWalletKey,
        JSON.stringify({
          ...cred,
          account,
          options
        })
      );

      router.push('/wallet');
      // const verification = await verifyAuthenticationResponse({
      //   response: cred,
      //   expectedChallenge: options.challenge.toString(),
      //   expectedOrigin: origin,
      //   expectedRPID: options.rp.id,
      //   // authenticator,
      // });
      // console.log(verification)
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <Container>
      <div className={'h-[85vh] text-center flex flex-col items-center justify-center gap-6 '}>
        <img src={logoImg.src} className={'w-12 h-12 absolute left-5 top-5'} alt="" />
        <div className={'mb-8'}>
          <h1 className="text-4xl font-bold">
            Welcome to{' '}
            <span className={'bg-clip-text text-transparent bg-gradient-to-b from-[#FF72E1] to-[#F54C7A]'}>Moss</span>
          </h1>
          <p className="text-lg text-gray-500 mt-4">one-click to unlock web3</p>
        </div>
        <CreateWalletModal onConfirm={handleCreate} />
        <Button
          onClick={() => {
            console.log('login with passkey');
            alert('wait for implementation');
          }}
          className={'w-full'}
        >
          Login With Passkey
        </Button>
      </div>
    </Container>
  );
}
