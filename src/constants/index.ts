import DexImg from '@/assets/Dex.webp';
import LegacyImg from '@/assets/legacy.webp';
import NFTManageImg from '@/assets/NFTMANAGE.webp';
import NFTMarketImg from '@/assets/NFTMarket.webp';
import SocialTagImg from '@/assets/SocialTag.webp';
import TokenManageImg from '@/assets/TokenManage.webp';

export const ENVS = {
  ACCOUNT_CLASS_HASH: process.env.NEXT_PUBLIC_ACCOUNT_CLASS_HASH as string
};

//https://starknet-sepolia.public.blastapi.io
export const GlobalConfig = {
  mossWalletKey: 'moss:wallet',
  alchemyAPI: 'https://starknet-sepolia.g.alchemy.com/v2/GQYPecngmX2a1VBVYq2V9hL3FIMFqoHk',
  blastAPI: 'https://starknet-mainnet.public.blastapi.io', //TODO
  scanUrl: 'https://sepolia.starkscan.co/tx/',
  RPCURL: 'https://starknet-sepolia.g.alchemy.com/v2/GQYPecngmX2a1VBVYq2V9hL3FIMFqoHk'
};

export const TokenUrlMap = {
  ETH: 'https://static.starkscan.co/tokens/0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7/icons/QmYAUqoZHtjckYmKqwTkPMuWcGnCgwG8SBuMi1XPXqaf3q',
  USDT: 'https://static.starkscan.co/tokens/0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8/icons/QmdUshyLUMRgwy6Wirj6r3dwQsUddmrG2tVVfPXN8XfCjd',
  STRK: 'https://static.starkscan.co/tokens/0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d/icons/QmRBHe2LVqHWsCDajGYT5jGDpSicbq4W68bSTEfJWow4Lg',
  ERC20: 'https://starkscan.co/img/addressbook/no-logo-token.png'
};

export const DappList = [
  // {
  //     name: 'Dex',
  //     icon: DexImg.src,
  // },
  {
    name: 'Legacy',
    icon: LegacyImg.src,
    classHash: '0x07a48c905bfacb96fd20cfe57f5092d5396cdde0a48cd645a8215dc924c62ba1',
    path: '/ownapp/legacy'
  },
  {
    name: 'NFTManage',
    icon: NFTManageImg.src,
    classHash: '0x052144d89fb1c3ed153a048c7795999172ce953062ff181353469ad46ded015f',
    path: '/ownapp/nft_manage'
  },
  {
    name: 'NFTMarket',
    icon: NFTMarketImg.src,
    classHash: '0x016c18999acfb988bbb58187ba926e62920981993acc82229a825dad253ef24c',
    path: '/ownapp/nft_market'
  },
  {
    name: 'SocialTag',
    icon: SocialTagImg.src,
    classHash: '0x008343ff1b5f03167899f6d9020720e16492d0d1eefc5026f9d12a0de0c3ef71',
    path: '/ownapp/tag'
  },
  {
    name: 'TokenManage',
    icon: TokenManageImg.src,
    classHash: '0x032093a8d8e0a79801d1e2320e306e1334b5dda28bff3129797ce9fbd9209d26',
    path: '/ownapp/token_manage'
  }
];
