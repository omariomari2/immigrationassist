# Installing Git Hooks for Security

## Quick Setup

### macOS/Linux
```bash
# Make the hook executable and copy to git hooks
cp .githooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Windows
```cmd
:: Copy the Windows batch version
copy .githooks\pre-commit.bat .git\hooks\pre-commit.bat
```

## What the Hook Does

1. **Scans staged files** for patterns matching secrets (API keys, passwords, tokens)
2. **Blocks commits** that include `.env` files
3. **Warns about large files** (>1MB) that might be data files
4. **Shows specific files** causing issues

## Bypass (Emergency Only)

```bash
git commit --no-verify  # Skip hook (use with caution!)
```

## Alternative: Using git-secrets (More Robust)

```bash
# Install git-secrets
brew install git-secrets  # macOS
# Windows: Download from https://github.com/awslabs/git-secrets/releases

# Setup
cd your-repo
git secrets --install
git secrets --add 'API_KEY_[A-Z_]+=.*'
git secrets --add 'sk-[a-zA-Z0-9]{48}'  # OpenAI pattern
git secrets --add 'PRIVATE_KEY.*=.*'

# Manual scan
git secrets --scan
```
