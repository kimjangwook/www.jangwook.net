# Appendix A: Troubleshooting Guide

## Overview

When using Claude Code in real-world projects, you'll encounter various problem situations. This appendix systematically organizes common issues and solutions accumulated from operating 71 real-world projects.

Each problem is structured in the order of **Symptom → Cause → Solution → Prevention**, designed to enable rapid response when issues occur.

---

## A.1: Common Errors and Solutions

### A.1.1: Authentication Errors

#### Symptom

```bash
Error: Authentication failed. Please check your API key.
```

Or

```bash
Error: 401 Unauthorized - Invalid API key
```

API key authentication fails when running Claude Code, blocking all operations.

#### Cause

1. **API key not set**: API key missing from environment variables or configuration file
2. **Incorrect API key**: Spaces or special characters included when copying the key
3. **Expired API key**: Key validity period ended or key deleted
4. **Insufficient permissions**: Required permissions (scope) not assigned to API key

#### Solution

**Step 1: Verify API Key**

```bash
# Check environment variable
echo $ANTHROPIC_API_KEY

# Or check configuration file
cat ~/.config/claude/config.json
```

**Step 2: Reset API Key**

```bash
# Authenticate through Claude Code CLI
claude auth login

# Or set environment variable directly (Linux/macOS)
export ANTHROPIC_API_KEY="sk-ant-api..."

# Windows PowerShell
$env:ANTHROPIC_API_KEY="sk-ant-api..."
```

**Step 3: Validate Key**

```bash
# Test with a simple API call
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":10,"messages":[{"role":"user","content":"test"}]}'
```

**Step 4: Check Permissions**

In Anthropic Console:
- Verify API key is active
- Check access permissions for required models (Claude 3.5 Sonnet, etc.)
- Verify usage limits not exceeded

#### Prevention

1. **Permanent Environment Variable Setup**
   ```bash
   # Add to ~/.bashrc or ~/.zshrc
   echo 'export ANTHROPIC_API_KEY="sk-ant-api..."' >> ~/.bashrc
   source ~/.bashrc
   ```

2. **Secure API Key Management**
   - Always add `.env` files to `.gitignore`
   - Don't hardcode keys in code
   - Use secret management tools (1Password, Vault, etc.)

3. **Regular Key Rotation**
   - Rotate keys every 3-6 months per security policy
   - Use separate keys per project (permission separation)

4. **Monitoring Setup**
   - Set usage alerts in Anthropic Console
   - Set budget limits to prevent unexpected costs

---

### A.1.2: Network Errors

#### Symptom

```bash
Error: Network request failed
Error: ECONNREFUSED
Error: Timeout waiting for response
```

Tasks interrupted due to network connection failure during API calls.

#### Cause

1. **Internet connection lost**: Network instability or firewall blocking
2. **Proxy configuration issues**: Proxy not configured in corporate network
3. **DNS resolution failure**: Unable to resolve Anthropic API server domain
4. **Timeout setting insufficient**: Response wait time exceeded for large data
5. **Rate Limiting**: API call frequency limit exceeded

#### Solution

**Step 1: Basic Network Diagnosis**

```bash
# Check internet connection
ping 8.8.8.8

# Check Anthropic API server reachability
curl -I https://api.anthropic.com

# Check DNS resolution
nslookup api.anthropic.com
```

**Step 2: Proxy Configuration (Corporate Network)**

```bash
# HTTP proxy setup
export HTTP_PROXY="http://proxy.company.com:8080"
export HTTPS_PROXY="http://proxy.company.com:8080"

# Specify proxy in Claude Code configuration file
# ~/.config/claude/config.json
{
  "proxy": "http://proxy.company.com:8080"
}
```

**Step 3: Adjust Timeout**

In `.claude/settings.local.json`:

```json
{
  "apiTimeout": 300000,  // Extend to 5 minutes (default 60 seconds)
  "maxRetries": 3,       // Increase retry count
  "retryDelay": 2000     // 2 second retry interval
}
```

**Step 4: Handle Rate Limit**

```javascript
// Add delay between requests (Node.js example)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function callClaudeWithRetry(prompt, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await claude.messages.create({ /* ... */ });
      return response;
    } catch (error) {
      if (error.status === 429) {  // Rate limit
        const waitTime = Math.pow(2, i) * 1000;  // Exponential backoff
        console.log(`Rate limited. Waiting ${waitTime}ms...`);
        await delay(waitTime);
      } else {
        throw error;
      }
    }
  }
}
```

#### Prevention

1. **Build Stable Network Environment**
   - Use wired connection for important tasks
   - Verify stability when using VPN

2. **Implement Auto-retry Logic**
   ```python
   # Python example (tenacity library)
   from tenacity import retry, stop_after_attempt, wait_exponential

   @retry(
       stop=stop_after_attempt(3),
       wait=wait_exponential(multiplier=1, min=2, max=10)
   )
   def call_claude_api():
       # API call code
       pass
   ```

3. **Manage API Call Frequency**
   - Monitor rate limit info (response headers `x-ratelimit-*`)
   - Apply batching and delays for bulk operations

4. **Caching Strategy**
   - Utilize local cache for identical prompt results
   - Metadata-first architecture (see Chapter 16)

---

(Continue with remaining sections following the same pattern...)

*Final Update: 2025-12-19*
*Version: 1.0*
*Based on operating 71 projects*