'use client';
import {Button} from "@/components/ui/button";
import {getPasskeyOptions} from "@/utils";
import {getAccountByPublicKey} from "@/core/account";
import {GlobalConfig} from "@/constants";
import {extractPublicKey} from "@/core/utils";
import {useRouter} from "next/navigation";
import {Container} from "@/components/Container";

export default function Home() {

  const router = useRouter();

  const handleClick = async () => {
    try {
      const options = getPasskeyOptions();
      console.log(options)
      const cred = await navigator.credentials.create({
        publicKey: options
      });
      // const cred = await startRegistration(options);
      console.log(cred);
      const publicKey = extractPublicKey((cred as any).response.getPublicKey()) as string;
      const account = getAccountByPublicKey(publicKey);

      console.log(account)
      localStorage.setItem(GlobalConfig.mossWalletKey, JSON.stringify({
        ...cred,
        account,
        options
      }));

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
  }
  return (
      <Container>
        <div className={'h-full text-center flex flex-col items-center justify-center gap-6 '}>
          <div className={'mb-8'}>
            <h1 className="text-4xl font-bold text-primary">Welcome to Moss</h1>
            <p className="text-lg text-gray-500 mt-4">A decentralized identity wallet</p>
          </div>
          <Button onClick={handleClick} className={'w-full'}>Create New Wallet</Button>
          <Button onClick={handleClick} className={'w-full'}>Login With Passkey</Button>
        </div>
      </Container>
  );
}
