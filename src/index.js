const core = require("@actions/core");
const exec = require("@actions/exec");
const semver = require("semver");

function *tags(hash, raw_version) {
  yield hash;

  if (raw_version) {
    const version = semver.parse(semver.clean(raw_version));
    if (version !== null) {
      if (version.prerelease.length > 0) {
        yield version.format();
      } else {
        yield `${version.major}.${version.minor}.${version.patch}`;
        yield `${version.major}.${version.minor}`;
        yield `${version.major}`;
        yield "latest-release";
      }
      yield "latest-prerelease";
    } else {
      core.setFailed(`"${raw_version}" doesn't look like a semantic version.`);
    }
  }

  yield "latest";
}

async function run() {
  try {
    const source = core.getInput("source", { required: true });
    const image = core.getInput("image", { required: true });
    const hash = core.getInput("hash", { required: true });
    const raw_version = core.getInput("version");

    const server = core.getInput("server");
    const server_path = core.getInput("server_path");
    const user = core.getInput("user", { required: true });
    const token = core.getInput("token", { required: true });

    if (
      (await exec.exec("docker", ["image", "inspect", source], {
        ignoreReturnCode: true,
        silent: true
      })) > 0
    ) {
      core.setFailed(`Docker image "${source}" doesn't exist.`);
      return;
    }

    const target = [
      ...(server ? [ server ] : []),
      ...(server_path ? [ server_path ] : []),
      image
    ].join("/");

    await exec.exec("docker", ["login", "-u", user, "-p", token, server]);

    for (const tagAs of tags(hash, raw_version)) {
      const targetWithTag = `${target}:${tagAs}`;
      if (targetWithTag !== source) {
        await exec.exec("docker", ["tag", source, targetWithTag]);
      }
      await exec.exec("docker", ["push", targetWithTag]);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run().catch(error => core.setFailed(error.message));
