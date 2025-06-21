# Bug Fixing Protocol

This document provides a comprehensive step-by-step approach to systematically identify and fix bugs in the Logistics Investment Optimizer application using available MCP tools.

## Step-by-Step Bug Fixing Process

### Phase 1: Data Collection & Analysis

#### 1.1 Browser Console Analysis with Puppeteer
```bash
# Use Puppeteer MCP to capture browser console logs
# Navigate to the application and capture real-time errors
```
- Navigate to application URL
- Take screenshots of error states
- Capture console logs (errors, warnings, network failures)
- Document user interaction flows that trigger bugs

#### 1.2 Historical Bug Check
**IMPORTANT: Check `bugfixes.md` first before proceeding**
- Review previously documented bugs and their symptoms
- Compare current error patterns with historical issues
- Apply known fixes if error matches previous cases
- Only proceed with full analysis if issue is new or different
- Update existing bug entries if new symptoms are discovered

#### 1.3 Docker Container Analysis
```bash
# Use Docker MCP to inspect container health and logs
# Check Supabase container status and error logs
```
- Check Docker container status for all services
- Retrieve logs from Supabase containers
- Identify service failures or connection issues
- Monitor resource usage and performance metrics

#### 1.4 Available MCP Tools Assessment
Review all available MCP tools to determine the most relevant for bug fixing:

**Primary Bug Fixing MCPs:**
- `mcp__puppeteer__*` - Browser automation and console capture
- `mcp__ide__getDiagnostics` - Code diagnostics and errors
- `mcp__context7__*` - Library documentation for fixes
- `mcp__sequential-thinking__*` - Complex problem analysis
- `mcp__memory__*` - Track bug patterns and solutions

**Secondary Support MCPs:**
- `mcp__taskmaster__*` - Project management and task tracking
- `mcp__magic__*` - UI component fixes if needed

### Phase 2: Bug Identification & Prioritization

#### 2.1 Historical Reference Check
- Cross-reference captured errors with `bugfixes.md` entries
- If match found, apply documented resolution immediately
- If partial match, adapt known solution to current context
- Document any variations in symptoms or resolution steps

#### 2.2 Error Classification
- **Critical**: Application crashes, authentication failures
- **High**: Core functionality broken, data loss
- **Medium**: UI/UX issues, performance problems
- **Low**: Cosmetic issues, minor inconsistencies

#### 2.3 Root Cause Analysis
Use sequential thinking MCP to analyze complex bugs:
- Break down error chains
- Identify dependency issues
- Map error propagation paths
- Determine fix priorities

### Phase 3: Bug Resolution

#### 3.1 Systematic Fixing Process
For each identified bug:
1. **Research Phase**: Use Context7 MCP to get relevant documentation
2. **Implementation Phase**: Apply fixes using appropriate tools
3. **Testing Phase**: Use Puppeteer to verify fixes
4. **Documentation Phase**: Update bug tracking in Memory MCP

#### 3.2 Validation Loop
After each fix:
1. Re-run Puppeteer console capture
2. Check Docker logs for new issues
3. Verify no regression bugs introduced
4. Update bug status in tracking system

### Phase 4: Comprehensive Re-testing

#### 4.1 Full Application Scan
- Complete browser console audit
- Full Docker service health check
- End-to-end user flow testing
- Performance monitoring

#### 4.2 Online Research for Persistent Issues
If bugs persist after initial fixes:
- Use web search MCP for community solutions
- Research similar issues in documentation
- Check for known framework/library bugs
- Implement alternative approaches

### Phase 5: Documentation & Prevention

#### 5.1 Bug Fix Documentation
- Update `bugfixes.md` with all resolved issues
- Create troubleshooting guides for common problems
- Document prevention strategies

#### 5.2 Monitoring Setup
- Establish ongoing error monitoring
- Set up automated health checks
- Create alerts for critical failures

## Execution Checklist

- [x] Initialize Puppeteer session and navigate to app
- [x] Capture initial console state and screenshots
- [x] **Check `bugfixes.md` for historical solutions**
- [x] Check Docker container health and logs
- [x] Classify and prioritize identified bugs
- [x] Research solutions using Context7 MCP
- [x] Implement fixes systematically
- [x] Validate each fix with Puppeteer testing
- [x] Re-scan for new or remaining issues
- [x] Use online research MCP for persistent problems
- [x] Document all fixes and prevention measures
- [x] Establish ongoing monitoring protocols

## Bug Fix Session Results (2025-06-20)

**Initial Issue**: Application appeared to show blank white screen after login
**Root Cause**: Supabase local services were partially stopped, causing authentication connection issues
**Resolution Applied**: Complete Supabase restart using `npm run supabase:stop && npm run supabase:start`

**Validation Results**:
- ✅ Puppeteer navigation successful
- ✅ Login functionality working (demo@example.com / demo123)
- ✅ React app mounting correctly
- ✅ Dashboard fully rendered with all components
- ✅ No console errors detected
- ✅ All Docker containers healthy
- ✅ Authentication flow complete

**Final Status**: All bugs resolved - application fully functional

## Tools Command Reference

### Puppeteer Commands
```javascript
// Navigate and capture
mcp__puppeteer__puppeteer_navigate
mcp__puppeteer__puppeteer_screenshot
mcp__puppeteer__puppeteer_evaluate

// Interaction testing
mcp__puppeteer__puppeteer_click
mcp__puppeteer__puppeteer_fill
```

### Diagnostic Commands
```bash
# IDE diagnostics
mcp__ide__getDiagnostics

# Container health
docker ps
docker logs [container_name]
```

### Research Commands
```bash
# Library documentation
mcp__context7__resolve-library-id
mcp__context7__get-library-docs

# Online help
WebSearch for specific error messages
```

This protocol ensures systematic identification and resolution of all application bugs using the full suite of available MCP tools.