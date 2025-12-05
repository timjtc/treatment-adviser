# 🔐 Security Alert: Remove Exposed API Key from Git History

## ⚠️ IMMEDIATE ACTION REQUIRED

Your OpenRouter API key was committed to git history and is visible to anyone with repository access.

### Step 1: Rotate Your API Key (DO THIS FIRST!)

1. Go to https://openrouter.ai/keys
2. Delete the exposed key: `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`
3. Generate a new API key
4. Update your `.env.local` file with the new key

### Step 2: Remove Secret from Git History

**Option A: Using BFG Repo-Cleaner (Recommended - Easiest)**

```powershell
# 1. Install BFG (using Chocolatey)
choco install bfg-repo-cleaner

# 2. Create a file with the exposed key
echo "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" > secrets.txt

# 3. Run BFG to remove the secret from all commits
bfg --replace-text secrets.txt

# 4. Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Force push (WARNING: This rewrites history!)
git push --force
```

**Option B: Using git filter-repo (More Control)**

```powershell
# 1. Install git-filter-repo
pip install git-filter-repo

# 2. Create replacement file
$content = @"
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==>REDACTED_API_KEY
"@
$content | Out-File -FilePath expressions.txt -Encoding utf8

# 3. Run filter
git filter-repo --replace-text expressions.txt

# 4. Force push
git push --force
```

**Option C: Manual (if you have few commits)**

```powershell
# Interactive rebase to edit commits
git rebase -i --root

# For each commit containing the secret, mark as 'edit'
# Then amend the commit:
git commit --amend
# Edit the file manually, save
git rebase --continue

# Force push when done
git push --force
```

### Step 3: Verify Removal

After running one of the above options:

```powershell
# Search for the key in git history
git log -p -S "sk-or-v1-" --all

# If nothing shows up, the secret is removed
```

### Step 4: Update GitHub

After force pushing, GitHub should automatically close the security alert. If not:

1. Go to your repository on GitHub
2. Navigate to Security → Secret scanning alerts
3. Mark the alert as "Resolved" (choose "Revoked" as the reason)

### Step 5: Prevent Future Leaks

**Already Done:**
✅ `.env*` is in `.gitignore`
✅ `.env.example` created (no secrets)
✅ Removed secret from `OPENROUTER-INTEGRATION.md`

**Best Practices:**
- Never commit API keys, even in documentation
- Always use `.env.example` with placeholder values
- Use GitHub's secret scanning (already enabled)
- Consider using GitHub Secrets for CI/CD

---

## 📋 Quick Reference

**Your Exposed Key (to be deleted):**
```
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
```

**Files that contained it:**
- `OPENROUTER-INTEGRATION.md` (commit: e6d9a9d8) ← Already fixed
- `.env.local` (never committed, but rotate key anyway)

**Action Checklist:**
- [ ] Rotate OpenRouter API key
- [ ] Update `.env.local` with new key
- [ ] Remove secret from git history (use one of the methods above)
- [ ] Force push to GitHub
- [ ] Verify secret is gone: `git log -p -S "sk-or-v1-" --all`
- [ ] Close GitHub security alert

---

## ⚠️ WARNING

**Before force pushing:**
- Coordinate with your team (if any)
- Force push rewrites history and will affect anyone who cloned the repo
- They will need to re-clone or reset their local branches

**After you rotate the key and clean history, your app will work with the new key automatically** (it reads from `.env.local`).
