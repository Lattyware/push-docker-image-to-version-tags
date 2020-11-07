# Push Docker Image To Version Tags

An opinionated action that pushes a docker image and tag it with all the semantic 
version tags that are appropriate.

This allows your users to choose what level of stability and update frequency they 
want by using more/less specific tags.

Requirements before running:
 - The given image exists with the given source tag.

What this action does:
 - Tag the image with the commit hash.
 - If a version is provided:
    - If the version is a prerelease version:
        - Tag the image with the full version (e.g: 1.0.1-beta2).
    - If the version is *not* a prerelease version:
        - Tag the image with the patch version (e.g: 1.0.1).
        - Tag the image with the minor version (e.g: 1.0).
        - Tag the image with the major version (e.g: 1).
        - Tag the image with "latest-release".
    - Tag the image with "latest-prerelease".
 - Tag the image with "latest".

## Usage

```yaml
  - uses: lattyware/push-docker-image-to-version-tags@v2
    with:
        # A complete tag for the image to push that already exists.
        source: ""

        # The name of the image to push.
        image: ""
        
        # The commit hash for the source the image was built from.
        hash: ""

        # The full (semver-compliant) version number, if not given, this will only push to the hash and latest.
        version: ""

        # The url of the server to push to.
        server: ""
        
        # The path under the server to push to.
        # On Docker Hub, this is 'username'. 
        # On GitHub Package Repository, this is 'username/repo'.
        server_path: ""

        # The user to authenticate to the server as.
        user: ""
          
        # The token to authenticate with the server with.
        token: ""
```
