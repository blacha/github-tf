import { Repository, RepositoryConfig } from '@cdktf/provider-github/lib/repository';
import { RepositoryEnvironment } from '@cdktf/provider-github/lib/repository-environment';
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
