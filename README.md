# Install [Chamber][chamber] action

![Release version][badge_release_version]
[![License][badge_license]][link_license]

This action installs [Chamber][chamber] (AWS SSM Parameter Store CLI by Segment) as a binary file into your workflow. It can be run on **Linux** (`ubuntu-latest`), **macOS** (`macos-latest`) or **Windows** (`windows-latest`).

- Chamber releases page: <https://github.com/segmentio/chamber/releases>

Additionally, this action uses the GitHub **caching mechanism** to speed up your workflow execution time!

## Usage

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: allixsenos/install-chamber@v1
        #with:
        #  version: 3.1.5 # `latest` by default, but you can set a specific version to install

      - run: chamber version # any chamber command can be executed
```

## Customizing

### Inputs

The following inputs can be used as `step.with` keys:

| Name      |   Type   | Default  | Required | Description              |
|-----------|:--------:|:--------:|:--------:|--------------------------|
| `version` | `string` | `latest` |    no    | Chamber version to install |

### Outputs

| Name          |   Type   | Description                   |
|---------------|:--------:|-------------------------------|
| `chamber-bin` | `string` | Path to the Chamber binary file |

## Releasing

To release a new version:

- Build the action distribution (`make build` or `npm run build`).
- Commit and push changes (including `dist` directory changes - this is important) to the `master` branch.
- Publish the new release using the repo releases page (the git tag should follow the `vX.Y.Z` format).

## Support

[![Issues][badge_issues]][link_issues]
[![Pull Requests][badge_pulls]][link_pulls]

If you find any errors in the action, please [create an issue][link_create_issue] in this repository.

## License

This is open-source software licensed under the [MIT License][link_license].

[badge_release_version]:https://img.shields.io/github/release/allixsenos/install-chamber.svg?maxAge=30
[badge_license]:https://img.shields.io/github/license/allixsenos/install-chamber.svg?longCache=true
[badge_issues]:https://img.shields.io/github/issues/allixsenos/install-chamber.svg?maxAge=45
[badge_pulls]:https://img.shields.io/github/issues-pr/allixsenos/install-chamber.svg?maxAge=45

[link_license]:https://github.com/allixsenos/install-chamber/blob/master/LICENSE
[link_issues]:https://github.com/allixsenos/install-chamber/issues
[link_create_issue]:https://github.com/allixsenos/install-chamber/issues/new
[link_pulls]:https://github.com/allixsenos/install-chamber/pulls

[chamber]:https://github.com/segmentio/chamber
