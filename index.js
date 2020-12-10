const core = require('@actions/core')
const github = require('@actions/github')

const Perspective = require('perspective-api-client')

const context = github.context
const {owner, repo} = context.repo
const event_type = context.eventName

const labels = ['non-inclusivity-detected!']

;(async () => {
  try {
    const tba = core.getInput('tba', {required: true})

    const token = core.getInput('token')
    const octokit = new github.getOctokit(token)

    const perspective = new Perspective({
      apiKey: process.env.PERSPECTIVE_API_KEY
    })

    core.debug(`Default configured reply comment is set to ${tba} ...`)
    core.debug(`Name of Repository is ${repo} and the owner is ${owner}`)
    core.debug(`Triggered event is ${event_type}`)

    try {
      await octokit.issues.getLabel({
        owner,
        repo,
        name: 'non-inclusivity-detected!'
      })
    } catch (err) {
      if (err.message === 'Not Found') {
        await octokit.issues.createLabel({
          owner,
          repo,
          name: 'non-inclusivity-detected!',
          color: 'ff1493',
          description: 'Non inclusive language is detected in the commits of a Issue or Pull Request'
        })

        core.debug(`No non-inclusivity label detected. Creating new label ...`)
        core.debug(`Warning label created`)
      } else {
        core.error(`getLabel error: ${err.message}`)
      }
    }

    let issue_number
    let body

    // Get Issue or Pull Request
    if (event_type === 'pull_request') {
      issue_number = context.payload.pull_request.number
    }

    // Get Issue or Pull Request
    if (event_type === 'issues' || event_type === 'issue_comment') {
      issue_number = context.payload.issue.number
    }

    if (event_type === 'issues') {
      body = context.payload.issue.body
    }

    if (event_type === 'issue_comment') {
      body = context.payload.comment
    }

    core.debug(`The ${event_type} number is: ${issue_number}`)

    const {attributeScores} = await perspective.analyze(body, {truncate: true})

    const {value} = attributeScores.TOXICITY.summaryScore

    if (value >= tba) {
      await octokit.issues.addLabels({
        owner,
        repo,
        issue_number,
        labels
      })

      await octokit.issues.createComment({
        owner,
        repo,
        issue_number,
        body: `## :warning: Possible non inclusive language detected :warning:

Dude! cmon.. u can do better.. check the Code of Conduct pls!`
      })

      core.setOutput(`Non inclusivity detected! Setting Issue or PR status to flaged.`)
    }
    // LOGIC ENDS HERE
  } catch (err) {
    core.setFailed(err.message)
  }
})()
