# build-resource

If you're going to build the Docker image, place your unzipped wallet in this directory such that the following structure exists:

```build-resource/wallet```

If you're going to deploy to Kubernetes/OKE you will need to use the `app_template.yaml` in the `server/` directory (update the container image path if you're using OCIR) and create secrets using `secret_template.yaml` in this directory. See [`server/README.md`](../README.md) for more info.

**Don't check your `wallet` or `secret.yaml` into source control!**