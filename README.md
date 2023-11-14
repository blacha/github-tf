# blacha/github-tf

Managing the configuration of my github repositories using Github Actions and CDKTF

## Why ?

Because I have quite a few repos, it is hard to keep them all in sync with the latest github configuration settings.

## How ?

Using CDKTF, each repository is listed as a CDK construct that is then kept in sync with a state object in S3, so if I change the repo by hand it will automatically get re-deployed back to the configuration in code.

## Usage

This repository is very specific to [github.com/blacha](https://github.com/blacha), it could be forked and then configured for your own use. CDKTF needs a S3 state file so you need to configure access for your repository to S3.

The base cdktf command also uses the `gh` CLI for auth

```bash
npm install

npx cdktf diff

npx cdktf apply
```


### adding existing repositories

To add a existing repository first create the cdktf for the repo, then run a `npx cdktf synth`,

then using terraform perform a import inside the cdktf.out/stacks/:stackName folder

```bash
cd cdktf.out/stacks/github-tf/

terraform import github_repository.$1 $1
```