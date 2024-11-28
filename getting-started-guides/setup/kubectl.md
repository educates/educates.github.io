---
sidebar_position: 3
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Installing kubectl

Next, we are going to install [kubectl](https://kubernetes.io/docs/reference/kubectl/),
the official Kubernetes CLI.

Despite the Educates CLI wrapping most of the needed functionality to interact with our
dedicated Educates cluster later-on, `kubectl` will come in handy whenever we want
to have a closer look at how things work within the platform.

`kubectl` is available from package managers for almost all common operating systems.

## Installing kubectl on Linux

On the **Debian, RedHat**, and **SUSE** families of operating systems, `kubectl`
can be installed via native package management. On other Linux flavors, the release
binaries can be downloaded instead.

### Installing kubectl with Native Package Managers

<Tabs>

  <TabItem value="debian" label="Debian" default>
    ``` sh
    sudo apt-get update
    sudo apt-get install -y apt-transport-https ca-certificates curl gnupg
    curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.31/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
    sudo chmod 644 /etc/apt/keyrings/kubernetes-apt-keyring.gpg
    echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.31/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
    sudo chmod 644 /etc/apt/sources.list.d/kubernetes.list
    sudo apt-get update
    sudo apt-get install -y kubectl
    ```  
  </TabItem>
  <TabItem value="redhat" label="Red Hat">
    ``` sh
    cat <<EOF | sudo tee /etc/yum.repos.d/kubernetes.repo
    [kubernetes]
    name=Kubernetes
    baseurl=https://pkgs.k8s.io/core:/stable:/v1.31/rpm/
    enabled=1
    gpgcheck=1
    gpgkey=https://pkgs.k8s.io/core:/stable:/v1.31/rpm/repodata/repomd.xml.key
    EOF
    sudo yum install -y kubectl
    ```
  </TabItem>
  <TabItem value="suse" label="SUSE">
    ``` sh
    cat <<EOF | sudo tee /etc/zypp/repos.d/kubernetes.repo
    [kubernetes]
    name=Kubernetes
    baseurl=https://pkgs.k8s.io/core:/stable:/v1.31/rpm/
    enabled=1
    gpgcheck=1
    gpgkey=https://pkgs.k8s.io/core:/stable:/v1.31/rpm/repodata/repomd.xml.key
    EOF
    sudo zypper update
    sudo zypper install -y kubectl
    ```  
 </TabItem>

</Tabs>

### Installing kubectl from GitHub

`kubectl` can be installed from release binaries:

```sh title="Installing kubectl from release binaries"
# For AMD64 / x86_64
[ $(uname -m) = x86_64 ] && curl -sSLO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
# For ARM64
[ $(uname -m) = aarch64 ] && curl -sSLO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/arm64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/kubectl
```

## Installing kubectl on MacOS and Windows

On MacOS and Windows, `kubectl` can be installed with multiple available package managers:

<Tabs>
  <TabItem value="hombrew" label="Homebrew" default>
    ```sh
    brew install kubectl
    ```
  </TabItem>
  <TabItem value="macports" label="Macports">
    ```sh
    sudo port selfupdate
    sudo port install kubectl
    ```
  </TabItem>
  <TabItem value="choco" label="Choco">
    ```ps1
    choco install kubernetes-cli
    cd ~
    mkdir .kube
    cd .kube
    New-Item config -type file
    ```
  </TabItem>
  <TabItem value="scoop" label="Scoop">
    ```ps1
    scoop install kubectl
    cd ~
    mkdir .kube
    cd .kube
    New-Item config -type file
    ```
  </TabItem>
  <TabItem value="winget" label="WinGet">
    ```ps1
    winget install -e --id Kubernetes.kubectl
    cd ~
    mkdir .kube
    cd .kube
    New-Item config -type file
    ```
  </TabItem>
</Tabs>

## Testing kubectl

To test if the installation `kubectl` has been successful, **spin up a terminal** and
run the following command:

```sh title="Testing kubectl"
kubectl version --client
```

The output should look like this:

```{ .text .no-copy title="Output" }
kubectl version --client

Client Version: v1.31.1
Kustomize Version: v5.4.2
```
