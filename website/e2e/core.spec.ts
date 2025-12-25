import { test, expect } from '@playwright/test';

test.describe('Theme Preference', () => {
  test('should render in dark mode when preferred', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'dark');
  });

  test('should render in light mode when preferred', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'light');
  });
});

test.describe('Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show all UI components', async ({ page }) => {
    // Search Bar
    await expect(page.getByPlaceholder(/Search products.../)).toBeVisible();
    
    // Filter Sidebar
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Rack Units' })).toBeVisible();
    
    // Product List
    await expect(page.locator('h1', { hasText: 'Products' })).toBeVisible();
    const productCards = page.locator('article');
    await expect(productCards.first()).toBeVisible();
  });

  test('should load products initially', async ({ page }) => {
    const productCards = page.locator('article');
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
    
    // Check the count text in the header
    const countText = await page.locator('h1 span').textContent();
    const numericCount = parseInt(countText?.replace(/[()]/g, '') || '0');
    expect(numericCount).toBe(count);
  });

  test('should filter products by sidebar and remove filter via chip', async ({ page }) => {
    // Get initial count
    const initialCountText = await page.locator('h1 span').textContent();
    const initialCount = parseInt(initialCountText?.replace(/[()]/g, '') || '0');
    
    // Click a filter (e.g., "1U")
    // We need to find a filter that actually exists and has products
    const firstFilterLabel = page.locator('label').filter({ hasText: /^[1-4]U/ }).first();
    const filterName = (await firstFilterLabel.textContent())?.split('(')[0].trim();
    
    // Click the label instead of the checkbox directly to avoid state change issues
    await firstFilterLabel.click();
    
    // Wait for filtering to happen (it's client-side but let's be safe)
    await expect(async () => {
      const newCountText = await page.locator('h1 span').textContent();
      const newCount = parseInt(newCountText?.replace(/[()]/g, '') || '0');
      expect(newCount).toBeLessThan(initialCount);
    }).toPass();

    // Check if filter chip appeared
    const chip = page.locator('span').filter({ hasText: new RegExp(`${filterName}`, 'i') }).getByRole('button', { name: /Remove/ });
    await expect(chip).toBeVisible();
    
    // Click the close on the tag to remove the filter
    await chip.click();
    
    // Page goes back to showing the original amount of items
    await expect(async () => {
      const restoredCountText = await page.locator('h1 span').textContent();
      const restoredCount = parseInt(restoredCountText?.replace(/[()]/g, '') || '0');
      expect(restoredCount).toBe(initialCount);
    }).toPass();
  });

  test('should filter products by search', async ({ page }) => {
    const initialCountText = await page.locator('h1 span').textContent();
    const initialCount = parseInt(initialCountText?.replace(/[()]/g, '') || '0');
    
    const searchInput = page.getByPlaceholder(/Search products.../);
    
    // Type something that should return fewer results
    // "Inter-Tech" is a common brand in the data
    await searchInput.pressSequentially('Inter-Tech', { delay: 50 });
    
    // Wait for debounce (300ms) and filtering
    await page.waitForTimeout(1000);
    
    await expect(async () => {
      const searchCountText = await page.locator('h1 span').textContent();
      const searchCount = parseInt(searchCountText?.replace(/[()]/g, '') || '0');
      expect(searchCount).toBeLessThan(initialCount);
      expect(searchCount).toBeGreaterThan(0);
    }).toPass();
    
    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(1000);
    
    await expect(async () => {
      const restoredCountText = await page.locator('h1 span').textContent();
      const restoredCount = parseInt(restoredCountText?.replace(/[()]/g, '') || '0');
      expect(restoredCount).toBe(initialCount);
    }).toPass();
  });
});
