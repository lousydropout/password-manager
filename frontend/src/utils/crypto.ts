async function encrypt(
  plaintext: string,
  secretKey: string,
): Promise<{ iv: string; encryptedText: string }> {
  // Convert the secret key to a valid 256-bit (32-byte) key
  secretKey = adjustSecretKey(secretKey, 32)

  const iv = new Uint8Array(16) // AES block size is 128 bits (16 bytes)
  crypto.getRandomValues(iv)

  const secretKeyArrayBuffer = hexStringToArrayBuffer(secretKey)

  const algorithm = { name: 'AES-CBC', iv }
  const key = await crypto.subtle.importKey('raw', secretKeyArrayBuffer, 'AES-CBC', false, [
    'encrypt',
  ])
  const encodedText = new TextEncoder().encode(plaintext)

  const encryptedBuffer = await crypto.subtle.encrypt(algorithm, key, encodedText)
  const encryptedText = btoa(String.fromCharCode(...Array.from(new Uint8Array(encryptedBuffer))))

  return {
    iv: Array.from(iv)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join(''),
    encryptedText,
  }
}

async function decrypt(ciphertext: string, iv: string, secretKey: string): Promise<string> {
  // Convert the secret key to a valid 256-bit (32-byte) key
  secretKey = adjustSecretKey(secretKey, 32)

  const ivUint8 = new Uint8Array(iv.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)))
  const algorithm = { name: 'AES-CBC', iv: ivUint8 }
  const key = await crypto.subtle.importKey(
    'raw',
    hexStringToArrayBuffer(secretKey),
    'AES-CBC',
    false,
    ['decrypt'],
  )

  const encryptedBuffer = new Uint8Array(Array.from(atob(ciphertext), (c) => c.charCodeAt(0)))
  const decryptedBuffer = await crypto.subtle.decrypt(algorithm, key, encryptedBuffer)
  const decryptedText = new TextDecoder().decode(decryptedBuffer)

  return decryptedText
}

function hexStringToArrayBuffer(hexString: string): ArrayBuffer {
  const arrayBuffer = new ArrayBuffer(hexString.length / 2)
  const uint8Array = new Uint8Array(arrayBuffer)

  for (let i = 0; i < hexString.length; i += 2) {
    uint8Array[i / 2] = parseInt(hexString.slice(i, i + 2), 16)
  }

  return arrayBuffer
}

function adjustSecretKey(secretKey: string, targetLength: number): string {
  // Pad or truncate the secretKey to the target length
  if (secretKey.length < targetLength * 2) {
    // Pad with zeros on the right
    while (secretKey.length < targetLength * 2) {
      secretKey += '00'
    }
  } else if (secretKey.length > targetLength * 2) {
    // Truncate to the target length
    secretKey = secretKey.slice(0, targetLength * 2)
  }

  return secretKey
}

export { decrypt, encrypt }
