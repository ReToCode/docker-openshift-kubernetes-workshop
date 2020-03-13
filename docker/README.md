# Docker Hands On

## Docker installation
```bash
# Install docker using get.docker.io
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Then add current user to docker group
sudo groupadd docker 
sudo usermod -aG docker $USER

# Logout and login to get new groups
```

## Build a docker image
```bash
cd web-app
docker build -t retocode/web-app:v1 .
```

## Run a docker image
```bash
docker run retocode/web-app:v1
```

## Push docker image to docker hub
```bash
docker push retocode/web-app:v1
```
