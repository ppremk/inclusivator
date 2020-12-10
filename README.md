
## Inclusivator

- MVP
- Credits and attribute to [sentiment-bot](https://github.com/behaviorbot/sentiment-bot)


## Inputs

#### `tba `

Required, set's the file size limit threshold in bytes. Default "10MB".

#### `token `

Optional. Takes a valid **GitHub Token** from the Repo by default. 

## Outputs


## Usage

Consume the action by referencing the stable branch

```yaml
uses: actionsdesk/inclusivator@v1.0
with:
  token: ${{ secrets.GITHUB_TOKEN }} # Optional
  tba: '' 
```
