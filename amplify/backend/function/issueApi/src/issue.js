const Octokit = require('@octokit/rest')

const postIssue = async (req, res) => {
  // Initialize Github API client with a personal token from env
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  })

  const {title, body, label} = req.body

  if (! title) {
    res.status(400).json({
      error: 'Failed to create issue.',
      reason: 'Title cannot be null.'
    })
    return
  }

  let octoResponse
  try {
    octoResponse = await octokit.issues.create({
      owner: 'railroad-editor',
      repo: 'railroad-editor-bug-reports',
      title: title,
      body: body,
      labels: label ? [label]: null
    })
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Failed to create issue.',
      reason: err
    })
    return
  }

  console.info(octoResponse)
  res.status(204).send()
}


module.exports = {
  postIssue,
}