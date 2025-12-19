# Chapter 2: Environment Setup

To effectively utilize Claude Code, proper development environment configuration is essential. This chapter covers step-by-step setup from installation to initial configuration, and recommended configurations to maximize productivity.

---

## Recipe 2.1: Installation and Authentication

### Problem

Developers new to Claude Code need to install it correctly and complete API authentication. Incorrect installation or authentication errors affect all subsequent work, so it's crucial to proceed accurately from the first step.

### Solution

Claude Code installation consists of three main steps:

1. **System Requirements Check**
2. **CLI Tool Installation**
3. **API Key Authentication**

#### Step 1: System Requirements Check

Minimum requirements to run Claude Code:

- **Operating System**: macOS, Linux, Windows (WSL2 recommended)
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Disk Space**: 500MB or more (including cache and model data)
- **Network**: Stable internet connection (for API calls)

Check Node.js version:

```bash
node --version
# Should be v18.0.0 or higher

npm --version
# Should be v9.0.0 or higher
```

If the version is too low, download and install the LTS version from [nodejs.org](https://nodejs.org).

#### Step 2: Installing Claude Code CLI

Install globally via npm:

```bash
# Global installation
npm install -g @anthropic-ai/claude-code

# Verify installation
claude --version
# Output: claude-code/1.x.x
```

Once installed, you can use the `claude` command from anywhere in your terminal.

**Troubleshooting Installation**:

```bash
# For permission errors (macOS/Linux)
sudo npm install -g @anthropic-ai/claude-code

# Clear npm cache and retry
npm cache clean --force
npm install -g @anthropic-ai/claude-code
```

#### Step 3: API Key Authentication

Obtain an Anthropic API key and set it as an environment variable.

**Getting an API Key**:

1. Visit [console.anthropic.com](https://console.anthropic.com)
2. Create an account or log in
3. Navigate to 'API Keys' menu
4. Click 'Create Key' button
5. Enter key name (e.g., "claude-code-dev")
6. Copy the generated key (only shown once, store safely)

**Setting Environment Variables**:

For macOS/Linux, add to `.bashrc`, `.zshrc`, or `.bash_profile`:

```bash
# ~/.zshrc or ~/.bashrc
export ANTHROPIC_API_KEY='sk-ant-api03-...'
```

Apply changes:

```bash
source ~/.zshrc  # or ~/.bashrc
```

For Windows (PowerShell):

```powershell
# Set as system environment variable
[System.Environment]::SetEnvironmentVariable('ANTHROPIC_API_KEY', 'sk-ant-api03-...', 'User')
```

**Verify Authentication**:

```bash
# Test authentication with simple command
claude auth check

# Example output:
# ✓ API key is valid
# ✓ Connected to Anthropic API
# Model: claude-sonnet-4-5-20250929
```

### Code

You can automate the entire installation process with a single script:

```bash
#!/bin/bash
# install-claude-code.sh

echo "Claude Code Installation Script"
echo "======================================"

# 1. Check Node.js version
echo "\n[1/4] Checking Node.js version..."
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js v18 or higher required. Current: v$(node --version)"
    echo "Install the latest LTS version from https://nodejs.org"
    exit 1
fi
echo "✓ Node.js $(node --version)"

# 2. Install Claude Code
echo "\n[2/4] Installing Claude Code..."
npm install -g @anthropic-ai/claude-code
if [ $? -ne 0 ]; then
    echo "❌ Installation failed. sudo privileges may be required."
    exit 1
fi
echo "✓ Claude Code $(claude --version)"

# 3. API Key Input
echo "\n[3/4] API Key Setup..."
echo "Enter your Anthropic API key:"
read -s API_KEY

# 4. Set Environment Variable (for zsh)
echo "\n[4/4] Setting environment variable..."
echo "export ANTHROPIC_API_KEY='$API_KEY'" >> ~/.zshrc
source ~/.zshrc

# 5. Verify Authentication
echo "\nInstallation complete! Verifying authentication..."
claude auth check

echo "\n======================================"
echo "Claude Code installation completed!"
echo "Start with: claude"
```

Run the script:

```bash
chmod +x install-claude-code.sh
./install-claude-code.sh
```

### Explanation

**Why Use Global Installation?**

Claude Code is not a per-project tool but a <strong>CLI tool used system-wide</strong>. Therefore, install it globally with the `-g` flag so you can use the `claude` command from any directory.

**Why Use Environment Variables**:

- <strong>Security</strong>: Don't hardcode API keys in code
- <strong>Portability</strong>: Easily switch between different environments (dev/staging/production)
- <strong>Version Control</strong>: Prevent key exposure by adding environment variable files to `.gitignore`

**API Key Management Best Practices**:

1. <strong>Never commit to public repositories</strong>
2. When using `.env` files, add to `.gitignore`
3. For team collaboration, provide `.env.example` template
4. In production, use CI/CD tools' secret management features

### Variations

#### Variation 1: Key Management Using .env Files

Create `.env` file in project root:

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-api03-...
CLAUDE_MODEL=claude-sonnet-4-5-20250929
CLAUDE_TIMEOUT=120000
```

Add to `.gitignore`:

```bash
# .gitignore
.env
.env.local
.env.*.local
```

Provide `.env.example` template:

```bash
# .env.example
ANTHROPIC_API_KEY=your_api_key_here
CLAUDE_MODEL=claude-sonnet-4-5-20250929
CLAUDE_TIMEOUT=120000
```

#### Variation 2: Managing Multiple API Keys (Dev/Production Separation)

```bash
# ~/.zshrc
export ANTHROPIC_API_KEY_DEV='sk-ant-dev-...'
export ANTHROPIC_API_KEY_PROD='sk-ant-prod-...'

# Activate development environment
alias claude-dev='ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY_DEV claude'

# Activate production environment
alias claude-prod='ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY_PROD claude'
```

Usage:

```bash
# Run in development environment
claude-dev

# Run in production environment
claude-prod
```

#### Variation 3: Installation in Docker Container

Containerize the project for consistent environment:

```dockerfile
# Dockerfile
FROM node:18-alpine

# Install Claude Code
RUN npm install -g @anthropic-ai/claude-code

# Set environment variable (injected at build time)
ARG ANTHROPIC_API_KEY
ENV ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY

# Set working directory
WORKDIR /workspace

# Entrypoint
ENTRYPOINT ["claude"]
```

Build and run:

```bash
# Build image
docker build --build-arg ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY -t claude-code .

# Run container
docker run -it -v $(pwd):/workspace claude-code
```

---

## Recipe 2.2: Project Initial Setup

### Problem

To use Claude Code in a new project, you need to properly configure the project structure and settings files. Basic settings alone may be insufficient for team collaboration, security, and performance optimization.

### Solution

Initialize a Claude Code project with the following structure:

```
my-project/
├── .claude/
│   ├── settings.json          # Project settings
│   ├── settings.local.json    # Local environment settings (git excluded)
│   ├── agents/                # Sub-agent definitions
│   ├── commands/              # Slash commands
│   ├── skills/                # Auto-discovery skills
│   └── guidelines/            # Guideline documents
├── .gitignore
├── CLAUDE.md                  # Project context document
└── README.md
```

#### Step 1: Project Initialization

```bash
# Create and navigate to project directory
mkdir my-project && cd my-project

# Initialize Git repository
git init

# Create Claude Code settings directory
mkdir -p .claude/{agents,commands,skills,guidelines}
```

#### Step 2: Write Basic Configuration Files

**`.claude/settings.json`** (included in version control):

```json
{
  "version": "1.0",
  "project": {
    "name": "my-project",
    "description": "Project description"
  },
  "model": {
    "name": "claude-sonnet-4-5-20250929",
    "temperature": 0.7,
    "max_tokens": 4096
  },
  "safety": {
    "sandboxMode": true,
    "allowedCommands": [
      "npm",
      "node",
      "git",
      "ls",
      "cat",
      "grep"
    ],
    "blockedPaths": [
      ".env",
      "credentials.json",
      "secrets/"
    ]
  },
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "typeCheck": true
  }
}
```

**`.claude/settings.local.json`** (local environment, git excluded):

```json
{
  "apiKey": "${ANTHROPIC_API_KEY}",
  "model": {
    "temperature": 0.5
  },
  "developer": {
    "debug": true,
    "verbose": true
  }
}
```

**`.gitignore`**:

```bash
# Environment variables
.env
.env.local
.env.*.local

# Claude Code local settings
.claude/settings.local.json
.claude/cache/
.claude/.history

# Node.js
node_modules/
npm-debug.log
yarn-error.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# Build output
dist/
build/
.astro/
```

#### Step 3: Write CLAUDE.md

A core document providing project context:

```markdown
# CLAUDE.md

This file is used by Claude Code to understand the project.

## Project Overview

Brief description: What does this project do?

## Technology Stack

- **Languages**: TypeScript, JavaScript
- **Framework**: Next.js 14
- **Database**: PostgreSQL
- **Deployment**: Vercel

## Architecture

- `src/app/` - Next.js App Router pages
- `src/components/` - Reusable React components
- `src/lib/` - Utilities and helper functions
- `src/types/` - TypeScript type definitions

## Commands

\```bash
# Run development server
npm run dev

# Production build
npm run build

# Type check
npm run type-check

# Test
npm test
\```

## Code Style

- Use ESLint + Prettier
- TypeScript strict mode enabled
- Prefer functional components
- Use Tailwind CSS

## Workflow

1. Create feature branch (`git checkout -b feature/name`)
2. Write and test code
3. Run type check and lint before committing
4. Create Pull Request
5. Merge after code review

## Important Notes

- Never commit API keys
- All external API calls must include error handling
- Image optimization required (use next/image)
```

### Code

Script to automate the entire initialization process:

```bash
#!/bin/bash
# init-claude-project.sh

PROJECT_NAME=$1

if [ -z "$PROJECT_NAME" ]; then
    echo "Usage: ./init-claude-project.sh <project-name>"
    exit 1
fi

echo "Initializing Claude Code project: $PROJECT_NAME"
echo "======================================"

# 1. Create project directory
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

# 2. Initialize Git
git init
echo "✓ Git repository initialized"

# 3. Create Claude directory structure
mkdir -p .claude/{agents,commands,skills,guidelines}
echo "✓ Claude directories created"

# 4. Create settings.json
cat > .claude/settings.json << 'EOF'
{
  "version": "1.0",
  "project": {
    "name": "PROJECT_NAME_PLACEHOLDER",
    "description": "Project description"
  },
  "model": {
    "name": "claude-sonnet-4-5-20250929",
    "temperature": 0.7,
    "max_tokens": 4096
  },
  "safety": {
    "sandboxMode": true,
    "allowedCommands": ["npm", "node", "git", "ls", "cat", "grep"],
    "blockedPaths": [".env", "credentials.json", "secrets/"]
  },
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "typeCheck": true
  }
}
EOF
sed -i '' "s/PROJECT_NAME_PLACEHOLDER/$PROJECT_NAME/g" .claude/settings.json
echo "✓ settings.json created"

# 5. Create settings.local.json
cat > .claude/settings.local.json << 'EOF'
{
  "apiKey": "${ANTHROPIC_API_KEY}",
  "developer": {
    "debug": true,
    "verbose": false
  }
}
EOF
echo "✓ settings.local.json created"

# 6. Create .gitignore
cat > .gitignore << 'EOF'
.env
.env.local
.env.*.local
.claude/settings.local.json
.claude/cache/
.claude/.history
node_modules/
dist/
build/
.astro/
.vscode/
.idea/
*.swp
EOF
echo "✓ .gitignore created"

# 7. Create CLAUDE.md
cat > CLAUDE.md << 'EOF'
# CLAUDE.md

## Project Overview

This project is...

## Technology Stack

- Language: TypeScript
- Framework: (to be added)

## Commands

\```bash
npm run dev    # Development server
npm run build  # Build
\```

## Architecture

(Project structure description)

## Code Style

- ESLint + Prettier
- TypeScript strict mode
EOF
echo "✓ CLAUDE.md created"

# 8. Create README.md
cat > README.md << EOF
# $PROJECT_NAME

Project description

## Getting Started

\```bash
npm install
npm run dev
\```

## Using Claude Code

This project uses Claude Code. See \`CLAUDE.md\` for details.
EOF
echo "✓ README.md created"

# 9. Initial commit
git add .
git commit -m "chore: initial Claude Code project setup"
echo "✓ Initial commit completed"

echo "\n======================================"
echo "Project initialization complete!"
echo "Start with: cd $PROJECT_NAME && claude"
```

Usage:

```bash
chmod +x init-claude-project.sh
./init-claude-project.sh my-awesome-project
```

### Explanation

**Role of CLAUDE.md**:

Claude Code automatically reads the `CLAUDE.md` file in the project root to understand the <strong>project context</strong>. This provides the following benefits:

1. <strong>Accurate code generation</strong>: Knows the project's code style, architecture, and technology stack
2. <strong>Consistent results</strong>: Same context shared among team members
3. <strong>Token savings</strong>: No need to repeat project descriptions

**Settings File Separation Strategy**:

- <strong>settings.json</strong>: Project settings shared by entire team (included in version control)
- <strong>settings.local.json</strong>: Individual developer's local settings (excluded from version control)

This allows personal information like API keys or debug settings to remain private while maintaining identical project standard settings across all team members.

**Importance of Sandbox Mode**:

The `sandboxMode: true` setting restricts Claude Code to <strong>execute only allowed commands</strong>. This prevents the following risks:

- Accidental file deletion (`rm -rf`)
- System settings changes
- Sensitive file access

### Variations

#### Variation 1: Monorepo Structure

For monorepos managing multiple packages:

```
monorepo/
├── .claude/
│   ├── settings.json          # Global settings
│   └── ...
├── packages/
│   ├── web/
│   │   ├── .claude/
│   │   │   └── settings.json  # web package settings
│   │   └── CLAUDE.md
│   └── api/
│       ├── .claude/
│       │   └── settings.json  # api package settings
│       └── CLAUDE.md
└── CLAUDE.md                  # Overall monorepo description
```

Root `CLAUDE.md`:

```markdown
# Monorepo Project

## Structure

- `packages/web/` - Frontend (Next.js)
- `packages/api/` - Backend (NestJS)

## Inter-Package Dependencies

web → api (API calls)

## Common Commands

\```bash
npm run build:all      # Build all packages
npm run test:all       # Test all packages
npm run dev:web        # Run web package only
npm run dev:api        # Run api package only
\```
```

#### Variation 2: Multi-language Project

For managing multi-language content like blogs:

```markdown
# CLAUDE.md

## Multi-language Support

This project supports 4 languages: Korean(ko), English(en), Japanese(ja), Chinese(zh)

### Content Structure

\```
src/content/blog/
├── ko/post-name.md    # Korean
├── en/post-name.md    # English
├── ja/post-name.md    # Japanese
└── zh/post-name.md    # Chinese
\```

### Blog Post Writing Rules

1. Write all language versions simultaneously
2. Keep filenames identical
3. Use 'YYYY-MM-DD' format for pubDate
4. Share heroImage across all language versions

### /write-post Command

All 4 language versions must be written when creating blog posts.
```

---

## Recipe 2.3: Recommended Configuration Options

### Problem

Basic settings alone make it difficult to build an optimized development environment suited to the project's characteristics. Appropriate setting adjustments are needed according to project type (web app, CLI tool, library, etc.) and team size.

### Solution

Maximize productivity by utilizing Claude Code's advanced configuration options.

#### 1. Model Configuration Optimization

Model selection based on project characteristics:

```json
{
  "model": {
    "name": "claude-sonnet-4-5-20250929",
    "temperature": 0.7,
    "max_tokens": 4096,
    "top_p": 0.9
  }
}
```

<strong>Model Use Cases</strong>:

| Model | Use Case | Recommended Temperature |
|------|----------|------------------------|
| Claude Opus 4.5 | Complex architecture design, refactoring | 0.5〜0.7 |
| Claude Sonnet 4.5 | General code generation, bug fixes | 0.7〜0.9 |
| Claude Haiku | Simple tasks, quick response needed | 0.8〜1.0 |

<strong>Temperature Guide</strong>:

- <strong>0.0〜0.3</strong>: Deterministic, consistent output (test code, documentation)
- <strong>0.4〜0.7</strong>: Balanced, creative yet stable (general coding)
- <strong>0.8〜1.0</strong>: Creative, exploring diverse solutions (idea brainstorming)

#### 2. Safety and Permission Settings

**Security-focused configuration** (.claude/settings.json):

```json
{
  "safety": {
    "sandboxMode": true,
    "allowedCommands": [
      "npm",
      "node",
      "git status",
      "git diff",
      "git log",
      "ls",
      "cat",
      "grep",
      "find"
    ],
    "blockedCommands": [
      "rm -rf",
      "sudo",
      "chmod 777",
      "curl | sh"
    ],
    "blockedPaths": [
      ".env",
      ".env.local",
      "credentials.json",
      "secrets/",
      "private/",
      ".ssh/"
    ],
    "readOnlyPaths": [
      "node_modules/",
      "dist/",
      "build/"
    ],
    "maxFileSize": "10MB",
    "allowNetworkAccess": false
  }
}
```

**Configuration Explanation**:

- <strong>allowedCommands</strong>: Execute only permitted commands (whitelist approach)
- <strong>blockedCommands</strong>: Commands that must never be executed (blacklist)
- <strong>blockedPaths</strong>: Access-denied paths (protecting sensitive information)
- <strong>readOnlyPaths</strong>: Read-only paths (dependency folders, etc.)
- <strong>allowNetworkAccess</strong>: Allow external network access

#### 3. Feature Flag Settings

Activate features matching project workflow:

```json
{
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "typeCheck": true,
    "linting": true,
    "testing": true,
    "documentation": true,
    "i18n": {
      "enabled": true,
      "languages": ["ko", "en", "ja", "zh"],
      "defaultLanguage": "ko"
    },
    "mcp": {
      "enabled": true,
      "servers": ["context7", "brave-search", "playwright"]
    }
  }
}
```

<strong>Feature Descriptions</strong>:

- <strong>autoCommit</strong>: Auto-commit changes (false recommended, encourages explicit commits)
- <strong>codeReview</strong>: Auto-suggest reviews after code writing
- <strong>typeCheck</strong>: Auto-run type checking for TypeScript projects
- <strong>linting</strong>: Auto-run ESLint
- <strong>testing</strong>: Auto-run related tests after code changes
- <strong>documentation</strong>: Auto-generate JSDoc/TSDoc comments
- <strong>i18n</strong>: Enable multi-language support
- <strong>mcp</strong>: Model Context Protocol server integration

#### 4. Performance Optimization Settings

```json
{
  "performance": {
    "caching": {
      "enabled": true,
      "ttl": 3600,
      "maxSize": "500MB"
    },
    "parallelization": {
      "enabled": true,
      "maxConcurrency": 4
    },
    "timeout": {
      "default": 120000,
      "read": 30000,
      "write": 60000,
      "bash": 120000
    }
  }
}
```

<strong>Optimization Tips</strong>:

- <strong>caching.ttl</strong>: Cache validity time (seconds). Set lower for rapidly changing projects
- <strong>maxConcurrency</strong>: Number of parallel tasks. Adjust to CPU core count
- <strong>timeout</strong>: Per-task timeout. Set longer for complex builds

### Code

Recommended configuration templates by project type:

#### Web Application (Next.js, Astro, etc.)

```json
{
  "version": "1.0",
  "project": {
    "name": "web-app",
    "type": "web-application",
    "framework": "nextjs"
  },
  "model": {
    "name": "claude-sonnet-4-5-20250929",
    "temperature": 0.7
  },
  "safety": {
    "sandboxMode": true,
    "allowedCommands": ["npm", "node", "git", "ls", "cat", "grep", "curl"],
    "blockedPaths": [".env", ".env.local", "credentials.json"]
  },
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "typeCheck": true,
    "linting": true,
    "testing": true,
    "i18n": {
      "enabled": true,
      "languages": ["ko", "en"]
    },
    "mcp": {
      "enabled": true,
      "servers": ["playwright", "chrome-devtools"]
    }
  },
  "performance": {
    "timeout": {
      "default": 120000,
      "bash": 180000
    }
  }
}
```

#### CLI Tool / Library

```json
{
  "version": "1.0",
  "project": {
    "name": "cli-tool",
    "type": "library",
    "language": "typescript"
  },
  "model": {
    "name": "claude-sonnet-4-5-20250929",
    "temperature": 0.5
  },
  "safety": {
    "sandboxMode": true,
    "allowedCommands": ["npm", "node", "git", "jest", "vitest"],
    "blockedPaths": [".npmrc", "secrets/"]
  },
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "typeCheck": true,
    "testing": true,
    "documentation": true
  },
  "performance": {
    "caching": {
      "enabled": true,
      "ttl": 7200
    }
  }
}
```

#### Data Science / Machine Learning

```json
{
  "version": "1.0",
  "project": {
    "name": "ml-project",
    "type": "data-science",
    "language": "python"
  },
  "model": {
    "name": "claude-opus-4-5-20251101",
    "temperature": 0.6
  },
  "safety": {
    "sandboxMode": true,
    "allowedCommands": ["python", "pip", "jupyter", "git", "ls"],
    "blockedPaths": ["data/raw/", "credentials/"]
  },
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "documentation": true,
    "notebooks": {
      "enabled": true,
      "autosave": true
    }
  },
  "performance": {
    "timeout": {
      "default": 300000,
      "bash": 600000
    }
  }
}
```

### Explanation

**Project Type-Specific Optimization Strategy**:

1. <strong>Web Applications</strong>:
   - Browser automation with MCP servers (Playwright, Chrome DevTools)
   - Multi-language content management via i18n activation
   - Longer timeouts (considering build time)

2. <strong>CLI Tools/Libraries</strong>:
   - Activate documentation feature (important for public API documentation)
   - Lower temperature (consistent code generation)
   - Longer caching TTL (fewer dependency changes)

3. <strong>Data Science</strong>:
   - Use Opus model (complex analysis and algorithms)
   - Longer timeouts (considering data processing time)
   - Jupyter notebook support

**Performance vs Security Balance**:

- <strong>Early Development</strong>: Looser sandbox, rapid iteration
- <strong>Production Preparation</strong>: Stricter sandbox, thorough validation
- <strong>Team Collaboration</strong>: Medium level, consistent rules

### Variations

#### Variation 1: Environment-Specific Settings Separation

Settings for dev/staging/production environments:

```bash
.claude/
├── settings.json                # Common settings
├── settings.development.json    # Development environment
├── settings.staging.json        # Staging environment
└── settings.production.json     # Production environment
```

Environment switching:

```bash
# Development environment
export CLAUDE_ENV=development
claude

# Production environment
export CLAUDE_ENV=production
claude
```

`settings.development.json`:

```json
{
  "extends": "./settings.json",
  "model": {
    "temperature": 0.9
  },
  "safety": {
    "sandboxMode": false
  },
  "developer": {
    "debug": true,
    "verbose": true
  }
}
```

`settings.production.json`:

```json
{
  "extends": "./settings.json",
  "model": {
    "temperature": 0.5
  },
  "safety": {
    "sandboxMode": true,
    "allowedCommands": ["git status", "git diff", "ls", "cat"]
  },
  "features": {
    "autoCommit": false
  }
}
```

#### Variation 2: Settings by Team Size

**Small Team (1〜3 people)**:

```json
{
  "safety": {
    "sandboxMode": false
  },
  "features": {
    "autoCommit": true,
    "codeReview": false
  }
}
```

**Medium Team (4〜10 people)**:

```json
{
  "safety": {
    "sandboxMode": true,
    "allowedCommands": ["npm", "git", "ls", "cat", "grep"]
  },
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "linting": true
  }
}
```

**Large Team (10+ people)**:

```json
{
  "safety": {
    "sandboxMode": true,
    "allowedCommands": ["git status", "git diff", "ls", "cat"],
    "requireApproval": true
  },
  "features": {
    "autoCommit": false,
    "codeReview": true,
    "linting": true,
    "testing": true,
    "ciIntegration": true
  },
  "workflow": {
    "requirePullRequest": true,
    "requireCodeReview": 2,
    "branchProtection": ["main", "develop"]
  }
}
```

---

## Summary

This chapter covered step-by-step how to build a perfect Claude Code environment:

1. <strong>Recipe 2.1 (Installation and Authentication)</strong>:
   - Check Node.js environment
   - Global installation via npm
   - API key issuance and environment variable setup
   - Authentication verification

2. <strong>Recipe 2.2 (Project Initial Setup)</strong>:
   - Create `.claude/` directory structure
   - Write `settings.json` and `settings.local.json`
   - Provide project context with `CLAUDE.md`
   - Protect sensitive information with `.gitignore` setup

3. <strong>Recipe 2.3 (Recommended Configuration Options)</strong>:
   - Optimize model and temperature by project type
   - Sandbox mode and permission settings
   - Feature flag activation
   - Performance optimization (caching, parallelization, timeout)

Next chapter covers <strong>basic usage</strong> in this configured environment and learning how to utilize Claude Code in practice.

---

**Next Chapter Preview**:

In Chapter 3, we'll practice Claude Code's core features including <strong>interactive coding</strong>, <strong>file read/write</strong>, and <strong>Git integration</strong>. We'll create a simple TODO app from scratch with Claude Code to master the practical workflow.
