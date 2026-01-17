import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigSchema } from 'src/config.schema';

@Injectable()
export class EnvService {
  constructor(private readonly configService: ConfigService<ConfigSchema>) {}

  get<T extends keyof ConfigSchema>(key: T): ConfigSchema[T] {
    return this.configService.get(key);
  }

  isDevelopment() {
    return this.get('NODE_ENV') === 'development';
  }
}
