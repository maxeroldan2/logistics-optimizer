# GitHub MCP Server Usage Guide

## Setup Complete ✅

The GitHub MCP server is now configured and authenticated with your personal access token.

## Configuration Files

- **Token stored in:** `.env.local`
- **MCP config:** `mcp-config.json`

## Available Tools

The GitHub MCP server provides these tools:

### Repository Management
- `search_repositories` - Search for repositories
- `create_repository` - Create new repositories
- `fork_repository` - Fork repositories
- `get_file_contents` - Read files from repositories

### File Operations
- `create_or_update_file` - Create/update single files
- `push_files` - Push multiple files in one commit

### Branch Management
- `create_branch` - Create new branches
- `list_commits` - Get commit history

### Issues & Pull Requests
- `create_issue` - Create issues
- `list_issues` - List and filter issues
- `update_issue` - Update existing issues
- `add_issue_comment` - Comment on issues
- `create_pull_request` - Create pull requests
- `list_pull_requests` - List pull requests
- `get_pull_request` - Get PR details
- `merge_pull_request` - Merge pull requests
- `create_pull_request_review` - Review pull requests

### Search
- `search_code` - Search code across GitHub
- `search_issues` - Search issues and PRs
- `search_users` - Search for users

## Example Usage

### Test the connection:
```bash
export GITHUB_PERSONAL_ACCESS_TOKEN=your_token
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | npx @modelcontextprotocol/server-github
```

### Search repositories:
```bash
export GITHUB_PERSONAL_ACCESS_TOKEN=your_token
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "search_repositories", "arguments": {"query": "react typescript", "perPage": 5}}}' | npx @modelcontextprotocol/server-github
```

## Security Notes

- Your GitHub token is stored in `.env.local` (gitignored)
- Token has permissions for: repo, read:user, user:email, read:org
- Remember to regenerate tokens periodically for security

## Next Steps

You can now use the GitHub MCP server to:
1. Backup/sync your logis project to GitHub
2. Collaborate with others
3. Manage issues and pull requests
4. Search and analyze code across repositories