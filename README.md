
## Inclusivator

- MVP
- Credits and attribute to [sentiment-bot](https://github.com/behaviorbot/sentiment-bot)


## Inputs

#### `tba `

Required, set's the non-inclusivity threshold in bytes. Default ".5".

#### `token `

Optional. Takes a valid **GitHub Token** from the Repo by default.

## Outputs


## Usage

Consume the action by referencing the stable branch

```yaml
uses: actionsdesk/inclusivator@v1.0
with:
  token: ${{ secrets.GITHUB_TOKEN }} # Optional
  tba: '0.5'
env:
  PERSPECTIVE_API_KEY: ${{ secrets.PERSPECTIVE_API_KEY }}
```
