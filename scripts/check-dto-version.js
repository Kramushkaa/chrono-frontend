#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

const dtoDescriptorsPath = path.resolve(__dirname, '../src/shared/dto/dtoDescriptors.ts');

try {
  // Читаем скопированный файл
  if (!fs.existsSync(dtoDescriptorsPath)) {
    throw new Error(`DTO descriptors file not found at ${dtoDescriptorsPath}`);
  }

  const content = fs.readFileSync(dtoDescriptorsPath, 'utf8');
  const dtoVersionMatch = content.match(/export const DTO_VERSION = ["']([^"']+)["']/);
  
  if (!dtoVersionMatch) {
    throw new Error('DTO_VERSION not found in dtoDescriptors.ts');
  }

  const DTO_VERSION = dtoVersionMatch[1];
  
  // Пытаемся получить версию из package.json бэка (опционально)
  let version = 'unknown';
  try {
    const backendPkgPath = path.resolve(__dirname, '../../chronoline-backend-only/shared-dto/package.json');
    if (fs.existsSync(backendPkgPath)) {
      const pkg = require(backendPkgPath);
      version = pkg.version;
    }
  } catch {
    // Игнорируем, если не можем прочитать версию
  }

  console.log(`✅ DTO ready${version !== 'unknown' ? ` v${version}` : ''} (DTO_VERSION=${DTO_VERSION})`);
} catch (error) {
  console.error('❌ Не удалось загрузить DTO descriptors');
  console.error('   Убедитесь, что пакет shared-dto собран и файлы скопированы во фронтенд.');
  console.error(`   Details: ${error.message}`);
  process.exit(1);
}

