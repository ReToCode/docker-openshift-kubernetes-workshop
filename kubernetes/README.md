# Kubernetes Hands On

## Preparation
```bash
- 1x VM 4 CPU, 6 GB Memory, 8 GB Disk Space # Master
- 2x VM 2 CPU, 4 GB Memory, 8 GB Disk Space # Nodes
- Docker setup from https://github.com/ReToCode/docker-paas/tree/master/docker
```

## VM preparation
Run this on all three VMs
```bash
# Make sure SWAP is disabled
# remove /swapfile row in /etc/fstab
# sudo reboot

# Install Kubernetes packages
curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add - && \
  echo "deb http://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list && \
  sudo apt-get update -q && \
  sudo apt-get install -qy kubeadm
```

## Setup kubernetes master
Run this on the 'master' VM
```bash
sudo kubeadm init --token-ttl=0 --pod-network-cidr=10.244.0.0/16
# If this is done, it will print a command with the token. Save this command/token for later use.

# Copy auth to non-root user
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# Network plugin (WeaveNet)
kubectl apply -f "https://cloud.weave.works/k8s/net?k8s-version=$(kubectl version | base64 | tr -d '\n')"
```

## Setup Kubernetes nodes
Run this on the two 'node' VMs
```bash
# Join the cluster using the token
kubeadm join 192.168.1.81:6443 --token xxx --discovery-token-ca-cert-hash sha256:xxx # use IP of your master

# Watch progress
# On the master you can watch progress with
watch kubectl get nodes
```

## Deploy an app
```bash
kubectl run web-app --generator=deployment/v1beta1 --image=retocode/web-app:v1 --port=3000

# Check the pod
kubectl get pod

# Expose the container
kubectl expose deployment/web-app --type=NodePort --name=web-app

# Get the port
kubectl get svc # look for 3000:30xxx/TCP entry

# Call the app using a nodes IP and the NodePort
http://192.168.1.85:30679
```

## Kubernetes Dashboard (GUI)
Kubernetes Dashboard from:
https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/#welcome-view

```bash
kubectl apply -f https://raw.githubusercontent.com/ReToCode/docker-paas/master/kubernetes/kube-dashboard.yaml

# Wait until all containers are running
kubectl get all -n kube-system

# Access the dashboard using kube-proxy
kubectl proxy --address='192.168.1.81' --accept-hosts='.*'

# Open the Dashboard on
http://192.168.1.81:8001/api/v1/namespaces/kube-system/services/https:kubernetes-dashboard:/proxy/#!/login

# Click 'Skip' on login
```

## Optional: NFS autoprovisioning
You can use an existing VM for this, or create a new VM that acts as a NFS server.
```bash
# On all master/node servers install nfs-common
sudo apt install nfs-common

# NFS server setup
sudo apt-get install nfs-kernel-server nfs-common
sudo systemctl enable nfs-kernel-server
sudo mkdir /pvs/

# Add following line to /etc/exports
/pvs/ 192.168.1.1/255.255.0.0(rw,sync,no_subtree_check,no_root_squash)

sudo systemctl start nfs-kernel-server
sudo exportfs -a

# Auto provisioning in Kubernetes
wget https://raw.githubusercontent.com/ReToCode/docker-paas/master/kubernetes/nfs.yaml

# Replace the two occurences of NFS server IP with the IP of your NFS server
kubectl apply -f nfs.yaml
kubectl patch storageclass kube-nfs -p '{"metadata":{"annotations": {"storageclass.kubernetes.io/is-default-class": "true"}}}'

# Wait until the provisioner is running
watch kubectl get po

# Test the setup
# Create a persistent volume claim
kubectl apply -f https://raw.githubusercontent.com/ReToCode/docker-paas/master/kubernetes/pvc.yaml

# Wait until the provisioner created a persistent volume
watch kubectl get pvc

# Create a pod with a persistent volume mount
kubectl apply -f https://raw.githubusercontent.com/ReToCode/docker-paas/master/kubernetes/pod-with-pv.yaml

# "SSH" into the new pod
kubectl exec -it task-pv-pod -- /bin/sh

# Write data in the persistent volume
echo '<h1>Hello World</h1>' > /usr/share/nginx/html/index.html

# See /pvs on the NFS server
ls /pvs/xxx/index.html
```
