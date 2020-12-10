const core = require("@actions/core")
const github = require("@actions/github")

const Perspective = require("perspective-api-client")

const myToken = core.getInput("token")
const octokit = new github.GitHub(myToken)

const context = github.context

const { owner, repo } = context.repo
const event_type = context.eventName

let issue_pr_number
const labels = ["non-inclusivity-detected!"]

// most @actions toolkit packages have async methods
async function run() {
  try {
    const tba = core.getInput("tba")

    const perspective = new Perspective({
      apiKey: process.env.PERSPECTIVE_API_KEY,
    })

    core.info(`Default configured reply comment is set to ${tba} ...`)
    core.info(`Name of Repository is ${repo} and the owner is ${owner}`)
    core.info(`Triggered event is ${event_type}`)

    // Get Non Inclusivity Warning Label
    let nonInclusivelabelObj = {}
    try {
      nonInclusivelabelObj = await octokit.issues.getLabel({
        owner,
        repo,
        name: "non-inclusivity-detected!",
      })
    } catch (error) {
      if (error.message === "Not Found") {
        await octokit.issues.createLabel({
          owner,
          repo,
          name: "non-inclusivity-detected!",
          color: "ff1493",
          description:
            "Warning Label for use when non inclusive language is detected in the commits of a Issue or Pull Request",
        })
        core.info(`No non-inclusivity label detected. Creating new label ...`)
        core.info(`Warning label created`)
      } else {
        core.error(`getLabel error: ${error.message}`)
      }
    }

    // Get Issue or Pull Request
    if (event_type === "pull_request") {
      issue_pr_number = context.payload.pull_request.number

      core.info(`The PR number is: ${issue_pr_number}`)
    }

    // Get Issue or Pull Request
    if (event_type === "issues") {
      issue_pr_number = context.payload.issues.number

      core.info(`The Issue number is: ${issue_pr_number}`)
    }

    // TODO Logic for detecting spam/non inclusive language
    const body = context.payload.comment.body
    const response = await perspective.analyze(body, { truncate: true })

    const inclusivityPoint =
      response.attributeScores.TOXICITY.summaryScore.value

    if (inclusivityPoint >= tba) {
      let bodyTemplate = `## :warning: Possible non inclusive language detected :warning: \n Dude! cmon.. u can do better.. check the Code of Conduct pls!`

      await octokit.issues.addLabels({
        owner,
        repo,
        issue_number: issue_pr_number,
        labels,
      })

      await octokit.issues.createComment({
        owner,
        repo,
        issue_number: issue_pr_number,
        body: bodyTemplate,
      })

      core.setFailed(
        `Non inclusivity detected! Setting Issue or PR status to flaged.`
      )
    }
    // LOGIC ENDS HERE
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
