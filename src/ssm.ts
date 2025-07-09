import { SSM } from '@aws-sdk/client-ssm';
import type { ActionsEnvironmentSecret } from '@cdktf/provider-github/lib/actions-environment-secret/index.js';

const ArnPrefix = 'arn:aws:ssm:ap-southeast-2:938805226638:parameter';

const SsmToFetch = new Set<string>();

function replaceSecret(secret: ActionsEnvironmentSecret, values: Map<string, string>): boolean {
  const secretInternal = secret as unknown as { _plaintextValue: string };
  const plainTextValue = secretInternal._plaintextValue;

  if (!plainTextValue.startsWith('__SSM__')) return false;
  const ssmArn = plainTextValue.replace('__SSM__', '');
  const newValue = values.get(ssmArn);
  if (newValue == null) throw new Error(`Unable to find secret: ${ssmArn}`);
  console.log('ReplaceSecret', JSON.stringify({ id: secret.node.id, name: secret.secretNameInput, arn: ssmArn }));
  /// TODO we should encrypt these secrets
  secretInternal._plaintextValue = newValue;
  return true;
}

function secretFromArn(arn: string): string {
  SsmToFetch.add(arn);
  return `__SSM__${arn}`;
}

async function fetchAll(): Promise<Map<string, string>> {
  const output = new Map();
  if (SsmToFetch.size === 0) return output;

  const ssm = new SSM({ region: 'ap-southeast-2' });

  console.log('FetchingSecrets', [...SsmToFetch.values()]);

  const parameters = await ssm.getParameters({
    Names: [...SsmToFetch.values()].map((f) => {
      if (!f.startsWith(ArnPrefix)) {
        throw new Error('Fetching from seperate accounts not yet supported');
      }
      return f.slice(ArnPrefix.length);
    }),
    WithDecryption: true,
  });

  for (const param of parameters?.Parameters ?? []) {
    if (param.ARN == null || param.Value == null) continue;
    output.set(param.ARN, param.Value);
  }

  if (output.size !== SsmToFetch.size) throw new Error('Failed to fetch all parameters');
  return output;
}

export const SsmUtil = {
  fetchAll,
  secretFromArn,
  replaceSecret,
};
