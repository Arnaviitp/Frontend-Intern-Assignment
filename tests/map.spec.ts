import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/AOI Creator/);
});

test('map loads and canvas is visible', async ({ page }) => {
    await page.goto('/');

    // Wait for map canvas to be present
    const canvas = page.locator('.maplibregl-canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
});

test('layer toggle works', async ({ page }) => {
    await page.goto('/');

    // Check if checkbox is checked by default (Satellite Imagery)
    const checkbox = page.getByRole('checkbox');
    await expect(checkbox).toBeChecked();

    // Uncheck it
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();

    // Verify WMS layer might be hidden (this is harder to test visually without screenshot, but state change is verified)
});

test('drawing controls are present', async ({ page }) => {
    await page.goto('/');

    // Check for drawing buttons
    const polygonBtn = page.locator('.mapbox-gl-draw_polygon');
    await expect(polygonBtn).toBeVisible();

    const trashBtn = page.locator('.mapbox-gl-draw_trash');
    await expect(trashBtn).toBeVisible();
});
