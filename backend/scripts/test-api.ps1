# scripts/test-api.ps1
# Run with: .\scripts\test-api.ps1
# Requires the server to be running (npm run dev)

$BASE = "http://localhost:5000"
$pass = 0
$fail = 0
$failures = @()

function Check($name, $condition, $detail = "") {
    if ($condition) {
        Write-Host "[PASS] $name" -ForegroundColor Green
        $script:pass++
    } else {
        Write-Host "[FAIL] $name $detail" -ForegroundColor Red
        $script:fail++
        $script:failures += $name
    }
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "  E-commerce Backend - Full Test Suite" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# 1. HEALTH
Write-Host "> Health check" -ForegroundColor Yellow
try {
    $h = Invoke-RestMethod -Uri "$BASE/health"
    Check "GET /health returns 200" ($h.status -eq "ok")
} catch {
    Check "GET /health returns 200" $false $_.Exception.Message
}

# 2. 404 HANDLING
Write-Host ""
Write-Host "> 404 handling" -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$BASE/api/nope"
    Check "GET /api/nope returns 404" $false
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    Check "GET /api/nope returns 404" ($code -eq 404) "got $code"
}

# 3. AUTH
Write-Host ""
Write-Host "> Auth" -ForegroundColor Yellow

# >>> EDIT THESE to your admin credentials <<<
$email = "souqi@gmail.com"
$password = "Aa12souqi12Aa"

$body = @{ email = $email; password = $password } | ConvertTo-Json

try {
    $login = Invoke-RestMethod -Method POST -Uri "$BASE/api/auth/login" -ContentType "application/json" -Body $body
    $token = $login.data.token
    Check "POST /api/auth/login returns token" ([bool]$token)
} catch {
    Check "POST /api/auth/login returns token" $false $_.Exception.Message
    Write-Host ""
    Write-Host "Cannot continue without token. Fix login first." -ForegroundColor Red
    Write-Host ""
    exit 1
}

$headers = @{ Authorization = "Bearer $token" }

# Wrong password
try {
    $badBody = @{ email = $email; password = "wrongpassword" } | ConvertTo-Json
    Invoke-RestMethod -Method POST -Uri "$BASE/api/auth/login" -ContentType "application/json" -Body $badBody
    Check "POST /api/auth/login with wrong password returns 401" $false
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    Check "POST /api/auth/login with wrong password returns 401" ($code -eq 401) "got $code"
}

# check-auth with token
try {
    $check = Invoke-RestMethod -Uri "$BASE/api/auth/check-auth" -Headers $headers
    Check "GET /api/auth/check-auth returns admin" ($check.data.admin.email -eq $email)
    Check "Password is NOT returned" (-not $check.data.admin.PSObject.Properties["password"])
} catch {
    Check "GET /api/auth/check-auth returns admin" $false $_.Exception.Message
}

# check-auth without token
try {
    Invoke-RestMethod -Uri "$BASE/api/auth/check-auth"
    Check "GET /api/auth/check-auth without token returns 401" $false
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    Check "GET /api/auth/check-auth without token returns 401" ($code -eq 401) "got $code"
}

# 4. CATEGORIES
Write-Host ""
Write-Host "> Categories" -ForegroundColor Yellow

$stamp = Get-Date -Format "yyyyMMddHHmmss"
$catBody = @{
    name  = @{ ar = "اختبار $stamp"; fr = "Test $stamp"; en = "Test $stamp" }
    emoji = "test"
} | ConvertTo-Json -Depth 5

$catId = $null
try {
    $cat = Invoke-RestMethod -Method POST -Uri "$BASE/api/categories" -ContentType "application/json" -Headers $headers -Body $catBody
    $catId = $cat.data.category._id
    Check "POST /api/categories creates category" ([bool]$catId)
    Check "Auto-slug generated" ([bool]$cat.data.category.slug)
} catch {
    Check "POST /api/categories creates category" $false $_.Exception.Message
}

# Create without auth
try {
    Invoke-RestMethod -Method POST -Uri "$BASE/api/categories" -ContentType "application/json" -Body $catBody
    Check "POST /api/categories without auth returns 401" $false
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    Check "POST /api/categories without auth returns 401" ($code -eq 401) "got $code"
}

# Validation - missing name.fr
try {
    $badCatBody = @{ name = @{ ar = "سيء"; en = "Bad" } } | ConvertTo-Json -Depth 5
    Invoke-RestMethod -Method POST -Uri "$BASE/api/categories" -ContentType "application/json" -Headers $headers -Body $badCatBody
    Check "POST /api/categories with missing name.fr returns 400" $false
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    Check "POST /api/categories with missing name.fr returns 400" ($code -eq 400) "got $code"
}

# List
try {
    $list = Invoke-RestMethod -Uri "$BASE/api/categories"
    Check "GET /api/categories lists categories" ($list.data.categories.Count -gt 0)
} catch {
    Check "GET /api/categories lists categories" $false $_.Exception.Message
}

# Get by id
try {
    $one = Invoke-RestMethod -Uri "$BASE/api/categories/$catId"
    Check "GET /api/categories/:id works" ($one.data.category._id -eq $catId)
} catch {
    Check "GET /api/categories/:id works" $false $_.Exception.Message
}

# Get by slug
try {
    $bySlug = Invoke-RestMethod -Uri "$BASE/api/categories/slug/$($cat.data.category.slug)"
    Check "GET /api/categories/slug/:slug works" ($bySlug.data.category._id -eq $catId)
} catch {
    Check "GET /api/categories/slug/:slug works" $false $_.Exception.Message
}

# Update
try {
    $updBody = @{ order = 99 } | ConvertTo-Json
    $upd = Invoke-RestMethod -Method PUT -Uri "$BASE/api/categories/$catId" -ContentType "application/json" -Headers $headers -Body $updBody
    Check "PUT /api/categories/:id updates order" ($upd.data.category.order -eq 99)
} catch {
    Check "PUT /api/categories/:id updates order" $false $_.Exception.Message
}

# 5. PRODUCTS
Write-Host ""
Write-Host "> Products" -ForegroundColor Yellow

# Create 1x1 test PNG from base64
$testImagePath = Join-Path $PSScriptRoot "..\test-image.png"
$pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
[IO.File]::WriteAllBytes($testImagePath, [Convert]::FromBase64String($pngBase64))

$titleJson = @{ ar = "منتج $stamp"; fr = "Produit $stamp"; en = "Product $stamp" } | ConvertTo-Json -Compress
$descJson = @{ ar = "وصف"; fr = "Description"; en = "Description" } | ConvertTo-Json -Compress

$productId = $null
$productSlug = $null
try {
    $curlOutput = & curl.exe -s -X POST "$BASE/api/products" `
        -H "Authorization: Bearer $token" `
        -F "images=@$testImagePath" `
        -F "title=$titleJson" `
        -F "description=$descJson" `
        -F "category=$catId" `
        -F "price=1500" `
        -F "stock=25" 2>&1

    $productResponse = $curlOutput | ConvertFrom-Json
    $productId = $productResponse.data.product._id
    $productSlug = $productResponse.data.product.slug
    Check "POST /api/products creates product" ([bool]$productId)
    Check "Product has Cloudinary image URL" ($productResponse.data.product.images[0] -match "cloudinary")
    Check "Product has auto-slug" ([bool]$productSlug)
} catch {
    Check "POST /api/products creates product" $false $_.Exception.Message
}

# List products
try {
    $plist = Invoke-RestMethod -Uri "$BASE/api/products"
    Check "GET /api/products lists products" ($plist.data.products.Count -gt 0)
    Check "Pagination object present" ([bool]$plist.data.pagination)
} catch {
    Check "GET /api/products lists products" $false $_.Exception.Message
}

# Filter by category
try {
    $pfilter = Invoke-RestMethod -Uri "$BASE/api/products?category=$catId"
    Check "GET /api/products?category= filters" ($pfilter.data.products.Count -ge 1)
} catch {
    Check "GET /api/products?category= filters" $false $_.Exception.Message
}

# Search
try {
    $psearch = Invoke-RestMethod -Uri "$BASE/api/products?search=$stamp"
    Check "GET /api/products?search= works" ($psearch.data.products.Count -ge 1)
} catch {
    Check "GET /api/products?search= works" $false $_.Exception.Message
}

# Get by slug
if ($productSlug) {
    try {
        $pslug = Invoke-RestMethod -Uri "$BASE/api/products/slug/$productSlug"
        Check "GET /api/products/slug/:slug works" ($pslug.data.product._id -eq $productId)
    } catch {
        Check "GET /api/products/slug/:slug works" $false $_.Exception.Message
    }
}

# Get by id
try {
    $pid = Invoke-RestMethod -Uri "$BASE/api/products/$productId"
    Check "GET /api/products/:id works" ($pid.data.product._id -eq $productId)
} catch {
    Check "GET /api/products/:id works" $false $_.Exception.Message
}

# Toggle availability
try {
    $tog = Invoke-RestMethod -Method PATCH -Uri "$BASE/api/products/$productId/toggle" -Headers $headers
    Check "PATCH /api/products/:id/toggle flips isAvailable" ($tog.data.product.isAvailable -eq $false)
    Invoke-RestMethod -Method PATCH -Uri "$BASE/api/products/$productId/toggle" -Headers $headers | Out-Null
} catch {
    Check "PATCH /api/products/:id/toggle flips isAvailable" $false $_.Exception.Message
}

# Set discount
try {
    $discBody = @{ discount = 15 } | ConvertTo-Json
    $disc = Invoke-RestMethod -Method PATCH -Uri "$BASE/api/products/$productId/discount" -ContentType "application/json" -Headers $headers -Body $discBody
    Check "PATCH /api/products/:id/discount sets discount" ($disc.data.product.discount -eq 15)
} catch {
    Check "PATCH /api/products/:id/discount sets discount" $false $_.Exception.Message
}

# Featured products
try {
    $feat = Invoke-RestMethod -Uri "$BASE/api/products/featured"
    Check "GET /api/products/featured works" ($null -ne $feat.data.products)
} catch {
    Check "GET /api/products/featured works" $false $_.Exception.Message
}

# 6. CLEANUP
Write-Host ""
Write-Host "> Cleanup" -ForegroundColor Yellow

if ($productId) {
    try {
        Invoke-RestMethod -Method DELETE -Uri "$BASE/api/products/$productId" -Headers $headers | Out-Null
        Check "DELETE /api/products/:id works" $true
    } catch {
        Check "DELETE /api/products/:id works" $false $_.Exception.Message
    }
}

if ($catId) {
    try {
        Invoke-RestMethod -Method DELETE -Uri "$BASE/api/categories/$catId" -Headers $headers | Out-Null
        Check "DELETE /api/categories/:id works" $true
    } catch {
        Check "DELETE /api/categories/:id works" $false $_.Exception.Message
    }
}

Remove-Item -Path $testImagePath -ErrorAction SilentlyContinue

# SUMMARY
Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
if ($fail -eq 0) {
    Write-Host "  ALL TESTS PASSED ($pass/$($pass + $fail))" -ForegroundColor Green
} else {
    Write-Host "  $fail FAILED / $pass PASSED (total $($pass + $fail))" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Failures:" -ForegroundColor Red
    foreach ($f in $failures) {
        Write-Host "    - $f" -ForegroundColor Red
    }
}
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""