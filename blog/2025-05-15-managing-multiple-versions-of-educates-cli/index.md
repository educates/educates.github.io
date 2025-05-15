---
slug: managing-multiple-versions-of-educates-cli
title: Managing educates versions with educatesenv
authors: [jorge]
tags: [educates, cli]
---

Managing multiple versions of the `educates` training platform binary can be a hassle—especially when you need to switch between versions for different projects, test new releases, or roll back to a previous version. Manual downloads, renaming, and path management are error-prone and time-consuming.

Enter `educatesenv`, a simple CLI tool to install, switch, and manage multiple versions of the `educates` CLI, inspired by tools like `tfenv` and `rbenv`.

<!-- truncate -->

---

## Why use educatesenv?

- **Easy version switching:** No more manual downloads or symlink juggling.
- **Safe experimentation:** Try new releases without losing your current setup.
- **Development mode:** Test local builds easily.
- **Cross-platform:** Works on Linux, macOS, and Windows.

---

## Getting started

Install `educatesenv` from [GitHub Releases](https://github.com/educates/educatesenv/releases).

Initialize your `edcuatesenv` environment:

```sh
educatesenv init --download
```

This will create default configuration file and folders in `.educatesenv` in your user's home's directory, and will show  you PATH instructions to have the tool ready to be used.

---

## Common tasks

### List remote versions

You can get a list of all available versions from GitHub:

```sh
educatesenv list-remote
```

You can also include pre-releases, which is convenient if you need to test a release candidate:

```sh
educatesenv list-remote --all
```

To show only the 10 most recent versions:

```sh
educatesenv list-remote --recents
```

### Install a specific version

Install a specific version:

```sh
educatesenv install 3.3.2
```

Or always get the latest released version available at the time:

```sh
educatesenv install latest
```

Installing a version doesn't make it readily available to use. For that there's another command (`use`) but you might want to do both actions at once.

Set the installed version as active immediately:

```sh
educatesenv install 3.3.2 --use
```

### List installed versions

You might end up having multiple versions installed. To find out what are the versions of Educates CLI you have locally installed, use:

```sh
educatesenv list
```

### Use a version

In order to switch between all your installed versions and make it the active one:

```sh
educatesenv use 3.3.2
```

### Uninstall a version

When you no longer need a specific version, and to keep your local computer free of old software, you can remove a version you no longer need:

```sh
educatesenv uninstall 3.3.2
```

### Bonus for Educates Developers

Educates developers might want to use the same mechanism to select the Educates CLI version they are using. They can enable in the configuration file development configuration:

You can see your configuration file by:

```sh
educatesenv confiv view
```

and add/edit these configuration snippet:

```yaml
development:
    enabled: true
    binaryLocation: /Users/USER/repositories/educates-training-platform/client-programs/bin/educates-darwin-arm64
```

Once you have done that, you can select the `develop` version from the list of available versions:

```sh
educatesenv use develop
```

**There's an additional configuration to provide a GitHub repository and token to get your educates binaries from a private repository**

---

## Conclusion

`educatesenv` makes it easy to manage multiple versions of the `educates` binary, so you can always work with the latest version you need. Try it out and simplify your workflow! 