# OpenShift Hands On

## Preparation
```bash
- 1x VM 4 CPU, 6 GB Memory, 8 GB Disk Space
- Docker setup from https://github.com/ReToCode/docker-paas/tree/master/docker
```

```bash
# Docker config
sudo mkdir -p /etc/systemd/system/docker.service.d

# Add this to /etc/systemd/system/docker.service.d/override.conf
[Service]
ExecStart=
ExecStart=/usr/bin/dockerd -H fd:// --insecure-registry 172.30.0.0/16

# Restart docker
sudo systemctl daemon-reload 
sudo systemctl restart docker
```

## Start OpenShift
```bash

# Get and extract OpenShift binaries
wget https://github.com/openshift/origin/releases/download/v3.11.0/openshift-origin-client-tools-v3.11.0-0cbc58b-linux-64bit.tar.gz

# Use oc client
sudo mv openshift-origin-client-tools-v3.11.0-0cbc58b-linux-64bit/oc openshift-origin-client-tools-v3.11.0-0cbc58b-linux-64bit/kubectl /usr/local/bin/

# Replace ip with IP of your VM
oc cluster up --routing-suffix=192.168.1.74.nip.io --public-hostname=192.168.1.74 --enable=service-catalog,router,registry,web-console,persistent-volumes,rhel-imagestreams

# More permissions for 'developer' account
oc login -u system:admin
oc adm policy add-cluster-role-to-user cluster-admin developer
```

## Accessing OpenShift
```bash
# Use the command line
oc login --server=https://192.168.1.74:8443 # use IP of your VM
- username: developer
- password: anything will work

# More info on the CLI: https://docs.okd.io/latest/getting_started/developers_cli.html

# If you use your own computer -> download oc client from https://www.okd.io/download.html

# Using Web-GUI:
https://192.168.1.74:8443/console # use IP of your VM

# More info on the Web-GUI: https://docs.okd.io/latest/getting_started/developers_console.html

```

## Take a look at the OpenShift projects
```bash
# Interesting projects
- default
- kube-dns
- kube-proxy
- kube-system
- openshift-apiserver
- openshift-controller-manager
- openshift-core-operators
- openshift-service-cert-signer
- openshift-web-console
```

## Deploy your own app
```bash
oc project myproject
oc new-app retocode/web-app:v1
oc expose service web-app

# Click on the link in the Web-GUI: http://web-app-myproject.192.168.1.74.nip.io/

# Add environment variables
oc set env dc/web-app VERSION=v1

# Deployment will be triggered (see it working in the Web-GUI)
# Check the output of http://web-app-myproject.192.168.1.74.nip.io/ again
```