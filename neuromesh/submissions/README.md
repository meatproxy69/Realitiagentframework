# NeuralMesh submissions

Place proposed public community packages under:

```text
neuromesh/submissions/<namespace>/<submission-id>/
```

A typical package contains:

```text
imprint.json
dendrites.json     optional
README.md          optional
code/              optional source-only dendrite code
```

A submission is untrusted data until reviewed.

Do not include hidden chain-of-thought, system prompts, credentials, private user data, private resident stores, model weights, or opaque binaries.

Dendrite source may be submitted for review, but it is not executed automatically.

Accepted material is promoted by maintainers into `../imprints/` and/or `../dendrites/` and indexed in `../REGISTRY.json`.