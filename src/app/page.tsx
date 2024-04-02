'use client';
import {Button} from "@/components/ui/button";
import {getPasskeyOptions} from "@/utils";
import {getAccountByPublicKey} from "@/core/account";
import {GlobalConfig} from "@/constants";
import {extractPublicKey} from "@/core/utils";
import {useRouter} from "next/navigation";

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
    <main className="min-h-screen p-24">
      <div className="text-center flex flex-col justify-center gap-6">
        <Button onClick={handleClick}>Create New Wallet</Button>
        <Button onClick={handleClick}>Login With Passkey</Button>
      </div>
    </main>
  );
}
