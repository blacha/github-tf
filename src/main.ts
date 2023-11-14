import { DataGithubUser } from '@cdktf/provider-github/lib/data-github-user';
import { GithubProvider } from '@cdktf/provider-github/lib/provider';
import { Repository, RepositoryConfig } from '@cdktf/provider-github/lib/repository';
import { RepositoryEnvironment } from '@cdktf/provider-github/lib/repository-environment';
import { App, S3Backend, TerraformOutput, TerraformStack } from 'cdktf';
import { Construct } from 'constructs';

const FlowSquashMerge: Partial<RepositoryConfig> = {
  allowMergeCommit: false,
  allowRebaseMerge: false,

  allowSquashMerge: true,
  squashMergeCommitMessage: 'PR_BODY',
  squashMergeCommitTitle: 'PR_TITLE',

  deleteBranchOnMerge: true,
};

const DefaultFeatures: Partial<RepositoryConfig> = {
  hasProjects: false,
  hasWiki: false,
  hasDiscussions: false,
  hasIssues: true,
};

function getOrThrow(key: string): string {
  const val = process.env[key];
  if (val == null || val.trim() === '') throw new Error('Missing $' + key);
  return val;
}

export interface SquashMergeFlowOptions {
  environments?: ('prod' | 'preprod' | 'nonprod')[];
  description?: string;
}

export class SquashMergeFlow {
  repository: Repository;
  id: string;

  constructor(scope: Construct, id: string, cfg?: SquashMergeFlowOptions) {
    this.id = id;

    this.repository = new Repository(scope, id, {
      ...DefaultFeatures,
      ...FlowSquashMerge,
      name: id,
      description: cfg?.description,
      visibility: 'public',
    });

    cfg?.environments?.forEach((env) => {
      new RepositoryEnvironment(scope, `${id}-env-${env}`, {
        environment: env,
        repository: this.repository.name,
      });
    });
  }
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

    new SquashMergeFlow(this, 'github-tf', { description: 'Configure github using CDKTF', environments: ['prod'] });
    new SquashMergeFlow(this, 'release-test', { environments: ['prod'] });

    new SquashMergeFlow(this, 'chunkd', { description: '"Chunked file reading abstraction for S3, HTTP and files' });
    new SquashMergeFlow(this, 'cogeotiff', {
      description: 'High performance cloud optimized geotiff (COG) reader',
    });
    new SquashMergeFlow(this, 'binparse', { description: 'Typed binary parsing for typescript' });
    new SquashMergeFlow(this, 'pretty-json-log', { description: 'Pretty print json log files' });

    const currentUser = new DataGithubUser(this, 'current', { username: '' });
    new TerraformOutput(this, 'current-user', { value: currentUser.name });
  }
}

const app = new App();
new GithubConfig(app, 'github-tf');
app.synth();
