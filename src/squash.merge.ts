import { ActionsEnvironmentSecret } from '@cdktf/provider-github/lib/actions-environment-secret';
import { Repository, RepositoryConfig, RepositoryPages } from '@cdktf/provider-github/lib/repository';
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
  description?: string;
  pages?: RepositoryPages;
  environments?: Partial<Record<GithubEnvNames, GithubEnvConfig>>;
}

export type GithubEnvNames = 'prod' | 'preprod' | 'nonprod';
export type GithubEnvConfig = { secrets?: Record<string, string> };

export class SquashMergeFlow {
  repository: Repository;
  id: string;
  environments: Partial<Record<GithubEnvNames, RepositoryEnvironment>> = {};

  constructor(scope: Construct, id: string, cfg?: SquashMergeFlowOptions) {
    this.id = id;

    this.repository = new Repository(scope, id, {
      ...DefaultFeatures,
      ...FlowSquashMerge,
      name: id,
      description: cfg?.description,
      pages: cfg?.pages,
      visibility: 'public',
    });

    for (const [envName, config] of Object.entries(cfg?.environments ?? {})) {
      const environment = new RepositoryEnvironment(scope, `${id}-${envName}`, {
        environment: envName,
        repository: this.repository.name,
      });
      this.environments[envName as GithubEnvNames] = environment;

      for (const [key, value] of Object.entries(config.secrets ?? {})) {
        new ActionsEnvironmentSecret(scope, `${id}-${envName}-${key.toLowerCase()}`, {
          environment: envName,
          repository: this.repository.name,
          secretName: key,
          plaintextValue: value,
        });
      }
    }
  }
}
