import { GithubProvider } from '@cdktf/provider-github/lib/provider';
import { Repository, RepositoryConfig } from '@cdktf/provider-github/lib/repository';
import { App, S3Backend, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';

const DefaultSettings: Partial<RepositoryConfig> = {
  allowMergeCommit: false,
  allowRebaseMerge: false,
};

class GithubConfig extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Connect to github, reads GITHUB_TOKEN from env
    new GithubProvider(this, 'GitHub', {
      owner: 'blacha',
    });

    new S3Backend(this, {
      bucket: process.env['BUCKET_NAME'] ?? '',
      key: 'github-tf.tfstate',
      region: 'us-east-1',
    });

    const repo = new Repository(this, 'github-tf', {
      name: 'github-tf',
      visibility: 'private',

      ...DefaultSettings,
    });

    repo.allowMergeCommit = false;
  }
}

const app = new App();
new GithubConfig(app, 'github-tf');
app.synth();
