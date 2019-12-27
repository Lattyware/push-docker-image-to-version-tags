import core from "@actions/core";
import exec from "@actions/exec";
import semver from "semver";

async function run() {
  try {
    const image = core.getInput("image", { required: true });
    const commit_hash = core.getInput("commit_hash");
    const raw_version = core.getInput("version");

    const server = core.getInput("server");
    const user = core.getInput("user", { required: true });
    const token = core.getInput("token", { required: true });

    if (
      (await exec.exec(
        "docker",
        ["image", "inspect", `${image}:${commit_hash}`],
        {
          ignoreReturnCode: true,
          silent: true
        }
      )) > 0
    ) {
      core.setFailed(`Docker image ${image}:${commit_hash} doesn't exist.`);
      return;
    }

    const push_tag = async function(tag) {
      await exec.exec("docker", [
        "tag",
        `${image}:${commit_hash}`,
        `${image}:${tag}`
      ]);
    };

    await exec.exec("docker", ["login", "-u", user, "-p", token, server]);
    await exec.exec("docker", ["push", `${image}:${commit_hash}`]);

    if (raw_version) {
      const version = semver.parse(semver.clean(raw_version));
      if (version != null) {
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

run();
