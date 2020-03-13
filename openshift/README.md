# OpenShift Hands On

## Preparation
```bash
- 1x VM 4 CPU, 6 GB Memory, 12 GB Disk Space
- Docker setup from https://github.com/ReToCode/docker-openshift-kubernetes-workshop/tree/master/docker
```

Edit docker daemon config
```bash
sudo mkdir -p /etc/systemd/system/docker.service.d
```

Add the following to `/etc/systemd/system/docker.service.d/override.conf`
```
[Service]
ExecStart=
ExecStart=/usr/bin/dockerd -H fd:// --insecure-registry 172.30.0.0/16
```

Restart docker
```bash
sudo systemctl daemon-reload 
sudo systemctl restart docker
```

## Start OpenShift
```bash
# Get and extract OpenShift binaries
wget https://github.com/openshift/origin/releases/download/v3.11.0/openshift-origin-client-tools-v3.11.0-0cbc58b-linux-64bit.tar.gz

# Unpack archive
tar xf openshift-origin-client-tools-v3.11.0-0cbc58b-linux-64bit.tar.gz

# Use oc client
sudo mv openshift-origin-client-tools-v3.11.0-0cbc58b-linux-64bit/oc openshift-origin-client-tools-v3.11.0-0cbc58b-linux-64bit/kubectl /usr/local/bin/

# Replace ip with IP of your VM
oc cluster up --routing-suffix=192.168.1.152.nip.io --public-hostname=192.168.1.152 --enable=service-catalog,router,registry,web-console,persistent-volumes,rhel-imagestreams


### If something went wrong in 'oc cluster up' or you need another startup config, use this to delete an existing cluster
# `rm -rf openshift.local.clusterup/`

# More permissions for 'developer' account
oc login -u system:admin
oc adm policy add-cluster-role-to-user cluster-admin developer
```

## Accessing OpenShift
```bash
# Using the Web-GUI:
https://192.168.1.152:8443/console # use IP of your VM

# More info on the Web-GUI: https://docs.okd.io/latest/getting_started/developers_console.html

# Using the OpenShift-CLI `oc` from your own computer
# On the server where you set up OpenShift you are automatically logged in
# More info on the CLI: https://docs.okd.io/latest/getting_started/developers_cli.html
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

# Click on the link in the Web-GUI: http://web-app-myproject.192.168.1.152.nip.io/

# Add environment variables
oc set env dc/web-app VERSION=v1

# Deployment will be triggered (see it working in the Web-GUI)
# Check the output of http://web-app-myproject.192.168.1.152.nip.io/ again
```
