import { BlockchainBlock } from '../types';

// Fast, zero-dependency pure SHA-256 implementation for ultra-low bandwidth / offline safety
export function sha256(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i: number, j: number;
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  let hash: number[] = [];
  let k: number[] = [];
  let primeCounter = 0;

  const isComposite: Record<number, boolean> = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 300; i += candidate) {
        isComposite[i] = true;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  ascii += '\x80';
  while ((ascii.length % 64) - 56) ascii += '\x00';
  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return '';
    words[i >> 2] |= j << ((3 - (i % 4)) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;

  for (j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15],
        w2 = w[i - 2];
      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const s0Hash = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const s1Hash = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);

      const t1 =
        hash[7] +
        s1Hash +
        ch +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] + s0 + w[i - 7] + s1) | 0);
      const t2 = s0Hash + maj;

      hash = [(t1 + t2) | 0].concat(hash);
      hash[4] = (hash[4] + t1) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

export function createGenesisBlock(): BlockchainBlock {
  const timestamp = '2026-09-01T00:00:00.000Z';
  const data = {
    operation: 'GENESIS' as const,
    payload: {
      network: 'KuvaPlus Decentralized Ledger',
      standard: 'SHA-256 Ledger v2.1',
      nodes: ['Ganvent-Core', 'Lokoo-Registry', 'FinaPartner-Vault'],
      security: 'Anti-tamper cryptographic chain',
    },
  };
  const blockString = `00${timestamp}${JSON.stringify(data)}0`;
  const hash = sha256(blockString);

  return {
    index: 0,
    timestamp,
    data,
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    hash,
    nonce: 0,
  };
}

export function calculateBlockHash(
  index: number,
  previousHash: string,
  timestamp: string,
  data: any,
  nonce: number
): string {
  return sha256(`${index}${previousHash}${timestamp}${JSON.stringify(data)}${nonce}`);
}

export function mineBlock(
  previousBlock: BlockchainBlock,
  payload: Record<string, any>,
  operation: BlockchainBlock['data']['operation'] = 'TRANSACTION'
): BlockchainBlock {
  const index = previousBlock.index + 1;
  const timestamp = new Date().toISOString();
  const data = { operation, payload };

  let nonce = 0;
  let hash = '';
  const difficulty = 2;
  const prefix = '0'.repeat(difficulty);

  do {
    nonce++;
    hash = calculateBlockHash(index, previousBlock.hash, timestamp, data, nonce);
  } while (!hash.startsWith(prefix) && nonce < 10000);

  return {
    index,
    timestamp,
    data,
    previousHash: previousBlock.hash,
    hash,
    nonce,
  };
}

export function verifyChainIntegrity(chain: BlockchainBlock[]): boolean {
  if (!chain || chain.length === 0) return false;

  for (let i = 1; i < chain.length; i++) {
    const currentBlock = chain[i];
    const previousBlock = chain[i - 1];

    const recomputedHash = calculateBlockHash(
      currentBlock.index,
      currentBlock.previousHash,
      currentBlock.timestamp,
      currentBlock.data,
      currentBlock.nonce
    );

    if (currentBlock.hash !== recomputedHash) {
      return false;
    }

    if (currentBlock.previousHash !== previousBlock.hash) {
      return false;
    }
  }

  return true;
}

export class KuvaBlockchain {
  public chain: BlockchainBlock[] = [];
  private difficulty: number = 2;

  constructor(existingChain?: BlockchainBlock[]) {
    if (existingChain && existingChain.length > 0) {
      this.chain = existingChain;
    } else {
      this.chain = [createGenesisBlock()];
    }
  }

  public getLatestBlock(): BlockchainBlock {
    return this.chain[this.chain.length - 1];
  }

  public calculateBlockHash(
    index: number,
    previousHash: string,
    timestamp: string,
    data: any,
    nonce: number
  ): string {
    return calculateBlockHash(index, previousHash, timestamp, data, nonce);
  }

  public addBlock(operation: BlockchainBlock['data']['operation'], payload: Record<string, any>): BlockchainBlock {
    const previousBlock = this.getLatestBlock();
    const newBlock = mineBlock(previousBlock, payload, operation);
    this.chain.push(newBlock);
    return newBlock;
  }

  public verifyIntegrity(): { isValid: boolean; brokenBlockIndex: number; message: string } {
    const isValid = verifyChainIntegrity(this.chain);
    return {
      isValid,
      brokenBlockIndex: isValid ? -1 : 1,
      message: isValid
        ? `Cadena válida y sellada con éxito. Todos los ${this.chain.length} bloques están íntegros.`
        : '¡Alerta! Ruptura detectada en la cadena de bloques.',
    };
  }
}
