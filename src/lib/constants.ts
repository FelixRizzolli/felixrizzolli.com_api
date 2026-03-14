/**
 * Centralized constants and enums for the application
 * This file provides type-safe constants to avoid typos and improve maintainability
 */

/**
 * Domains represent the different areas or contexts of the application.
 * Normally, each domain corresponds to a tenant or a specific section of the application.
 * This can be used for organizing collections, routes, and access control.
 */
export enum Domain {
  GLOBAL = 'global',
  WEDDING = 'wedding',
}

/**
 * Admin Panel Collection Groups
 * Used to organize collections in the Payload admin panel
 */
export enum CollectionGroup {
  GLOBAL = 'Global',
  WEDDING = 'Wedding',
}

/**
 * Collection Slugs
 * Type-safe collection slugs for relationships and queries
 */
export const CollectionSlug = {
  // Global
  USERS: 'users',
  ROLES: 'roles',
  PERMISSIONS: 'permissions',
  TENANTS: 'tenants',

  // Wedding
  WEDDING_GLOBALS: 'wedding-globals',
  WEDDING_IMAGES: 'wedding-images',
  WEDDING_CATEGORIES: 'wedding-categories',
  WEDDING_CATEGORY_GROUPS: 'wedding-category-groups',
  WEDDING_ISSUES: 'wedding-issues',
} as const;

export type CollectionSlug = (typeof CollectionSlug)[keyof typeof CollectionSlug];
