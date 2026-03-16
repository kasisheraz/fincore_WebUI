# 🚀 Quick Start: Agentic AI SDLC - Day 1 Guide

**Goal**: Get your agentic AI SDLC automation up and running in the next 2 hours!

---

## ⚡ What We'll Accomplish Today

1. Set up repository structure
2. Create your first AI workflow (Story Analyzer)
3. Test with a real issue
4. See AI automation in action!

---

## 📋 Prerequisites (5 minutes)

### Verify Access
```powershell
# Check GitHub CLI access
gh auth status

# Check you can push to repos
gh repo view kasisheraz/fincore_WebUI
gh repo view kasisheraz/userManagementApi
gh repo view kasisheraz/fincore_Iasc

# Check GCP access (if needed)
gcloud auth list
```

### Install Tools (if not already installed)
```powershell
# GitHub CLI
winget install GitHub.cli

# Node.js (for testing)
winget install OpenJS.NodeJS.LTS
```

---

## 🏗️ Step 1: Repository Structure (20 minutes)

### For Each Repository

I'll show you for `fincore_WebUI` first (your current workspace), then you'll repeat for the other two.

#### A. Create Directory Structure

```powershell
# Navigate to your repo
cd c:\Development\git\fincore_WebUI

# Create GitHub directories
New-Item -ItemType Directory -Force -Path ".github/workflows"
New-Item -ItemType Directory -Force -Path ".github/ISSUE_TEMPLATE"  
New-Item -ItemType Directory -Force -Path ".github/actions"

# Create docs directories
New-Item -ItemType Directory -Force -Path "docs/adr"
New-Item -ItemType Directory -Force -Path "docs/architecture"
New-Item -ItemType Directory -Force -Path "docs/runbooks"
New-Item -ItemType Directory -Force -Path "docs/agents"
```

#### B. Create Issue Template for Stories

Create `.github/ISSUE_TEMPLATE/story.yml`:

```yaml
name: 📖 User Story
description: Create a new user story for feature development
title: "[STORY] "
labels: ["type:story", "ai:story-analysis"]
body:
  - type: markdown
    attributes:
      value: |
        ## User Story Template
        This will be automatically analyzed by our AI Story Analyzer agent.

  - type: textarea
    id: user-story
    attributes:
      label: User Story
      description: "As a [user], I want [feature], so that [benefit]"
      placeholder: |
        As a system administrator,
        I want to manage user permissions,
        So that I can control access to sensitive features
    validations:
      required: true

  - type: textarea
    id: acceptance-criteria
    attributes:
      label: Acceptance Criteria
      description: What must be true for this story to be complete?
      placeholder: |
        - [ ] User can view list of all users
        - [ ] User can edit permissions for each user
        - [ ] Changes are saved to database
        - [ ] Audit log is created
    validations:
      required: true

  - type: textarea
    id: technical-notes
    attributes:
      label: Technical Notes
      description: Any technical details, constraints, or considerations
      placeholder: |
        - Affects: Backend API, Frontend UI
        - Database changes: Yes (new permissions table)
        - Breaking changes: No

  - type: dropdown
    id: complexity
    attributes:
      label: Estimated Complexity
      options:
        - Low (< 1 day)
        - Medium (1-3 days)
        - High (> 3 days)
        - Unknown
    validations:
      required: true

  - type: checkboxes
    id: affected-repos
    attributes:
      label: Affected Repositories
      options:
        - label: Backend (userManagementApi)
        - label: Frontend (fincore_WebUI)
        - label: Infrastructure (fincore_Iasc)
```

#### C. Create Labels Script

Create `.github/scripts/create-labels.ps1`:

```powershell
# AI Workflow Labels
gh label create "ai:story-analysis" --description "AI analyzing story" --color "1d76db" --force
gh label create "ai:architecture" --description "AI designing architecture" --color "5319e7" --force
gh label create "ai:development" --description "AI developing code" --color "0e8a16" --force
gh label create "ai:testing" --description "AI running tests" --color "fbca04" --force
gh label create "ai:documentation" --description "AI updating docs" --color "f9d0c4" --force
gh label create "ai:review-needed" --description "Human review required" --color "d93f0b" --force
gh label create "ai:approved" --description "AI approved changes" --color "0e8a16" --force

# Environment Labels
gh label create "environment:npe" --description "Non-production environment" --color "ededed" --force
gh label create "environment:staging" --description "Staging environment" --color "bfd4f2" --force
gh label create "environment:production" --description "Production environment" --color "d93f0b" --force

# Complexity Labels
gh label create "complexity:low" --description "Low complexity change" --color "0e8a16" --force
gh label create "complexity:medium" --description "Medium complexity change" --color "fbca04" --force
gh label create "complexity:high" --description "High complexity change" --color "d93f0b" --force

# Type Labels
gh label create "type:story" --description "User story" --color "1d76db" --force
gh label create "type:bug" --description "Bug report" --color "d93f0b" --force
gh label create "type:tech-debt" --description "Technical debt" --color "f9d0c4" --force

Write-Host "✅ Labels created successfully!" -ForegroundColor Green
```

Run it:
```powershell
cd .github/scripts
./create-labels.ps1
```

---

## 🤖 Step 2: First AI Workflow - Story Analyzer (30 minutes)

Create `.github/workflows/ai-story-analyzer.yml`:

```yaml
name: AI Story Analyzer

on:
  issues:
    types: [opened, edited]

permissions:
  issues: write
  contents: read

jobs:
  analyze-story:
    # Only run on stories
    if: contains(github.event.issue.labels.*.name, 'type:story')
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Analyze Story with AI
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const issue = context.payload.issue;
            const issueBody = issue.body || '';
            
            // Extract story components using regex
            const extractSection = (body, sectionName) => {
              const regex = new RegExp(`### ${sectionName}\\s*([\\s\\S]*?)(?=###|$)`, 'i');
              const match = body.match(regex);
              return match ? match[1].trim() : '';
            };
            
            const userStory = extractSection(issueBody, 'User Story');
            const acceptanceCriteria = extractSection(issueBody, 'Acceptance Criteria');
            const technicalNotes = extractSection(issueBody, 'Technical Notes');
            
            // Analyze complexity
            const complexityIndicators = {
              high: ['database schema', 'breaking change', 'migration', 'infrastructure', 'authentication'],
              medium: ['api', 'endpoint', 'component', 'service', 'integration'],
              low: ['ui', 'styling', 'text', 'label', 'button']
            };
            
            let estimatedComplexity = 'medium';
            const lowerBody = issueBody.toLowerCase();
            
            if (complexityIndicators.high.some(word => lowerBody.includes(word))) {
              estimatedComplexity = 'high';
            } else if (complexityIndicators.low.some(word => lowerBody.includes(word))) {
              estimatedComplexity = 'low';
            }
            
            // Check which repos are affected
            const affectedRepos = [];
            if (lowerBody.includes('backend') || lowerBody.includes('api')) {
              affectedRepos.push('userManagementApi');
            }
            if (lowerBody.includes('frontend') || lowerBody.includes('ui')) {
              affectedRepos.push('fincore_WebUI');
            }
            if (lowerBody.includes('infrastructure') || lowerBody.includes('terraform')) {
              affectedRepos.push('fincore_Iasc');
            }
            
            // Create analysis comment
            const analysisComment = `## 🤖 AI Story Analysis
            
            **Estimated Complexity**: \`${estimatedComplexity}\`
            **Affected Repositories**: ${affectedRepos.length > 0 ? affectedRepos.map(r => \`\`${r}\`\`).join(', ') : '_To be determined_'}
            
            ### 📝 Story Summary
            ${userStory || '_No user story provided_'}
            
            ### ✅ Acceptance Criteria
            ${acceptanceCriteria || '_No acceptance criteria provided_'}
            
            ### 🔧 Technical Notes
            ${technicalNotes || '_No technical notes provided_'}
            
            ---
            
            ### 🎯 Next Steps
            ${estimatedComplexity === 'high' ? '1. ⚠️ This is a high-complexity story. Consider breaking it down.\n2. Architecture review recommended (label: \`ai:architecture\`)' : ''}
            ${affectedRepos.length > 1 ? '3. 🔄 Multi-repository change detected. Will need coordinated PRs.' : ''}
            ${affectedRepos.includes('fincore_Iasc') ? '4. 🏗️ Infrastructure changes require careful testing.' : ''}
            
            ### 🏷️ Recommended Actions
            - Add label: \`complexity:${estimatedComplexity}\`
            ${affectedRepos.length > 1 ? '- Add label: `multi-repo`' : ''}
            ${estimatedComplexity === 'high' ? '- Add label: `ai:architecture`' : '- Add label: `ai:development`'}
            
            ---
            
            *🤖 This analysis was automatically generated. Human review recommended for complex stories.*
            `;
            
            // Post analysis comment
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: issue.number,
              body: analysisComment
            });
            
            // Add complexity label
            await github.rest.issues.addLabels({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: issue.number,
              labels: [`complexity:${estimatedComplexity}`]
            });
            
            // Add affected repo labels if multi-repo
            if (affectedRepos.length > 1) {
              await github.rest.issues.addLabels({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: issue.number,
                labels: ['multi-repo']
              });
            }
            
            // Add next action label
            const nextLabel = estimatedComplexity === 'high' ? 'ai:architecture' : 'ai:development';
            await github.rest.issues.addLabels({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: issue.number,
              labels: [nextLabel]
            });
            
            console.log('✅ Story analysis complete!');
            console.log(`Complexity: ${estimatedComplexity}`);
            console.log(`Affected repos: ${affectedRepos.join(', ')}`);

      - name: Create tracking comment
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          script: |
            const trackingComment = `## 📊 Story Tracking
            
            | Status | Step | Completed |
            |--------|------|-----------|
            | ✅ | Story Analysis | ${new Date().toISOString().split('T')[0]} |
            | ⏳ | Architecture Design | - |
            | ⏳ | Development | - |
            | ⏳ | Testing | - |
            | ⏳ | Documentation | - |
            | ⏳ | Deployment | - |
            
            *This table will be updated automatically as the story progresses.*
            `;
            
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.payload.issue.number,
              body: trackingComment
            });
```

---

## 🧪 Step 3: Test Your AI Workflow (15 minutes)

### Commit and Push

```powershell
# Stage all new files
git add .github/

# Commit
git commit -m "feat: Add AI Story Analyzer workflow and issue templates"

# Push to trigger workflow
git push origin main
```

### Create a Test Story

Go to GitHub and create a new issue using your new template:

1. Navigate to: https://github.com/kasisheraz/fincore_WebUI/issues/new/choose
2. Select "📖 User Story"
3. Fill in:

```
User Story:
As a system administrator,
I want to view all active users,
So that I can monitor system usage

Acceptance Criteria:
- [ ] Display list of all active users
- [ ] Show last login time for each user
- [ ] Include user role and permissions
- [ ] Add search and filter functionality

Technical Notes:
- Affects: Backend API, Frontend UI
- New API endpoint: GET /api/users/active
- Use existing user service
- Frontend: New page in admin section

Estimated Complexity: Medium

Affected Repositories:
- [x] Backend (userManagementApi)
- [x] Frontend (fincore_WebUI)
- [ ] Infrastructure (fincore_Iasc)
```

4. Submit the issue
5. Watch the magic happen! 🎉

### What You Should See

Within 30-60 seconds:
- ✅ AI analysis comment appears
- ✅ Labels automatically added (`complexity:medium`, `ai:development`)
- ✅ Tracking table created
- ✅ Recommendations provided

---

## 🎉 Step 4: Verify Success (5 minutes)

Check that:

- [ ] Issue template is working
- [ ] Labels are created
- [ ] Workflow ran successfully (check Actions tab)
- [ ] AI comment was posted
- [ ] Labels were auto-added
- [ ] Tracking table was created

**GitHub Actions**: https://github.com/kasisheraz/fincore_WebUI/actions

---

## 📚 Step 5: Repeat for Other Repos (30 minutes)

Now do the same for your other two repositories:

### For userManagementApi:
```powershell
cd c:\Development\git\userManagementApi
# Run steps 1-4
```

### For fincore_Iasc:
```powershell
cd c:\Development\git\fincore_Iasc
# Run steps 1-4
```

---

## 🚀 What's Next?

Congratulations! You've just:
- ✅ Set up your first AI agent
- ✅ Created automated issue analysis
- ✅ Established the foundation for full SDLC automation

### Tomorrow's Tasks:

1. **Add Copilot Instructions** (`.github/copilot-instructions.md`)
2. **Create Architecture Agent** (will design solutions)
3. **Set up automated testing** (will run tests automatically)

### This Week:

- Complete Phase 1 of the implementation plan
- Test with 2-3 real stories
- Train your team on the new workflow

---

## 🆘 Troubleshooting

### Workflow didn't run?
```powershell
# Check workflow file exists
Get-ChildItem .github/workflows/

# Check for syntax errors
gh workflow list

# View workflow runs
gh run list
```

### Labels not created?
```powershell
# Manually create labels
cd .github/scripts
./create-labels.ps1
```

### Need to test workflow again?
```powershell
# Edit and re-open an existing issue
# Or create a new one
gh issue create --title "[STORY] Test" --body "Testing AI analyzer"
```

---

## 📖 Reference Documents

- **Full Plan**: [AGENTIC_AI_SDLC_PLAN.md](./AGENTIC_AI_SDLC_PLAN.md)
- **Checklist**: [AGENTIC_AI_IMPLEMENTATION_CHECKLIST.md](./AGENTIC_AI_IMPLEMENTATION_CHECKLIST.md)
- **GitHub Actions Docs**: https://docs.github.com/en/actions

---

## 💡 Pro Tips

1. **Start Small**: Test with simple stories first
2. **Iterate Fast**: Refine the AI prompts based on results
3. **Monitor Closely**: Watch the first few runs carefully
4. **Document Learning**: Keep notes on what works well
5. **Celebrate Wins**: Share successes with your team!

---

## ✅ Day 1 Complete!

You've successfully implemented your first AI agent! 🎉

**Time to celebrate** - you're now on the path to full agentic AI SDLC automation!

Tomorrow, we'll add even more AI capabilities. For now, create a few test stories and watch your AI agent work its magic! ✨

---

**Questions?** 
- Review the main plan document
- Check GitHub Actions logs for debugging
- Test with different story complexities

**Ready for Day 2?** See [AGENTIC_AI_IMPLEMENTATION_CHECKLIST.md](./AGENTIC_AI_IMPLEMENTATION_CHECKLIST.md) - Phase 1, Week 2!
