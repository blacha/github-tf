import { DataGithubUser } from '@cdktf/provider-github/lib/data-github-user';
import { GithubProvider } from '@cdktf/provider-github/lib/provider';
import { App, S3Backend, TerraformOutput, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';

import { setupRepos } from './repos/main';

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

const app = new App();
new GithubConfig(app, 'github-tf');
app.synth();
