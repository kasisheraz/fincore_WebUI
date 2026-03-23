# Development Workflow

**Complete development workflow guide for Fincore Platform**

---

## 📋 Overview

This guide outlines the development workflow for contributing to the Fincore Platform, including branching strategy, code review process, testing requirements, and deployment procedures.

---

## 🌳 Git Branching Strategy

### Branch Types

```
main (protected)
└── feature/add-user-export          # New features
└── fix/organization-validation       # Bug fixes
└── hotfix/security-patch            # Critical fixes
└── refactor/clean-service-layer     # Code improvements
└── docs/update-api-guide            # Documentation
```

### Branch Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/{description}` | `feature/add-kyc-verification` |
| Bug Fix | `fix/{description}` | `fix/login-redirect-error` |
| Hotfix | `hotfix/{description}` | `hotfix/security-vulnerability` |
| Refactor | `refactor/{description}` | `refactor/simplify-auth-service` |
| Documentation | `docs/{description}` | `docs/update-deployment-guide` |

### Protected Branches

**Main Branch (`main`)**:
- ✅ Requires pull request reviews before merging
- ✅ Requires status checks to pass before merging
- ✅ Requires branches to be up to date before merging
- ✅ Dismisses stale pull request approvals when new commits pushed
- ✅ Requires linear history (no merge commits)
- ❌ No direct pushes allowed

---

## 🔄 Development Workflow

### 1. Setup Development Environment

#### Prerequisites
```powershell
# Check prerequisites
node --version      # Should be 18.x or higher
java --version      # Should be 17 or higher
mvn --version       # Should be 3.8+
docker --version    # Should be 20.x+
gcloud --version    # Latest version
```

#### Clone Repositories
```powershell
# Create project directory
mkdir C:\Development\git
cd C:\Development\git

# Clone frontend
git clone https://github.com/kasisheraz/fincore_WebUI.git
cd fincore_WebUI
npm install

# Clone backend
cd ..
git clone https://github.com/kasisheraz/userManagementApi.git
cd userManagementApi
mvn clean install

# Clone infrastructure
cd ..
git clone https://github.com/kasisheraz/fincore_Iasc.git
```

#### Environment Configuration

**Frontend** (`.env.local`):
```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_ENVIRONMENT=development
REACT_APP_MOCK_AUTH=false
```

**Backend** (`application-local.properties`):
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/fincore_db
spring.datasource.username=fincore_user
spring.datasource.password=your_local_password

# JWT
jwt.secret=your-local-jwt-secret-min-256-bits
jwt.expiration=3600000

# Server
server.port=8080
spring.profiles.active=local
```

---

### 2. Create Feature Branch

```powershell
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/add-export-functionality

# Or for bug fix
git checkout -b fix/organization-form-validation
```

---

### 3. Development Loop

#### Frontend Development

```powershell
cd C:\Development\git\fincore_WebUI

# Start development server
npm start
# Opens http://localhost:3000

# Make changes to code
# Edit src/components/...

# Test changes locally
npm test

# Format code
npm run format

# Lint code
npm run lint
```

#### Backend Development

```powershell
cd C:\Development\git\userManagementApi

# Start backend server
mvn spring-boot:run

# Or use IDE (IntelliJ IDEA / Eclipse)
# Run UserManagementApiApplication.java

# Make changes to code
# Edit src/main/java/...

# Run tests
mvn test

# Check code style
mvn checkstyle:check
```

#### Local Testing Integration

```powershell
# Terminal 1: Start backend
cd C:\Development\git\userManagementApi
mvn spring-boot:run

# Terminal 2: Start frontend
cd C:\Development\git\fincore_WebUI
npm start

# Test full flow:
# 1. Open http://localhost:3000
# 2. Login with phone number
# 3. Test your feature end-to-end
```

---

### 4. Commit Changes

#### Commit Message Convention

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semi-colons, etc.
- `refactor`: Code change that neither fixes bug nor adds feature
- `test`: Adding missing tests
- `chore`: Build process or auxiliary tool changes

**Examples**:
```bash
# Good commit messages
git commit -m "feat(organizations): Add export to Excel functionality"
git commit -m "fix(auth): Resolve token expiration redirect issue"
git commit -m "docs(api): Update endpoint documentation for KYC module"
git commit -m "test(users): Add unit tests for UserService"

# Bad commit messages (avoid)
git commit -m "fixed bug"
git commit -m "updates"
git commit -m "WIP"
```

#### Commit Best Practices

```powershell
# Stage specific files
git add src/components/organizations/OrganizationExport.tsx
git add src/services/exportService.ts

# Check what you're committing
git status
git diff --staged

# Commit with descriptive message
git commit -m "feat(organizations): Add Excel export functionality

- Add ExportService with XLSX generation
- Create OrganizationExport component
- Add export button to organization list
- Include tests for export functionality

Closes #123"

# Push to remote
git push origin feature/add-export-functionality
```

---

### 5. Create Pull Request

#### Before Creating PR

```powershell
# 1. Ensure all tests pass
npm test                    # Frontend
mvn test                    # Backend

# 2. Ensure code is formatted
npm run format              # Frontend
mvn formatter:format        # Backend

# 3. Update from main
git checkout main
git pull origin main
git checkout feature/add-export-functionality
git rebase main

# 4. Resolve any conflicts
# ... fix conflicts if any
git add .
git rebase --continue

# 5. Push to remote
git push origin feature/add-export-functionality --force-with-lease
```

#### PR Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Changes Made
- Added Excel export functionality to organizations
- Created ExportService for generating XLSX files
- Updated OrganizationList component with export button
- Added 5 new unit tests

## Testing Done
- [x] All existing tests pass
- [x] New tests added and passing
- [x] Manual testing completed
- [x] Tested on Chrome, Firefox, Edge

## Screenshots (if applicable)
[Add screenshots here]

## Related Issues
Closes #123
Relates to #124

## Checklist
- [x] My code follows the style guidelines of this project
- [x] I have performed a self-review of my own code
- [x] I have commented my code, particularly in hard-to-understand areas
- [x] I have made corresponding changes to the documentation
- [x] My changes generate no new warnings
- [x] I have added tests that prove my fix is effective or that my feature works
- [x] New and existing unit tests pass locally with my changes
```

#### Creating PR on GitHub

```powershell
# Option 1: Using GitHub CLI
gh pr create --title "feat(organizations): Add Excel export" --body "Description of changes..."

# Option 2: Via GitHub Web UI
# 1. Go to https://github.com/kasisheraz/fincore_WebUI
# 2. Click "Pull requests" tab
# 3. Click "New pull request"
# 4. Select your feature branch
# 5. Fill in PR template
# 6. Click "Create pull request"
```

---

### 6. Code Review Process

#### For PR Author

1. **Self-Review**: Review your own PR first
2. **CI Checks**: Ensure all GitHub Actions pass
3. **Request Review**: Tag team members for review
4. **Address Feedback**: Respond to all comments
5. **Update PR**: Push additional commits if needed

```powershell
# Respond to review comments
git add src/components/OrganizationExport.tsx
git commit -m "refactor: Simplify export logic per review feedback"
git push origin feature/add-export-functionality
```

#### For Reviewer

**Review Checklist**:
- [ ] Code follows project conventions
- [ ] Tests are adequate and pass
- [ ] No security vulnerabilities introduced
- [ ] Performance considerations addressed
- [ ] Documentation updated if needed
- [ ] No unnecessary dependencies added
- [ ] Error handling is appropriate
- [ ] Code is readable and maintainable

**Review Comments**:
```markdown
# Approve
Looks good! Great work on the export functionality.

# Request Changes
A few minor issues:
1. Line 45: Consider extracting this logic into a helper function
2. Line 78: Missing error handling for empty data case
3. Please add a comment explaining the date formatting logic

# Comment
Have you considered using a library for Excel generation instead of building from scratch? Something like `xlsx` or `exceljs` might save time.
```

---

### 7. Merge PR

#### Requirements Before Merge

- ✅ At least 1 approving review
- ✅ All CI checks passing (tests, linting, build)
- ✅ Branch up to date with `main`
- ✅ No merge conflicts
- ✅ All review comments resolved

#### Merge Strategies

**1. Squash and Merge** (Recommended):
```
# All commits squashed into one clean commit on main
feat(organizations): Add Excel export functionality (#123)
```

**2. Rebase and Merge**:
```
# Commits replayed on top of main (preserves individual commits)
feat: Add ExportService
feat: Create OrganizationExport component
test: Add export tests
```

**3. Create a Merge Commit** (Not Recommended):
```
# Creates merge commit (clutters history)
```

#### Merge via GitHub

```powershell
# Option 1: GitHub Web UI
# Click "Squash and merge" button

# Option 2: GitHub CLI
gh pr merge 123 --squash --delete-branch

# Option 3: Command line (not recommended for protected branches)
git checkout main
git pull origin main
git merge feature/add-export-functionality --squash
git push origin main
```

---

### 8. Post-Merge Cleanup

```powershell
# Update local main branch
git checkout main
git pull origin main

# Delete local feature branch
git branch -d feature/add-export-functionality

# Delete remote feature branch (if not auto-deleted)
git push origin --delete feature/add-export-functionality

# Verify deployment
# Check GitHub Actions to see deployment status
# Visit https://fincore-webui-lfd6ooarra-nw.a.run.app to test
```

---

## 🧪 Testing Requirements

### Before Creating PR

#### Frontend Tests
```powershell
# Run all E2E tests
npm test

# Run specific test file
npm test -- tests/e2e/organizations/export.spec.ts

# Run in headed mode (see browser)
npm test -- --headed

# Generate coverage report
npm test -- --coverage
```

**Required Coverage**: 80%+ for new code

#### Backend Tests
```powershell
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=OrganizationServiceTest

# Run with coverage
mvn test jacoco:report

# View coverage report
start target/site/jacoco/index.html
```

**Required Coverage**: 85%+ for new code

---

## 🚀 Deployment Process

### Automatic Deployment

**Trigger**: Merge to `main` branch

**Process**:
1. GitHub Actions runs tests
2. Builds Docker image
3. Pushes to Artifact Registry / GCR
4. Deploys to Cloud Run
5. Runs smoke tests
6. Updates service

**Timeline**: ~5-7 minutes from merge to production

### Manual Deployment

```powershell
# Trigger manual deployment
gh workflow run deploy-gcp.yml --ref main

# Or via GitHub Web UI:
# Actions → Deploy to GCP → Run workflow
```

---

## 🔧 Useful Commands

### Git Commands

```powershell
# Update branch from main
git checkout main
git pull origin main
git checkout feature/my-feature
git rebase main

# Squash last 3 commits
git rebase -i HEAD~3

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# Stash changes temporarily
git stash
git checkout main
git pull
git checkout feature/my-feature
git stash pop

# View commit history
git log --oneline --graph --all

# Find which branch has a commit
git branch --contains <commit-hash>
```

### NPM Commands (Frontend)

```powershell
# Install dependencies
npm install

# Start dev server
npm start

# Run tests
npm test

# Build production
npm run build

# Format code
npm run format

# Lint code
npm run lint

# Fix lint errors
npm run lint:fix
```

### Maven Commands (Backend)

```powershell
# Clean and install
mvn clean install

# Skip tests
mvn clean install -DskipTests

# Run specific test
mvn test -Dtest=UserServiceTest#testCreateUser

# Run Spring Boot
mvn spring-boot:run

# Package JAR
mvn package

# Check for updates
mvn versions:display-dependency-updates
```

---

## 📝 Code Style Guidelines

### Frontend (TypeScript/React)

```typescript
// ✅ Good
interface User {
  id: number;
  fullName: string;
  email: string;
}

export const UserList: React.FC<Props> = ({ users, onEdit }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    onEdit(user.id);
  };
  
  return (
    <div className="user-list">
      {users.map(user => (
        <UserCard key={user.id} user={user} onEdit={handleEdit} />
      ))}
    </div>
  );
};

// ❌ Bad
export const UserList = (props) => {
  let selectedUser;
  function handleEdit(user) {
    selectedUser = user;
    props.onEdit(user.id);
  }
  return <div>{props.users.map(u => <UserCard user={u}/>)}</div>;
};
```

### Backend (Java/Spring Boot)

```java
// ✅ Good
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    
    public UserDTO createUser(UserCreateDTO dto) {
        validateUserDto(dto);
        
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateEmailException("Email already exists");
        }
        
        User user = User.builder()
            .fullName(dto.getFullName())
            .email(dto.getEmail())
            .build();
        
        User savedUser = userRepository.save(user);
        return UserMapper.toDto(savedUser);
    }
    
    private void validateUserDto(UserCreateDTO dto) {
        // Validation logic
    }
}

// ❌ Bad
public class UserService {
    @Autowired UserRepository repo;
    
    public UserDTO create(UserCreateDTO d) {
        if(repo.existsByEmail(d.getEmail())) throw new Exception("exists");
        return UserMapper.toDto(repo.save(User.builder().fullName(d.getFullName()).email(d.getEmail()).build()));
    }
}
```

---

## 🆘 Getting Help

### Resources

- **Documentation**: Check README.md and docs/ folder
- **GitHub Issues**: Search existing issues first
- **Team Chat**: Ask in Slack #fincore-dev
- **Code Review**: Request feedback from team members

### Common Questions

**Q: How do I run tests locally?**
```powershell
# Frontend
npm test

# Backend
mvn test
```

**Q: My PR checks are failing, how do I see why?**
1. Go to PR page on GitHub
2. Click "Details" next to failing check
3. Review logs to find error
4. Fix issue and push new commit

**Q: How do I sync my branch with main?**
```powershell
git checkout main
git pull origin main
git checkout your-branch
git rebase main
```

**Q: How long does deployment take?**
Typically 5-7 minutes from merge to production.

---

## ✅ Development Checklist

Before creating PR:
- [ ] Code follows style guidelines
- [ ] All tests pass locally
- [ ] New tests added for new functionality
- [ ] Documentation updated
- [ ] Branch updated with latest main
- [ ] No merge conflicts
- [ ] Commit messages are descriptive
- [ ] Self-reviewed the code

Before merging:
- [ ] At least 1 approval
- [ ] All CI checks passing
- [ ] All review comments addressed
- [ ] Ready for production deployment

---

**Development Environment**: Windows 11 + WSL2 (optional)  
**IDE Recommendations**: VS Code (frontend), IntelliJ IDEA (backend)  
**Git Strategy**: Feature branches + Squash merge  
**Last Updated**: March 16, 2026
