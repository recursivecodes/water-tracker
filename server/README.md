# Water Tracker

## Docker 

### Build

```bash
$ docker build -t phx.ocir.io/toddrsharp/water-tracker/water-tracker-svc:latest .
```

### Push

```bash
$ docker push phx.ocir.io/toddrsharp/water-tracker/water-tracker-svc:latest
```

## Kubernetes

### Secrets

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: water-tracker-svc-secrets
data:
  dbUser: [base64 encoded user]
  dbPassword: [base64 encoded password]
  connectString: [base64 encoded connect string]
---
```

```bash
$ kubectl apply -f secret.yaml
```

### App

See `app.yaml`, update path to Docker image, then apply:

```bash
$ kubectl apply -f app.yaml
```
