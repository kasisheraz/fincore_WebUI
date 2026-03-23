#!/usr/bin/env node

/**
 * Confluence Documentation Updater
 * 
 * Automatically updates Confluence pages from markdown files
 * Usage: node update-confluence.js
 * 
 * Environment variables required:
 * - CONFLUENCE_URL: Base URL (e.g., https://fincoredesign.atlassian.net/wiki)
 * - CONFLUENCE_USER: Your email
 * - CONFLUENCE_API_TOKEN: API token from Atlassian
 * - CONFLUENCE_SPACE_KEY: Space key (e.g., FINCORE)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration from environment
const CONFLUENCE_URL = process.env.CONFLUENCE_URL || '';
const CONFLUENCE_USER = process.env.CONFLUENCE_USER || '';
const CONFLUENCE_TOKEN = process.env.CONFLUENCE_API_TOKEN || '';
const SPACE_KEY = process.env.CONFLUENCE_SPACE_KEY || 'FINCORE';

if (!CONFLUENCE_URL || !CONFLUENCE_USER || !CONFLUENCE_TOKEN) {
  console.error('❌ Missing required environment variables!');
  console.error('Required: CONFLUENCE_URL, CONFLUENCE_USER, CONFLUENCE_API_TOKEN');
  process.exit(1);
}

// Construct API base URL for Atlassian Cloud
// Remove trailing slashes and /wiki if present
let baseUrl = CONFLUENCE_URL.replace(/\/+$/, '').replace(/\/wiki$/, '');
// Ensure it's a valid URL
if (!baseUrl.startsWith('http')) {
  baseUrl = `https://${baseUrl}`;
}
const apiBaseUrl = `${baseUrl}/wiki/rest/api`;
const auth = Buffer.from(`${CONFLUENCE_USER}:${CONFLUENCE_TOKEN}`).toString('base64');

console.log('🔍 Debug: API Base URL:', apiBaseUrl);

/**
 * Make HTTP request to Confluence API
 */
function apiRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    // Construct full URL
    const fullUrl = `${apiBaseUrl}${path}`;
    const url = new URL(fullUrl);
    
    const options = {
      method,
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        // Handle redirects
        if (res.statusCode === 301 || res.statusCode === 302) {
          reject(new Error(`HTTP ${res.statusCode}: Redirect to ${res.headers.location}. Check your CONFLUENCE_URL format.`));
          return;
        }
        
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body || '{}'));
          } catch (e) {
            resolve({});
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    if (data) {
      const payload = JSON.stringify(data);
      req.setHeader('Content-Length', Buffer.byteLength(payload));
      req.write(payload);
    }
    req.end();
  });
}

/**
 * Convert Markdown to Confluence Storage Format (HTML-like)
 */
function markdownToConfluence(markdown) {
  let html = markdown
    // Headers
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang || 'text';
      return `<ac:structured-macro ac:name="code"><ac:parameter ac:name="language">${language}</ac:parameter><ac:plain-text-body><![CDATA[${code.trim()}]]></ac:plain-text-body></ac:structured-macro>`;
    })
    
    // Unordered lists
    .replace(/^[\*\-] (.+)$/gm, '<li>$1</li>')
    
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>.*<\/li>\n?)+/g, match => `<ul>${match}</ul>`)
    
    // Tables (basic support)
    .replace(/\|(.+)\|/g, (match, content) => {
      const cells = content.split('|').map(c => c.trim()).filter(c => c);
      return '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
    })
    .replace(/(<tr>.*<\/tr>\n?)+/g, match => `<table><tbody>${match}</tbody></table>`)
    
    // Horizontal rules
    .replace(/^---$/gm, '<hr/>')
    
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>')
    
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gm, match => {
      if (match.startsWith('<') || match === '') return match;
      return `<p>${match}</p>`;
    })
    
    // Clean up
    .replace(/<p><\/p>/g, '')
    .replace(/<p>(<h\d)/g, '$1')
    .replace(/(<\/h\d>)<\/p>/g, '$1')
    .replace(/<p>(<ul>)/g, '$1')
    .replace(/(<\/ul>)<\/p>/g, '$1')
    .replace(/<p>(<table>)/g, '$1')
    .replace(/(<\/table>)<\/p>/g, '$1')
    .replace(/<p>(<ac:)/g, '$1')
    .replace(/(<\/ac:structured-macro>)<\/p>/g, '$1');

  return html;
}

/**
 * Find page by title in space
 */
async function findPage(spaceKey, title) {
  try {
    const response = await apiRequest('GET', `/content?spaceKey=${spaceKey}&title=${encodeURIComponent(title)}&expand=version,ancestors`);
    return response.results.length > 0 ? response.results[0] : null;
  } catch (error) {
    console.error(`Error finding page "${title}":`, error.message);
    return null;
  }
}

/**
 * Create new page
 */
async function createPage(spaceKey, title, content, parentId = null) {
  try {
    const data = {
      type: 'page',
      title,
      space: { key: spaceKey },
      body: {
        storage: {
          value: content,
          representation: 'storage'
        }
      }
    };

    if (parentId) {
      data.ancestors = [{ id: parentId }];
    }

    const response = await apiRequest('POST', '/content', data);
    console.log(`✅ Created page: ${title} (ID: ${response.id})`);
    return response;
  } catch (error) {
    console.error(`❌ Error creating page "${title}":`, error.message);
    throw error;
  }
}

/**
 * Update existing page
 */
async function updatePage(pageId, title, content, currentVersion) {
  try {
    const data = {
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

    const response = await apiRequest('PUT', `/content/${pageId}`, data);
    console.log(`✅ Updated page: ${title} (version ${currentVersion} → ${currentVersion + 1})`);
    return response;
  } catch (error) {
    console.error(`❌ Error updating page "${title}":`, error.message);
    throw error;
  }
}

/**
 * Find or create page
 */
async function findOrCreatePage(spaceKey, title, content, parentId = null) {
  let page = await findPage(spaceKey, title);
  
  if (page) {
    await updatePage(page.id, title, content, page.version.number);
    return page;
  } else {
    return await createPage(spaceKey, title, content, parentId);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('\n🚀 Starting Confluence Documentation Update\n');
  console.log(`📍 Space: ${SPACE_KEY}`);
  console.log(`🔗 URL: ${CONFLUENCE_URL}\n`);

  try {
    // Find or create parent page
    const parentTitle = 'Fincore Platform';
    console.log(`📄 Looking for parent page: ${parentTitle}`);
    
    let parentPage = await findPage(SPACE_KEY, parentTitle);
    if (!parentPage) {
      const parentContent = markdownToConfluence('# Fincore Platform\n\nComprehensive documentation for the Fincore financial platform.');
      parentPage = await createPage(SPACE_KEY, parentTitle, parentContent);
    } else {
      console.log(`✅ Found parent page: ${parentTitle} (ID: ${parentPage.id})`);
    }

    // Documentation files to process
    const docFiles = [
      { file: 'confluence/01-PLATFORM-OVERVIEW.md', title: 'Platform Overview' },
      { file: 'confluence/02-ARCHITECTURE.md', title: 'Architecture' },
      { file: 'confluence/03-GETTING-STARTED.md', title: 'Getting Started' },
      { file: 'confluence/04-API-ENDPOINTS.md', title: 'API Endpoints Reference' },
      { file: 'confluence/05-TESTING.md', title: 'Testing Documentation' },
      { file: 'confluence/06-DEPLOYMENT.md', title: 'Deployment Guide' },
      { file: 'confluence/07-DEVELOPMENT-WORKFLOW.md', title: 'Development Workflow' },
      { file: 'confluence/08-TROUBLESHOOTING.md', title: 'Troubleshooting' },
      { file: 'confluence/09-MANUAL-TESTING-PLAN.md', title: 'Manual Testing Plan' }
    ];

    console.log(`\n📚 Processing ${docFiles.length} documentation files...\n`);

    let updated = 0;
    let created = 0;
    let skipped = 0;

    for (const doc of docFiles) {
      const filePath = path.join(process.cwd(), doc.file);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⏭️  Skipping ${doc.title} (file not found: ${doc.file})`);
        skipped++;
        continue;
      }

      console.log(`📝 Processing: ${doc.title}`);
      const markdown = fs.readFileSync(filePath, 'utf-8');
      const confluenceHtml = markdownToConfluence(markdown);

      const existingPage = await findPage(SPACE_KEY, doc.title);
      
      if (existingPage) {
        await updatePage(existingPage.id, doc.title, confluenceHtml, existingPage.version.number);
        updated++;
      } else {
        await createPage(SPACE_KEY, doc.title, confluenceHtml, parentPage.id);
        created++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Documentation Update Complete!');
    console.log('='.repeat(50));
    console.log(`📊 Summary:`);
    console.log(`   • Created: ${created} pages`);
    console.log(`   • Updated: ${updated} pages`);
    console.log(`   • Skipped: ${skipped} pages`);
    console.log(`\n🔗 View documentation: ${CONFLUENCE_URL}/spaces/${SPACE_KEY}\n`);

  } catch (error) {
    console.error('\n❌ Documentation update failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
