import DexImg from '@/assets/Dex.webp';
import LegacyImg from '@/assets/legacy.webp';
import NFTManageImg from '@/assets/NFTMANAGE.webp';
import NFTMarketImg from '@/assets/NFTMarket.webp';
import SocialTagImg from '@/assets/SocialTag.webp';
import TokenManageImg from '@/assets/TokenManage.webp';


export const GlobalConfig = {
    mossWalletKey: 'moss:wallet',
    alchemyAPI: 'https://starknet-sepolia.g.alchemy.com/v2/GQYPecngmX2a1VBVYq2V9hL3FIMFqoHk'
}


export const TokenUrlMap = {
    'ETH': 'https://static.starkscan.co/tokens/0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7/icons/QmYAUqoZHtjckYmKqwTkPMuWcGnCgwG8SBuMi1XPXqaf3q',
    'USDT': 'https://static.starkscan.co/tokens/0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8/icons/QmdUshyLUMRgwy6Wirj6r3dwQsUddmrG2tVVfPXN8XfCjd',
    'STRK': 'https://static.starkscan.co/tokens/0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d/icons/QmRBHe2LVqHWsCDajGYT5jGDpSicbq4W68bSTEfJWow4Lg',
    'ERC20': 'https://starkscan.co/img/addressbook/no-logo-token.png'
}

export const DappList = [
    {
        name: 'Dex',
        icon: DexImg.src,
    },
    {
        name: 'Legacy',
        icon: LegacyImg.src,
    },
    {
        name: 'NFTManage',
        icon: NFTManageImg.src,
    },
    {
        name: 'NFTMarket',
        icon: NFTMarketImg.src,
    },
    {
        name: 'SocialTag',
        icon: SocialTagImg.src,
    },
    {
        name: 'TokenManage',
        icon: TokenManageImg.src,
    }
]