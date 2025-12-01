# Git Commit Command

Automates the Git commit workflow by analyzing staged changes, generating meaningful commit messages following the project's conventional commit format, and creating commits with proper metadata.

## Description

This command streamlines the Git commit process by:
- Analyzing current repository state and staged changes
- Generating contextual commit messages that follow project standards
- Creating commits with proper formatting and metadata
- Including AI attribution for transparency

## Usage

```bash
/commit [--message <custom-message>] [--amend] [--no-verify]
```

## Parameters

### Optional

- `--message` (string): Provide a custom commit message instead of auto-generated one
- `--amend`: Amend the last commit instead of creating a new one
- `--no-verify`: Skip pre-commit hooks (use with caution)

## Examples

```bash
# Auto-generate commit message from staged changes
/commit

# Use custom message
/commit --message "fix: correct blog post frontmatter format"

# Amend previous commit
/commit --amend

# Skip pre-commit hooks (emergency use only)
/commit --no-verify
```

## Workflow

### Step 1: Pre-Commit Checks

Before proceeding, validate the repository state:

1. **Check for staged changes**:
   ```bash
   git status --porcelain
   ```
   - If no staged changes, prompt user to stage files first
   - Display list of unstaged changes for user reference

2. **Verify repository status**:
   - Confirm not in detached HEAD state
   - Check for merge conflicts
   - Verify repository is in a committable state

3. **Review current branch**:
   ```bash
   git branch --show-current
   ```
   - Display current branch name
   - Warn if committing to `main` or `master` without review

### Step 2: Analyze Staged Changes

Gather comprehensive information about what's being committed:

1. **Get diff summary**:
   ```bash
   git diff --cached --stat
   ```
   - Count files changed
   - Calculate lines added/removed
   - Identify file types affected

2. **Get detailed diff**:
   ```bash
   git diff --cached
   ```
   - Analyze actual code changes
   - Identify patterns (new features, bug fixes, refactoring)
   - Detect scope of changes (components, pages, configs, etc.)

3. **Review recent commits**:
   ```bash
   git log -5 --oneline
   ```
   - Study commit message style
   - Maintain consistency with project conventions
   - Avoid duplicating recent work

### Step 3: Generate Commit Message

Create a meaningful commit message following conventional commit format:

**Format**:
```
<type>(<scope>): <subject>

[optional body]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Type Selection** (from project's convention):
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no functional changes)
- `refactor`: Code restructuring
- `perf`: Performance improvements
- `test`: Test additions/modifications
- `chore`: Build, config, or dependency changes

**Scope Determination**:
- `blog`: Blog post content or structure
- `components`: React/Astro components
- `pages`: Page-level changes
- `agents`: Claude agent definitions
- `commands`: Slash command files
- `config`: Configuration files
- `deps`: Dependency updates

**Subject Line Guidelines**:
- Imperative mood ("add" not "added" or "adds")
- No period at the end
- Maximum 72 characters
- Clear and descriptive

**Body Guidelines** (when needed):
- Explain "why" not "what" (code shows what)
- Reference issue numbers if applicable
- List breaking changes
- Maximum line width: 72 characters

**Examples**:

```
feat(blog): add advanced TypeScript types post

Covers mapped types, conditional types, and template literal types
with practical examples from real-world scenarios.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

```
fix(components): correct RelatedPosts rendering issue

Posts were not displaying when relatedPosts array was empty.
Added null check before mapping.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

```
chore(deps): update Astro to 5.14.1

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Step 4: Execute Commit

Perform the actual commit operation:

1. **Stage additional files if needed**:
   - If analysis reveals related unstaged files, ask user to stage them
   - Common pattern: Adding images referenced in blog posts

2. **Create commit**:
   ```bash
   git commit -m "$(cat <<'EOF'
   [Generated commit message here]
   EOF
   )"
   ```
   - Use heredoc for proper multi-line formatting
   - Preserve special characters and formatting
   - Handle quotes and escape sequences correctly

3. **Verify commit**:
   ```bash
   git log -1 --stat
   ```
   - Display created commit
   - Confirm message formatting
   - Show files included

### Step 5: Post-Commit Actions

After successful commit:

1. **Display summary**:
   ```
   ✅ Commit created successfully!

   Commit Details:
   - Hash: abc1234
   - Author: Your Name <email@example.com>
   - Date: 2025-12-01 14:30:00
   - Message: feat(blog): add TypeScript advanced types post

   Files Changed:
   - src/content/blog/ko/typescript-advanced-types.md (new)
   - src/content/blog/ja/typescript-advanced-types.md (new)
   - src/content/blog/en/typescript-advanced-types.md (new)
   - src/assets/blog/typescript-hero.webp (new)

   Statistics:
   - 4 files changed
   - 342 insertions(+)
   - 0 deletions(-)

   Next Steps:
   1. Review commit: git show HEAD
   2. Push changes: git push origin <branch-name>
   3. Create PR (if ready): gh pr create
   ```

2. **Check for pre-commit hook modifications**:
   - If pre-commit hooks modified files (e.g., formatting)
   - Ask user if they want to amend the commit
   - Display modified files

3. **Suggest next actions**:
   - Push to remote
   - Create pull request
   - Continue with additional changes

## Error Handling

### Common Errors and Solutions

#### 1. No Staged Changes

**Error**:
```
error: nothing to commit (use "git add" to stage changes)
```

**Solution**:
```
❌ No staged changes found

Unstaged files:
- src/content/blog/ko/new-post.md
- src/assets/blog/hero.webp

Next steps:
1. Stage files: git add <file>
2. Run /commit again

Example: git add src/content/blog/ko/new-post.md
```

#### 2. Merge Conflicts

**Error**:
```
fatal: You have not concluded your merge
```

**Solution**:
```
❌ Repository has unresolved merge conflicts

Conflicted files:
- src/components/Header.astro
- package.json

Next steps:
1. Resolve conflicts manually
2. Mark as resolved: git add <file>
3. Complete merge: git merge --continue
```

#### 3. Pre-commit Hook Failure

**Error**:
```
pre-commit hook failed
```

**Solution**:
```
❌ Pre-commit hook failed

This usually means:
- Linting errors
- Formatting issues
- Type checking failures

Next steps:
1. Review errors above
2. Fix issues
3. Stage fixes: git add .
4. Retry /commit

Or bypass (not recommended): /commit --no-verify
```

#### 4. Empty Commit Message

**Error**:
```
Aborting commit due to empty commit message
```

**Solution**:
```
❌ Failed to generate commit message

This can happen when:
- Changes are too minimal to categorize
- Diff is unclear

Next steps:
1. Provide custom message: /commit --message "your message"
2. Review staged changes: git diff --cached
```

### Validation Checks

Before committing, verify:

1. **Message quality**:
   - Type is valid (feat, fix, docs, etc.)
   - Scope is appropriate
   - Subject is descriptive
   - No typos or grammatical errors

2. **Change coherence**:
   - All staged files relate to same logical change
   - No unrelated changes mixed together
   - Scope matches actual files changed

3. **Project conventions**:
   - Follows project's commit message format
   - Matches recent commit style
   - Proper emoji/attribution usage

## Integration with Git Hooks

### Pre-commit Hooks

If repository has pre-commit hooks configured:

1. **Automatic execution**:
   - Linting (ESLint, Prettier)
   - Type checking (TypeScript)
   - Tests (if configured)

2. **Hook failure handling**:
   - Display hook output
   - Explain failure reason
   - Suggest fixes
   - Offer `--no-verify` option (with warning)

3. **Hook modifications**:
   - If hooks modify files, detect changes
   - Prompt to amend commit with hook changes
   - Re-stage modified files

### Commit-msg Hooks

If commit-msg hooks exist:

1. **Message validation**:
   - Conventional commit format
   - Length limits
   - Required patterns

2. **Automatic fixes**:
   - Add issue references
   - Format consistently
   - Add required metadata

## Advanced Usage

### Amending Commits

```bash
# Amend last commit with new changes
/commit --amend

# Amend with different message
/commit --amend --message "fix: correct commit message"
```

**Safety Checks**:
- Only amend if last commit is not pushed
- Verify commit author matches current user
- Warn about rewriting history

### Batch Commits

For multiple related changes:

```bash
# Stage and commit feature parts sequentially
git add src/components/NewFeature.astro
/commit  # Generates: feat(components): add NewFeature component

git add src/pages/feature.astro
/commit  # Generates: feat(pages): add feature page

git add src/content/blog/*/feature-post.md
/commit  # Generates: docs(blog): document new feature
```

### Custom Scopes

For specific project areas:

```bash
# Blog-specific scope
/commit  # Auto-detects blog changes → feat(blog): ...

# Configuration scope
/commit  # Auto-detects config changes → chore(config): ...

# Multi-scope changes
/commit  # Detects multiple areas → chore: update multiple areas
```

## Best Practices

### DO:
- ✅ Commit small, logical changes
- ✅ Write clear, descriptive messages
- ✅ Review diff before committing
- ✅ Use conventional commit format
- ✅ Run tests before committing (if applicable)

### DON'T:
- ❌ Mix unrelated changes in one commit
- ❌ Commit broken code
- ❌ Use vague messages ("fix stuff", "updates")
- ❌ Skip pre-commit hooks without reason
- ❌ Amend pushed commits

## Performance Optimization

### Fast Mode (Future Enhancement)

For frequently committed files:

```bash
# Skip detailed analysis, use heuristics
/commit --fast

# Processing time: 2s → 0.5s
```

### Template-based Messages

For repetitive commits:

```bash
# Save message template
/commit --template blog-update

# Uses: feat(blog): update {post-name}
```

## Troubleshooting

### "Commit message generation is too slow"
- **Cause**: Large diffs or many files
- **Solution**: Commit smaller batches, use `--fast` mode (when implemented)

### "Generated message is incorrect"
- **Cause**: Ambiguous changes or multiple change types
- **Solution**: Use `--message` to provide custom message, or split commit

### "Pre-commit hook always fails"
- **Cause**: Project configuration issue
- **Solution**: Fix underlying issues, or temporarily bypass with `--no-verify`

## Configuration

### Customization (Future)

Allow project-specific settings:

```json
// .claude/commit-config.json
{
  "messageFormat": "conventional",
  "scopes": ["blog", "components", "config"],
  "requireBody": false,
  "maxSubjectLength": 72,
  "attribution": "🤖 Generated with Claude Code"
}
```

## Related Commands

- `/git-status`: View repository status
- `/git-diff`: Review changes before committing
- `/git-push`: Push commits to remote
- `/create-pr`: Create pull request after commits

## Notes

- All commit messages include Claude Code attribution for transparency
- Co-authored-by tag tracks AI involvement
- Heredoc format ensures proper multi-line message formatting
- Commit message follows project's conventional commit style
- Pre-commit hooks are respected by default
- Amending is only suggested for unpushed commits

---

**Last Updated**: 2025-12-01
**Version**: 2.0 - Comprehensive documentation with workflow details
