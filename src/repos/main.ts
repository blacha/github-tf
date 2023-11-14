import { Construct } from 'constructs';

import { SquashMergeFlow } from '../squash.merge';

export function setupRepos(scope: Construct): void {
  new SquashMergeFlow(scope, 'github-tf', { description: 'Configure github using CDKTF', environments: ['prod'] });
  new SquashMergeFlow(scope, 'release-test', { environments: ['prod'] });

  new SquashMergeFlow(scope, 'chunkd', { description: 'Chunked file reading abstraction for S3, HTTP and files' });
  new SquashMergeFlow(scope, 'cogeotiff', {
    description: 'High performance cloud optimized geotiff (COG) reader',
  });
  new SquashMergeFlow(scope, 'binparse', { description: 'Typed binary parsing for typescript' });
  new SquashMergeFlow(scope, 'pretty-json-log', { description: 'Pretty print json log files' });
}
