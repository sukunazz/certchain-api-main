import { createHash } from 'crypto';

export const generateRedisKey = (
  prefix: string,
  ...parts: string[]
): string => {
  const key = [prefix, ...parts].join(':');
  return `${prefix}:${createHash('md5').update(key).digest('hex')}`;
};

export const matchRedisKey = (generatedKey: string): string => {
  const [prefix, hash] = generatedKey.split(':');
  return `${prefix}:${hash}`;
};
