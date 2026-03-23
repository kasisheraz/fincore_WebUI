# Confluence & Jira Automation Plan for Fincore

**Goal**: Automatic documentation updates when architecture or code changes occur

---

## 🎯 Integration Options

### Option 1: **Atlassian REST API Integration** (Recommended)
Direct API calls from GitHub Actions to Confluence/Jira

**Pros**:
- ✅ Full control over content
- ✅ Automated via CI/CD
- ✅ Works with existing GitHub Actions
- ✅ No manual intervention needed

**Cons**:
- ❌ Requires API token setup
- ❌ Need to write automation scripts

### Option 2: **Custom MCP Server for Confluence**
Build a Model Context Protocol server for Confluence

**Pros**:
- ✅ Native AI agent integration
- ✅ Reusable across projects
- ✅ Direct from VS Code/Copilot

**Cons**:
- ❌ Development time required (2-3 days)
- ❌ Maintenance overhead

### Option 3: **Confluence Automation Rules**
Use Confluence's built-in automation

**Pros**:
- ✅ No coding required
- ✅ Native to Confluence

**Cons**:
- ❌ Limited to Confluence events
- ❌ Can't trigger from GitHub

---

## 🚀 Recommended Approach: Atlassian REST API + GitHub Actions

### Architecture

```
┌─────────────────┐
│  GitHub Repo    │
│  (Code Changes) │
└────────┬────────┘
         │
         │ Push/PR Merge
         ▼
┌─────────────────┐
│ GitHub Actions  │
│  Workflow       │
└────────┬────────┘
         │
         │ 1. Run tests
         │ 2. Build artifacts
         │ 3. Generate docs
         │ 4. Call Confluence API
         ▼
┌─────────────────┐
│  Confluence API │
│  Update Pages   │
└─────────────────┘
```

---

## 📋 Implementation Plan

### Phase 1: Setup Atlassian API Access (15 minutes)

#### Step 1: Create API Token
1. Go to: https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Name it: `fincore-automation`
4. Copy the token (save it securely!)

#### Step 2: Get Your Confluence Details
```bash
# Your Confluence details
CONFLUENCE_URL="https://fincoredesign.atlassian.net/wiki"
CONFLUENCE_USER="your-email@example.com"
CONFLUENCE_API_TOKEN="<token-from-step-1>"

# Find your space key
# Visit: https://fincoredesign.atlassian.net/wiki/spaces
# Space key is in the URL: /wiki/spaces/FINCORE/...
CONFLUENCE_SPACE_KEY="FINCORE"
```

#### Step 3: Store in GitHub Secrets
```bash
# In each repository, add these secrets:
# Settings → Secrets and variables → Actions → New repository secret

CONFLUENCE_URL: https://fincoredesign.atlassian.net/wiki
CONFLUENCE_USER: your-email@example.com
CONFLUENCE_API_TOKEN: <your-token>
CONFLUENCE_SPACE_KEY: FINCORE
```

### Phase 2: Create Documentation Generator Script (30 minutes)

Create `.github/scripts/update-confluence.js`:

```javascript
#!/usr/bin/env node
const axios = require('axios');
const fs = require('fs');

// Configuration from environment variables
const CONFLUENCE_URL = process.env.CONFLUENCE_URL;
const CONFLUENCE_USER = process.env.CONFLUENCE_USER;
const CONFLUENCE_TOKEN = process.env.CONFLUENCE_API_TOKEN;
const SPACE_KEY = process.env.CONFLUENCE_SPACE_KEY;

// Base64 encode credentials for Basic Auth
const auth = Buffer.from(`${CONFLUENCE_USER}:${CONFLUENCE_TOKEN}`).toString('base64');

const confluence = axios.create({
  baseURL: `${CONFLUENCE_URL}/rest/api`,
  headers: {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

/**
 * Convert Markdown to Confluence Storage Format
 * Note: For full conversion, use a library like 'markdown-to-confluence'
 */
function markdownToConfluence(markdown) {
  // Simple conversion (for production, use a proper library)
  let html = markdown
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\`\`\`(.*?)\n([\s\S]*?)\`\`\`/g, '<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">$1</ac:parameter><ac:plain-text-body><![CDATA[$2]]></ac:plain-text-body></ac:structured-macro>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>');
  
  return html;
}

/**
 * Find or create a page by title
 */
async function findOrCreatePage(spaceKey, title, parentId = null) {
  try {
    // Try to find existing page
    const searchResponse = await confluence.get('/content', {
      params: {
        spaceKey,
        title,
        expand: 'version,ancestors'
      }
    });

    if (searchResponse.data.results.length > 0) {
      return searchResponse.data.results[0];
    }

    // Create new page if not found
    const createData = {
      type: 'page',
      title,
      space: { key: spaceKey },
      body: {
        storage: {
          value: '<p>Page created automatically. Content will be updated shortly.</p>',
          representation: 'storage'
        }
      }
    };

    if (parentId) {
      createData.ancestors = [{ id: parentId }];
    }

    const createResponse = await confluence.post('/content', createData);
    return createResponse.data;
  } catch (error) {
    console.error(`Error finding/creating page "${title}":`, error.response?.data || error.message);
    throw error;
  }
}

/**
 * Update page content
 */
async function updatePage(pageId, title, content, currentVersion) {
  try {
    const updateData = {
      version: {
        number: currentVersion + 1
      },
      title,
      type: 'page',
      body: {
        storage: {
          value: content,
          representation: 'storage'
        }
      }
    };

    const response = await confluence.put(`/content/${pageId}`, updateData);
    console.log(`✅ Updated page: ${title} (version ${currentVersion + 1})`);
    return response.data;
  } catch (error) {
    console.error(`Error updating page "${title}":`, error.response?.data || error.message);
    throw error;
  }
}

/**
 * Main function to update documentation
 */
async function updateDocumentation() {
  try {
    console.log('🚀 Starting Confluence documentation update...');

    // 1. Find or create parent page
    const parentPage = await findOrCreatePage(SPACE_KEY, 'Fincore Platform');
    console.log(`📄 Parent page: ${parentPage.title} (ID: ${parentPage.id})`);

    // 2. Read documentation files
    const docs = [
      { file: 'confluence/01-PLATFORM-OVERVIEW.md', title: 'Platform Overview' },
      { file: 'confluence/02-ARCHITECTURE.md', title: 'Architecture' },
      { file: 'confluence/03-GETTING-STARTED.md', title: 'Getting Started' },
      { file: 'confluence/04-API-DOCUMENTATION.md', title: 'API Documentation' },
      { file: 'confluence/05-TESTING-GUIDE.md', title: 'Testing Guide' },
      { file: 'confluence/06-DEPLOYMENT-GUIDE.md', title: 'Deployment Guide' }
    ];

    // 3. Update each page
    for (const doc of docs) {
      if (!fs.existsSync(doc.file)) {
        console.log(`⏭️  Skipping ${doc.title} (file not found)`);
        continue;
      }

      const markdown = fs.readFileSync(doc.file, 'utf-8');
      const confluenceHtml = markdownToConfluence(markdown);

      const page = await findOrCreatePage(SPACE_KEY, doc.title, parentPage.id);
      await updatePage(page.id, doc.title, confluenceHtml, page.version.number);
    }

    console.log('✅ Documentation update complete!');
    console.log(`🔗 View at: ${CONFLUENCE_URL}/spaces/${SPACE_KEY}`);
  } catch (error) {
    console.error('❌ Documentation update failed:', error);
    process.exit(1);
  }
}

// Run the script
updateDocumentation();
```

### Phase 3: Create GitHub Actions Workflow (15 minutes)

Create `.github/workflows/update-confluence.yml`:

```yaml
name: Update Confluence Documentation

on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'confluence/**'
      - 'README.md'
      - '.github/workflows/**'
  workflow_dispatch: # Allow manual trigger

jobs:
  update-docs:
    name: Update Confluence Pages
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Get full history for changelog

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          npm install axios markdown-to-confluence

      - name: Generate Architecture Docs
        run: |
          # Generate architecture documentation from code
          node .github/scripts/generate-architecture.js

      - name: Generate API Docs
        run: |
          # Generate API documentation from OpenAPI/Swagger
          node .github/scripts/generate-api-docs.js

      - name: Generate Test Report
        run: |
          # Generate test coverage report
          npm run test:coverage
          node .github/scripts/generate-test-report.js

      - name: Update Confluence
        env:
          CONFLUENCE_URL: ${{ secrets.CONFLUENCE_URL }}
          CONFLUENCE_USER: ${{ secrets.CONFLUENCE_USER }}
          CONFLUENCE_API_TOKEN: ${{ secrets.CONFLUENCE_API_TOKEN }}
          CONFLUENCE_SPACE_KEY: ${{ secrets.CONFLUENCE_SPACE_KEY }}
        run: |
          node .github/scripts/update-confluence.js

      - name: Create Jira Issue if Update Fails
        if: failure()
        env:
          JIRA_URL: ${{ secrets.JIRA_URL }}
          JIRA_USER: ${{ secrets.JIRA_USER }}
          JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}
        run: |
          node .github/scripts/create-jira-issue.js \
            --title "Documentation update failed" \
            --description "GitHub Actions workflow failed to update Confluence" \
            --priority "High"
```

### Phase 4: Add to All 3 Repositories

Apply the same workflow to all repositories:
- ✅ `fincore_WebUI` (frontend)
- ✅ `userManagementApi` (backend)
- ✅ `fincore_Iasc` (infrastructure)

Each will update its own section in Confluence.

---

## 🤖 Advanced: Agentic AI Integration

### Option A: Custom MCP Server (Reusable)

Create a reusable MCP server for Confluence:

**Project Structure**:
```
confluence-mcp-server/
├── package.json
├── src/
│   ├── index.ts           # MCP server entry point
│   ├── confluence.ts      # Confluence API wrapper
│   └── tools/
│       ├── create-page.ts
│       ├── update-page.ts
│       ├── search-pages.ts
│       └── upload-attachment.ts
└── README.md
```

**MCP Server Implementation** (TypeScript):

```typescript
// src/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ConfluenceClient } from './confluence.js';

const server = new Server(
  {
    name: 'confluence-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize Confluence client
const confluence = new ConfluenceClient({
  url: process.env.CONFLUENCE_URL!,
  user: process.env.CONFLUENCE_USER!,
  token: process.env.CONFLUENCE_API_TOKEN!,
});

// Tool: Create Confluence Page
server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'confluence_create_page') {
    const { spaceKey, title, content, parentId } = request.params.arguments;
    const result = await confluence.createPage(spaceKey, title, content, parentId);
    return {
      content: [{ type: 'text', text: `Page created: ${result.title}` }],
    };
  }

  if (request.params.name === 'confluence_update_page') {
    const { pageId, title, content } = request.params.arguments;
    const result = await confluence.updatePage(pageId, title, content);
    return {
      content: [{ type: 'text', text: `Page updated: ${result.title}` }],
    };
  }

  if (request.params.name === 'confluence_search_pages') {
    const { spaceKey, query } = request.params.arguments;
    const results = await confluence.searchPages(spaceKey, query);
    return {
      content: [{ type: 'text', text: JSON.stringify(results, null, 2) }],
    };
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Start server
const transport = new StdioServerTransport();
server.connect(transport);
```

**Add to VS Code Settings** (`.vscode/settings.json`):

```json
{
  "github.copilot.chat.codeGeneration.useInstructionFiles": true,
  "github.copilot.chat.mcpServers": {
    "confluence": {
      "command": "node",
      "args": ["path/to/confluence-mcp-server/dist/index.js"],
      "env": {
        "CONFLUENCE_URL": "https://fincoredesign.atlassian.net/wiki",
        "CONFLUENCE_USER": "your-email@example.com",
        "CONFLUENCE_API_TOKEN": "${env:CONFLUENCE_API_TOKEN}"
      }
    }
  }
}
```

### Option B: GitHub Copilot Agent with Confluence Skills

Create a custom agent skill for Confluence operations:

**File**: `.github/copilot/skills/confluence-update/SKILL.md`

```markdown
---
name: confluence-update
description: Updates Confluence documentation pages automatically when code or architecture changes
invocation: Use when documentation needs to be synchronized with codebase changes
---

# Confluence Documentation Update Skill

## Purpose
Automatically update Confluence pages when code, architecture, or documentation changes.

## When to Invoke
- After significant code changes
- When architecture diagrams are updated
- When API endpoints change
- When test coverage reports are generated
- On release/deployment

## Required Tools
- `fetch_webpage`: Read current Confluence pages
- `run_in_terminal`: Execute Confluence API calls via curl/scripts

## Process
1. Detect what changed (file paths, git diff)
2. Determine which Confluence pages need updates
3. Generate updated content from codebase
4. Call Confluence API to update pages
5. Verify updates successful
6. Report summary

## Example Usage
"Update Confluence with latest architecture changes"
"Sync API documentation to Confluence"
"Update test coverage dashboard in Confluence"
```

---

## 🔄 Automated Workflows

### Workflow 1: **Architecture Changes → Confluence**

**Trigger**: Changes to architecture files
**Action**: Update Architecture page in Confluence

```yaml
on:
  push:
    paths:
      - 'docs/architecture/**'
      - 'terraform/**'
      - 'src/architecture/**'
```

### Workflow 2: **Test Results → Confluence**

**Trigger**: Test completion
**Action**: Update Test Dashboard page

```yaml
on:
  workflow_run:
    workflows: ["CI/CD Pipeline"]
    types: [completed]
```

### Workflow 3: **API Changes → Confluence + Jira**

**Trigger**: API endpoint changes
**Action**: 
1. Update API Documentation in Confluence
2. Create Jira ticket to notify stakeholders

```yaml
on:
  push:
    paths:
      - 'src/controllers/**'
      - 'src/routes/**'
      - 'openapi.yaml'
```

---

## 📊 Monitoring & Notifications

### Slack Integration

Add to workflow:
```yaml
- name: Notify Slack
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "📚 Documentation updated in Confluence",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "*Documentation Updated*\n• Platform Overview\n• Architecture\n• API Documentation"
            }
          }
        ]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Jira Integration

Create issues for review:
```javascript
async function createJiraIssue(title, description) {
  await axios.post(
    `${JIRA_URL}/rest/api/3/issue`,
    {
      fields: {
        project: { key: 'FINCORE' },
        summary: title,
        description: {
          type: 'doc',
          version: 1,
          content: [{ type: 'paragraph', content: [{ type: 'text', text: description }] }]
        },
        issuetype: { name: 'Task' },
        labels: ['documentation', 'auto-generated']
      }
    },
    {
      auth: {
        username: JIRA_USER,
        password: JIRA_API_TOKEN
      }
    }
  );
}
```

---

## 📝 Implementation Checklist

### Setup (1 hour)
- [ ] Create Atlassian API token
- [ ] Add GitHub Secrets to all 3 repos
- [ ] Install required dependencies (`axios`, `markdown-to-confluence`)

### Scripts (2-3 hours)
- [ ] Create `update-confluence.js` script
- [ ] Create `generate-architecture.js` script
- [ ] Create `generate-api-docs.js` script
- [ ] Create `generate-test-report.js` script
- [ ] Create `create-jira-issue.js` script

### Workflows (1 hour)
- [ ] Add `update-confluence.yml` to fincore_WebUI
- [ ] Add `update-confluence.yml` to userManagementApi
- [ ] Add `update-confluence.yml` to fincore_Iasc
- [ ] Test each workflow manually

### Documentation (2 hours)
- [ ] Create all Confluence markdown files
- [ ] Test markdown to Confluence conversion
- [ ] Create page hierarchy in Confluence
- [ ] Verify automatic updates work

### Optional (3-4 hours)
- [ ] Build custom MCP server for Confluence
- [ ] Add Slack notifications
- [ ] Add Jira integration
- [ ] Create monitoring dashboard

---

## 💰 Cost Estimate

- **Atlassian API**: Free (included in Confluence Cloud)
- **GitHub Actions**: Free for public repos, $0.008/minute for private
- **Development Time**: 6-10 hours total
- **Maintenance**: ~1 hour/month

---

## 🎯 Expected Outcome

After implementation:

✅ **Automatic Updates**: Confluence pages update when code changes
✅ **No Manual Work**: Documentation stays in sync automatically
✅ **Version Control**: All docs in Git, Confluence mirrors them
✅ **Audit Trail**: Every update tracked in GitHub Actions logs
✅ **Notifications**: Team alerted when docs updated
✅ **Jira Integration**: Issues created for review when needed

---

## 🚀 Quick Start Command

Want me to implement this now? I can:

1. ✅ Create all necessary scripts
2. ✅ Set up GitHub Actions workflows
3. ✅ Generate Confluence documentation files
4. ✅ Create setup instructions

**Just confirm and I'll build the complete automation system!**
