const core = require("@actions/core");
const exec = require("@actions/exec");
const semver = require("semver");

async function run() {
  try {
    const image = core.getInput("image", { required: true }).toLowerCase();
    const tag = core.getInput("tag");
    const raw_version = core.getInput("version");

    const server = core.getInput("server");
    const server_path = core.getInput("server_path");
    const user = core.getInput("user", { required: true });
    const token = core.getInput("token", { required: true });

    const source = `${image}:${tag}`;

    if (
      (await exec.exec("docker", ["image", "inspect", source], {
        ignoreReturnCode: true,
        silent: true
      })) > 0
    ) {
      core.setFailed(`Docker image  doesn't exist.`);
      return;
    }

    const prefix = (server
      ? `${server}/${server_path ? `${server_path}/` : ""}`
      : ""
    ).toLowerCase();

    const push_tag = async function(new_tag) {
      const target = `${prefix}${image}:${new_tag}`;

      if (target !== source) {
        await exec.exec("docker", ["tag", source, target]);
      }

      await exec.exec("docker", ["push", target]);
    };

    await exec.exec("docker", ["login", "-u", user, "-p", token, server]);
    await push_tag(tag);

    if (raw_version) {
      const version = semver.parse(semver.clean(raw_version));
      if (version !== null) {
        if (version.prerelease.length > 0) {
          await push_tag(version.format());
        } else {
          await push_tag(`${version.major}.${version.minor}.${version.patch}`);
          await push_tag(`${version.major}.${version.minor}`);
          await push_tag(`${version.major}`);
        }
      } else {
        core.setFailed(`${raw_version} doesn't look like a semantic version.`);
      }
    }

    await push_tag("latest");
  } catch (error) {
    core.setFailed(error.message);
  }
}

run().catch(error => core.setFailed(error.message));
