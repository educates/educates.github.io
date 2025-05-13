---
sidebar_position: 4
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Installing the Educates CLI

Next, we are going to install the Educates CLI from the available release binaries
[on GitHub](https://github.com/educates/educates-training-platform/releases).

<Tabs>
<TabItem value="linux" label="Linux" default>
    ``` sh
    # For AMD64 / x86_64
    [ $(uname -m) = x86_64 ] && curl -sSLo educates https://github.com/educates/educates-training-platform/releases/latest/download/educates-linux-amd64
    # For ARM64
    [ $(uname -m) = aarch64 ] && curl -sSLo educates https://github.com/educates/educates-training-platform/releases/latest/download/educates-linux-arm64
    chmod +x educates
    sudo mv educates /usr/local/bin/educates
    ```
</TabItem>
<TabItem value="macos" label="MacOS">
    ``` sh
    # For AMD64 / x86_64
    [ $(uname -m) = x86_64 ] && curl -sSLo educates https://github.com/educates/educates-training-platform/releases/latest/download/educates-darwin-amd64
    # For ARM64
    [ $(uname -m) = arm64 ] && curl -sSLo educates https://github.com/educates/educates-training-platform/releases/latest/download/educates-darwin-arm64
    chmod +x educates
    sudo mv educates /usr/local/bin/educates
    ```
</TabItem>
</Tabs>

## Testing the Educates CLI

To test if the installation of the Educates CLI has been successful, spin up a terminal and run the following command:

```sh title="Testing the Educates CLI"
educates version
```

The output should look like this:

```{ .text .no-copy title="Output" }
educates version

3.3.2
```
