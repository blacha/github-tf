import { ActionsEnvironmentSecret } from '@cdktf/provider-github/lib/actions-environment-secret/index.js';
import { DataGithubUser } from '@cdktf/provider-github/lib/data-github-user/index.js';
import { GithubProvider } from '@cdktf/provider-github/lib/provider/index.js';
import { App, S3Backend, TerraformOutput, TerraformStack } from 'cdktf';
import type { Construct } from 'constructs';

import { setupRepos } from './repos/main.ts';
import { SsmUtil } from './ssm.ts';

function getOrThrow(key: string): string {
  const val = process.env[key];
  if (val == null || val.trim() === '') throw new Error('Missing $' + key);
  return val;
}

class GithubConfig extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Connect to github, reads GitHubCLI/GITHUB_TOKEN from env
    new GithubProvider(this, 'GitHub', { owner: 'blacha' });

    new S3Backend(this, {
      bucket: getOrThrow('BUCKET_NAME'),
      key: 'github-tf.tfstate',
      region: 'us-east-1',
    });

    setupRepos(this);

    const currentUser = new DataGithubUser(this, 'current', { username: '' });
    new TerraformOutput(this, 'current-user', { value: currentUser.name });
  }
}

/** Fetch SSM parameters and replace them in the configured secrets */
async function replaceSecrets(gh: GithubConfig): Promise<void> {
  const nodes = gh.node.findAll().filter((f) => f instanceof ActionsEnvironmentSecret);
  const values = await SsmUtil.fetchAll();
  for (const node of nodes) SsmUtil.replaceSecret(node, values);
}

async function main(): Promise<void> {
  const app = new App();
  const gh = new GithubConfig(app, 'github-tf');

  await replaceSecrets(gh);
  app.synth();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
