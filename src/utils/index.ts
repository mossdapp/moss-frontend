import { nanoid } from 'nanoid';

export const getPasskeyOptions = (name: string) => {
  return {
    challenge: Buffer.from(nanoid(20)),
    rp: {
      name: name,
      id: window.location.hostname
    },
    user: {
      id: Buffer.from(nanoid(16)),
      name: name,
      displayName: name
    },
    pubKeyCredParams: [
      {
        alg: -7,
        type: 'public-key' as const
      }
    ],
    timeout: 60000,
    excludeCredentials: [],
    authenticatorSelection: {
      authenticatorAttachment: 'platform' as const,
      requireResidentKey: true,
      residentKey: 'required' as const
    },
    extensions: {
      credProps: true
    }
  };
};

export function base64url_encode(buffer: ArrayBuffer): string {
  return btoa(Array.from(new Uint8Array(buffer), (b) => String.fromCharCode(b)).join(''))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function base64url_decode(value: string): ArrayBuffer {
  const m = value.length % 4;
  return Uint8Array.from(
    atob(
      value
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(value.length + (m === 0 ? 0 : 4 - m), '=')
    ),
    (c) => c.charCodeAt(0)
  ).buffer;
}
