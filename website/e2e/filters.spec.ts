import { test, expect } from '@playwright/test';

test.describe('Filter System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should filter by rack units (checkbox)', async ({ page }) => {
    // Initial count
    const initialCountText = await page.locator('h1:has-text("Products")').textContent();
    const initialCount = parseInt(initialCountText?.match(/\((\d+)\)/)?.[1] || '0');
    expect(initialCount).toBeGreaterThan(0);

    // Select 1U in Rack Units (first one)
    await page.getByRole('checkbox', { name: /1U \(/ }).first().click();
    await expect(page).toHaveURL(/rack_units=1U/);
    
    const filteredCountText = await page.locator('h1:has-text("Products")').textContent();
    const filteredCount = parseInt(filteredCountText?.match(/\((\d+)\)/)?.[1] || '0');
    expect(filteredCount).toBeLessThan(initialCount);
    expect(filteredCount).toBeGreaterThan(0);

    // Select 2U as well
    await page.getByRole('checkbox', { name: /2U \(/ }).click();
    await expect(page).toHaveURL(/rack_units=1U%2C2U/);
    
    const multiFilteredCountText = await page.locator('h1:has-text("Products")').textContent();
    const multiFilteredCount = parseInt(multiFilteredCountText?.match(/\((\d+)\)/)?.[1] || '0');
    expect(multiFilteredCount).toBeGreaterThan(filteredCount);
  });

  test('should filter by brand (checkbox)', async ({ page }) => {
    await page.getByRole('checkbox', { name: /Sliger \(/ }).click();
    await expect(page).toHaveURL(/brand=Sliger/);
    
    const countText = await page.locator('h1:has-text("Products")').textContent();
    expect(countText).toContain('(42)'); // Based on current data
  });

  test('should filter by PSU Included (boolean)', async ({ page }) => {
    // Select "No" for PSU Included
    await page.getByRole('radio', { name: /No\(/ }).click();
    await expect(page).toHaveURL(/psu_included=false/);
    
    // Select "Yes" (should be 0 or small number)
    await page.getByRole('radio', { name: /Yes\(/ }).click();
    await expect(page).toHaveURL(/psu_included=true/);
  });

  test('should filter by price range', async ({ page }) => {
    const priceContainer = page.locator('div')
      .filter({ has: page.getByText(/^Price$/) })
      .filter({ has: page.getByRole('spinbutton') })
      .last();
    
    const minInput = priceContainer.getByRole('spinbutton').first();
    const maxInput = priceContainer.getByRole('spinbutton').last();

    // 1. Adjust min price
    await minInput.fill('100');
    await minInput.press('Enter');
    await expect(page).toHaveURL(/price=100-/);
    
    const countAfterMinText = await page.locator('h1:has-text("Products")').textContent();
    const countAfterMin = parseInt(countAfterMinText?.match(/\((\d+)\)/)?.[1] || '0');
    expect(countAfterMin).toBeLessThan(219);

    // 2. Shrink max price
    await maxInput.fill('300');
    await maxInput.press('Enter');
    await expect(page).toHaveURL(/price=100-300/);

    const countAfterMaxText = await page.locator('h1:has-text("Products")').textContent();
    const countAfterMax = parseInt(countAfterMaxText?.match(/\((\d+)\)/)?.[1] || '0');
    expect(countAfterMax).toBeLessThan(countAfterMin);
  });

  test('should search for products', async ({ page }) => {
    const searchBox = page.getByPlaceholder(/Search products/);
    await searchBox.fill('Sliger');
    
    await expect(page).toHaveURL(/q=Sliger/);
    const countText = await page.locator('h1:has-text("Products")').textContent();
    expect(countText).toContain('(42)');
    
    // Check if results contain Sliger
    await expect(page.locator('article').first()).toContainText('Sliger');
  });

  test('should clear all filters', async ({ page }) => {
    // Apply some filters
    await page.getByRole('checkbox', { name: /1U \(/ }).first().click();
    await page.getByPlaceholder(/Search products/).fill('test');
    
    await expect(page).toHaveURL(/\?q=test&rack_units=1U/);
    
    // Click Clear all
    await page.getByRole('button', { name: 'Clear all' }).click();
    
    await expect(page).toHaveURL('http://localhost:3000/');
    const searchBox = page.getByPlaceholder(/Search products/);
    await expect(searchBox).toHaveValue('');
  });

  test('should handle deep linking', async ({ page }) => {
    // Navigate directly to a filtered URL
    await page.goto('/?brand=Sliger&rack_units=4U');
    
    const countText = await page.locator('h1:has-text("Products")').textContent();
    expect(countText).toContain('(26)'); // 26 Sliger 4U cases
    
    // Check if checkboxes are checked
    await expect(page.getByRole('checkbox', { name: /Sliger \(/ })).toBeChecked();
    await expect(page.getByRole('checkbox', { name: /4U \(/ })).toBeChecked();
  });

  test('should filter by depth (range)', async ({ page }) => {
    const depthContainer = page.locator('div')
      .filter({ has: page.getByText(/^Depth$/) })
      .filter({ has: page.getByRole('spinbutton') })
      .last();
    
    const minInput = depthContainer.getByRole('spinbutton').first();
    const maxInput = depthContainer.getByRole('spinbutton').last();

    // 1. Adjust min depth
    await minInput.fill('200');
    await minInput.press('Enter');
    await expect(page).toHaveURL(/depth_mm=200-/);
    
    const countAfterMinText = await page.locator('h1:has-text("Products")').textContent();
    const countAfterMin = parseInt(countAfterMinText?.match(/\((\d+)\)/)?.[1] || '0');
    expect(countAfterMin).toBeLessThan(219);

    // 2. Shrink max depth
    await maxInput.fill('500');
    await maxInput.press('Enter');
    await expect(page).toHaveURL(/depth_mm=200-500/);

    const countAfterMaxText = await page.locator('h1:has-text("Products")').textContent();
    const countAfterMax = parseInt(countAfterMaxText?.match(/\((\d+)\)/)?.[1] || '0');
    expect(countAfterMax).toBeLessThan(countAfterMin);
  });

  test('should filter by motherboard support (array checkbox)', async ({ page }) => {
    // Select Mini-ITX
    await page.getByRole('checkbox', { name: /Mini-ITX \(/ }).click();
    await expect(page).toHaveURL(/motherboard_support=Mini-ITX/);
    
    // Select E-ATX
    await page.getByRole('checkbox', { name: /E-ATX \(/ }).click();
    await expect(page).toHaveURL(/motherboard_support=Mini-ITX%2CE-ATX/);
    
    const countText = await page.locator('h1:has-text("Products")').textContent();
    const count = parseInt(countText?.match(/\((\d+)\)/)?.[1] || '0');
    expect(count).toBeGreaterThan(0);
  });

  test('should filter by hot swap support (boolean)', async ({ page }) => {
    // Select "Hot-swap capable"
    await page.getByRole('radio', { name: /Hot-swap capable\(/ }).click();
    await expect(page).toHaveURL(/has_hot_swap=true/);
    
    // Should be 0 or very few
    const countText = await page.locator('h1:has-text("Products")').textContent();
    const count = parseInt(countText?.match(/\((\d+)\)/)?.[1] || '0');
    // Based on snapshot, it was 0, but let's just check it filtered
    expect(count).toBeLessThan(219);
  });
});
