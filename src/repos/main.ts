import { Construct } from 'constructs';

import { SquashMergeFlow } from '../squash.merge';
import { SsmUtil } from '../ssm';

export function setupRepos(scope: Construct): void {
  new SquashMergeFlow(scope, 'github-tf', {
    description: 'Configure github using CDKTF',
    environments: {
      prod: {
        secrets: {
          PAT: SsmUtil.secretFromArn('arn:aws:ssm:ap-southeast-2:938805226638:parameter/github/prod/github_pat'),
          AWS_ROLE_ARN: SsmUtil.secretFromArn(
            'arn:aws:ssm:ap-southeast-2:938805226638:parameter/github/prod/github-tf/aws_role_arn',
          ),
          BUCKET_NAME: SsmUtil.secretFromArn(
            'arn:aws:ssm:ap-southeast-2:938805226638:parameter/github/prod/github-tf/bucket_name',
          ),
        },
      },
    },
  });
  new SquashMergeFlow(scope, 'release-test', { environments: { prod: {} } });

  new SquashMergeFlow(scope, 'chunkd', {
    description: 'Chunked file reading abstraction for S3, HTTP and files',
    pages: { source: { branch: 'gh-pages', path: '/' } },
    environments: {
      prod: {
        secrets: {
          NPM_TOKEN: SsmUtil.secretFromArn('arn:aws:ssm:ap-southeast-2:938805226638:parameter/github/prod/npm_token'),
        },
      },
    },
  });
  new SquashMergeFlow(scope, 'cogeotiff', {
    description: 'High performance cloud optimized geotiff (COG) reader',
    pages: { source: { branch: 'gh-pages', path: '/' } },
    environments: {
      prod: {
        secrets: {
          NPM_TOKEN: SsmUtil.secretFromArn('arn:aws:ssm:ap-southeast-2:938805226638:parameter/github/prod/npm_token'),
        },
      },
    },
  });
  new SquashMergeFlow(scope, 'binparse', {
    description: 'Typed binary parsing for typescript',
    pages: { source: { branch: 'gh-pages', path: '/' } },
    environments: {
      prod: {
        secrets: {
          NPM_TOKEN: SsmUtil.secretFromArn('arn:aws:ssm:ap-southeast-2:938805226638:parameter/github/prod/npm_token'),
        },
      },
    },
  });

  new SquashMergeFlow(scope, 'pretty-json-log', {
    description: 'Pretty print json log files',
    environments: {
      prod: {
        secrets: {
          NPM_TOKEN: SsmUtil.secretFromArn('arn:aws:ssm:ap-southeast-2:938805226638:parameter/github/prod/npm_token'),
        },
      },
    },
  });

  new SquashMergeFlow(scope, 'stac-spider', { description: 'Spider and process stac Catalog, Collections and Items' });
}
