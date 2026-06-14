# git-setup.ps1
# Initialize Git if not already done
if (-not (Test-Path .git)) {
    git init
}
git branch -M main

# Helper function to stage and commit only if the paths exist and have changes
function Commit-Stage {
    param(
        [string[]]$Paths,
        [string]$Message
    )
    $staged = $false
    foreach ($path in $Paths) {
        if (Test-Path $path) {
            git add $path
            $staged = $true
        }
    }
    if ($staged) {
        # Check if there are staged changes to commit
        $hasChanges = git diff --name-only --cached
        if ($hasChanges) {
            git commit -m $Message
            Write-Host "Committed: '$Message'"
        } else {
            Write-Host "No changes to commit for: '$Message'"
        }
    } else {
        Write-Host "Skipping: '$Message' (No paths found)"
    }
}

# 1. Setup
Commit-Stage @("package.json", "package-lock.json", "vite.config.js", "tailwind.config.js", "index.html", ".gitignore", "backend/app.js", "backend/index_api.js", "src/main.jsx", "src/index.css", "src/App.jsx") "Initial project setup — React + Express + Prisma"

# 2. Database schema
Commit-Stage @("prisma") "Add database schema — User, Book, Cart, Order, Transaction models"

# 3. JWT auth
Commit-Stage @("backend/modules/Auth", "backend/utils") "Implement JWT authentication with bcrypt and Joi validation"

# 4. TOTP 2FA
Commit-Stage @("backend/modules/TwoFactor") "Add TOTP-based 2FA with QR code generation"

# 5. RBAC
Commit-Stage @("backend/middleware") "Add RBAC middleware for role-based route protection"

# 6. Prisma transactions
Commit-Stage @("backend/modules/Order", "backend/modules/Payout") "Implement Prisma transactions for order and payout flows"

# 7. Dashboard service
Commit-Stage @("backend/modules/Setting", "backend/modules/User") "Add unified dashboard service with role-based stats"

# 8. AuthContext
Commit-Stage @("src/context", "src/utils") "Build AuthContext and Axios interceptor for token handling"

# 9. Modal
Commit-Stage @("src/CommonComponents/Modal.jsx") "Add reusable Modal component with Framer Motion"

# 10. Author dashboard
Commit-Stage @("src/Dashboards/AuthorDashboard.jsx", "src/Dashboards/Layout") "Implement Author dashboard — wallet, books, payout requests"

# 11. Vendor dashboard
Commit-Stage @("backend/modules/Vendor") "Implement Vendor dashboard — print orders, delivery tracking"

# 12. Reader dashboard
Commit-Stage @("src/Dashboards/ReaderDashboard.jsx", "src/Dashboards/Orders", "backend/modules/Cart") "Implement Reader dashboard — library, order history"

# 13. Admin dashboard
Commit-Stage @("src/Dashboards/AdminDashboard") "Implement Admin dashboard — commission control, payout approvals"

# 14. Book catalog
Commit-Stage @("src/Dashboards/Books", "src/CommonComponents/Table.jsx", "src/CommonComponents/BookFilters.jsx", "src/CommonComponents/MetricCard.jsx", "src/Routes", "src/components") "Add book catalog with multi-filter search and TanStack Query"

# 15. Optimize catalog
Commit-Stage @("backend/modules/Book") "Optimize catalog queries with database-level filtering"

# 16. Final clean-up for remaining files (like assets or build configs)
$status = git status --porcelain
if ($status) {
    git add .
    git commit -m "Chore: final styling, environment settings, and assets"
    Write-Host "Committed remaining files."
}
