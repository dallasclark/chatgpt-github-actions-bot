# ChatGPT GitHub Actions Bot

This action generates files in your repository using ChatGPT.

## Example usage

```yaml
uses: dallasclark/chatgpt-github-actions-bot@1.0.0
with:
  descriptions: "Create a blog article in the /src/blog-articles/ folder about the latest trends in software development."
```

## Inputs

### `description`

**Required** The description of the work to be done.

## Outputs

### `files`

The files modified.

```
[
  {
    "filename": "the/path/to/file.txt",
    "content": "The code contents of the file"
  }
]
```
