/** @type {import('next').NextConfig} */
const nextConfig = {
    // async rewrites() {
    //     return [
    //         {
    //             source: '/starknet/:path*',
    //             destination: `http://localhost:4000/starknet/:path*`
    //         }
    //     ];
    // },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.starkscan.co',
        port: '',
        pathname: '/tokens/**',
      },
      {
        protocol: 'https',
        hostname: 'starkscan.co',
        port: '',
        pathname: '/img/**',
      }
    ],
  },
};

export default nextConfig;
