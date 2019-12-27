# Push Docker Image To Version Tags

Push a docker image and tag it with all the semantic version tags.

Requirements before running:
 - The given image exists with the given tag.

What this action does:
 - Pushes the given image with the given tag.
 - If a version is provided:
    - If the version is a prerelease version:
        - Tag the image with the full version (e.g: 1.0.1-beta2).
    - If the version is *not* a prerelease version:
        - Tag the image with the patch version (e.g: 1.0.1).
        - Tag the image with the minor version (e.g: 1.0).
        - Tag the image with the major version (e.g: 1) .
 - Tag the image with "latest".
 
Note that it doesn't really make sense to use this on the GitHub Package Repository, as tags are immutable 
there.

## Usage

```yaml
  - uses: lattyware/push-docker-image-to-version-tags@v1
    with:
        # The name of the image to push.
        image: ""
        
        # The initial tag the image has.
        tag: ""

        # The full (semver-compliant) version number, if not given, this will only push to the existing tag and latest.
        version: ""

        # The url of the server to push to.
        server: ""
        
        # The path under the server to push to. On GitHub Package Repository, for example, this is 'username/repo'.
        server_path: ""

        # The user to authenticate to the server as.
        user: ""
          
        # The token to authenticate with the server with.
        token: ""
```
