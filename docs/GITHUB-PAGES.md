# GitHub Pages Deployment

This repository is configured to automatically deploy to GitHub Pages for both the main branch and feature branches.

## Main Branch Deployment

The main branch is automatically deployed to GitHub Pages at:
- **URL**: https://slpixe.github.io/rack-research/

The deployment is triggered automatically on every push to the `main` branch via the `.github/workflows/deploy-pages.yml` workflow.

## Feature Branch Previews

When a pull request is opened, a preview deployment is automatically created for the feature branch. Each branch gets its own subdirectory under the preview path:

- **Preview URL Pattern**: `https://slpixe.github.io/rack-research/preview/<branch-name>/`

### How it works:

1. **When PR is opened/updated**: The `.github/workflows/deploy-branch-preview.yml` workflow builds the site with a branch-specific basePath and deploys it to `gh-pages` branch under `preview/<branch-name>/`
2. **Comment on PR**: A comment is automatically posted to the PR with the preview URL
3. **When PR is closed**: The `.github/workflows/cleanup-branch-preview.yml` workflow removes the preview deployment

### Example:

For a branch named `feature/new-design`, the preview URL would be:
```
https://slpixe.github.io/rack-research/preview/feature-new-design/
```

## Setup Requirements

To enable GitHub Pages for this repository:

1. Go to repository **Settings** → **Pages**
2. Under **Source**, select:
   - **Source**: Deploy from a branch
   - **Branch**: `gh-pages` / `(root)`
3. Click **Save**

The first deployment will create the `gh-pages` branch automatically.

## Local Testing

To test the static export locally:

```bash
# Build the website
npm run build

# The output will be in website/out/
# You can serve it with any static file server, e.g.:
cd website/out
python -m http.server 8000
# Then open http://localhost:8000/rack-research/
```

## Workflows Overview

### deploy-pages.yml
- **Trigger**: Push to `main` branch or manual workflow dispatch
- **Action**: Builds and deploys the main site to GitHub Pages root
- **Deployment**: Uses peaceiris/actions-gh-pages to push to gh-pages branch
- **Important**: Uses `keep_files: true` and `exclude_assets: 'preview/**'` to preserve existing preview deployments

### deploy-branch-preview.yml
- **Trigger**: Pull request opened, synchronized, or reopened
- **Action**: Builds and deploys to `preview/<branch-name>/` subdirectory
- **Features**: 
  - Updates Next.js basePath dynamically for each branch
  - Posts preview URL as PR comment
  - Keeps previous preview deployments

### cleanup-branch-preview.yml
- **Trigger**: Pull request closed
- **Action**: Removes the preview deployment for the closed branch
- **Benefit**: Keeps gh-pages branch clean and reduces storage

## Configuration

The site is configured for static export in `website/next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/rack-research',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}
```

- **output: 'export'**: Enables static HTML export
- **basePath**: Required for GitHub Pages deployment to user/org repos
- **trailingSlash**: Ensures cleaner URLs for static hosting
- **images.unoptimized**: Required for static export (no server-side image optimization)

## Troubleshooting

### Preview not showing updated content
- Check the workflow run in the **Actions** tab
- Verify the build completed successfully
- Wait a few minutes for GitHub Pages to update

### 404 errors on preview URLs
- Ensure the `gh-pages` branch exists
- Check that the preview directory was created
- Verify GitHub Pages is enabled in repository settings

### Assets not loading
- Ensure all asset paths use the `basePath` configuration
- Check that `.nojekyll` file is present in the output
- Verify relative paths in components are correct
