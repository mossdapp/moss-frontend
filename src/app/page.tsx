'use client';

import {GlobalConfig} from "@/constants";
import {redirect} from "next/navigation";
import {useLocalStorage} from "react-use";
import {useEffect} from "react";

export default function Home() {
  const [data] = useLocalStorage(GlobalConfig.mossWalletKey, null);

  useEffect(() => {
    redirect(data ? '/wallet' : '/create')
  }, [data])


  return null;
}
