# ChatGPT GitHub Actions Bot

This action generates files in your repository using ChatGPT.

## Inputs

### `description`

**Required** The description of the work to be done.

## Outputs

### `files`

The files modified.

## Example usage

```yaml
uses: actions/chatgpt-github-actions-bot@main
with:
  descriptions: "Lint the files automatically using GitHub Actions"
```
