import { DocumentBuilder } from '@nestjs/swagger';
import { readFileSync } from 'fs';
import { join } from 'path';
import { APP_CONFIG } from './app.config';

const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../..', 'package.json'), 'utf8'),
);

export const openApiConfig = new DocumentBuilder()
  .setTitle(APP_CONFIG.NAME)
  .setDescription('CertChain API description')
  .setVersion(packageJson.version)
  .addServer('http://localhost:4000', 'Local')
  .addServer('https://api.certchain.co', 'Production')
  .addBearerAuth()
  .build();
