import { Construct } from 'constructs';

import { SquashMergeFlow } from '../squash.merge';

export function setupRepos(scope: Construct): void {
  new SquashMergeFlow(scope, 'github-tf', { description: 'Configure github using CDKTF', environments: ['prod'] });
  new SquashMergeFlow(scope, 'release-test', { environments: ['prod'] });

  new SquashMergeFlow(scope, 'chunkd', {
    description: 'Chunked file reading abstraction for S3, HTTP and files',
    pages: { source: { branch: 'gh-pages', path: '/' } },
  });
  new SquashMergeFlow(scope, 'cogeotiff', {
    description: 'High performance cloud optimized geotiff (COG) reader',
    pages: { source: { branch: 'gh-pages', path: '/' } },
  });
  new SquashMergeFlow(scope, 'binparse', {
    description: 'Typed binary parsing for typescript',
    pages: { source: { branch: 'gh-pages', path: '/' } },
  });

  new SquashMergeFlow(scope, 'pretty-json-log', { description: 'Pretty print json log files' });

  new SquashMergeFlow(scope, 'stac-spider', { description: 'Spider and process stac Catalog, Collections and Items' });
}
