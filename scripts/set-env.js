const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');
const envExamplePath = path.join(rootDir, '.env.example');

let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
} else if (fs.existsSync(envExamplePath)) {
  envContent = fs.readFileSync(envExamplePath, 'utf8');
}

const envVars = {};
envContent.split('\n').forEach((line) => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.substring(0, eqIdx).trim();
      let val = trimmed.substring(eqIdx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.substring(1, val.length - 1);
      }
      envVars[key] = val;
    }
  }
});

const apiBaseUrl = process.env.API_BASE_URL || envVars.API_BASE_URL || 'http://localhost:10006';

const targetDevPath = path.join(rootDir, 'src', 'environments', 'environment.ts');
const targetProdPath = path.join(rootDir, 'src', 'environments', 'environment.prod.ts');

const devConfigFile = `export const environment = {
  production: false,
  apiBaseUrl: '${apiBaseUrl}',
};
`;

const prodConfigFile = `export const environment = {
  production: true,
  apiBaseUrl: '${apiBaseUrl}',
};
`;

fs.writeFileSync(targetDevPath, devConfigFile, 'utf8');
fs.writeFileSync(targetProdPath, prodConfigFile, 'utf8');

console.log(`[set-env] Generated environment files with apiBaseUrl: ${apiBaseUrl}`);
