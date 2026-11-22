// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// This file is automatically copied from backend/shared-dto
// Source: shared-dto/dist/contentBundle.d.ts
// Generated: 2026-11-22T20:51:18.542Z

import { z } from 'zod';
/**
 * Формат файла импорта/экспорта контента.
 *
 * Один и тот же документ описывает персон, достижения, периоды и списки.
 * Внутри файла сущности ссылаются друг на друга по `key`; вместо `key`
 * допускается существующий `id` (для страны — имя или id).
 */
export declare const CONTENT_BUNDLE_VERSION = 1;
export declare const CONTENT_BUNDLE_MAX_PERSONS = 1000;
export declare const CONTENT_BUNDLE_MAX_ACHIEVEMENTS = 10000;
export declare const CONTENT_BUNDLE_MAX_PERIODS = 10000;
export declare const CONTENT_BUNDLE_MAX_LISTS = 200;
export declare const CONTENT_BUNDLE_MAX_LIST_ITEMS = 5000;
export declare const CONTENT_BUNDLE_MAX_BYTES: number;
export declare const ContentBundleLifePeriodSchema: z.ZodObject<{
    country: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
    start: z.ZodNumber;
    end: z.ZodNumber;
}, z.core.$strip>;
export declare const ContentBundlePersonSchema: z.ZodObject<{
    key: z.ZodString;
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    birthYear: z.ZodNumber;
    deathYear: z.ZodNumber;
    category: z.ZodString;
    description: z.ZodDefault<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    wikiLink: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    lifePeriods: z.ZodOptional<z.ZodArray<z.ZodObject<{
        country: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        start: z.ZodNumber;
        end: z.ZodNumber;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const ContentBundleAchievementSchema: z.ZodObject<{
    key: z.ZodString;
    id: z.ZodOptional<z.ZodNumber>;
    person: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    country: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    year: z.ZodNumber;
    description: z.ZodString;
    wikipediaUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    imageUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const ContentBundlePeriodSchema: z.ZodObject<{
    key: z.ZodString;
    id: z.ZodOptional<z.ZodNumber>;
    person: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    country: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
    periodType: z.ZodString;
    startYear: z.ZodNumber;
    endYear: z.ZodNumber;
    comment: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const ContentBundleListItemSchema: z.ZodObject<{
    type: z.ZodEnum<{
        person: "person";
        achievement: "achievement";
        period: "period";
    }>;
    ref: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
    showAsGlobal: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const ContentBundleListSchema: z.ZodObject<{
    key: z.ZodString;
    id: z.ZodOptional<z.ZodNumber>;
    title: z.ZodString;
    description: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    items: z.ZodDefault<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<{
            person: "person";
            achievement: "achievement";
            period: "period";
        }>;
        ref: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
        showAsGlobal: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const ContentBundleSchema: z.ZodObject<{
    version: z.ZodNumber;
    persons: z.ZodDefault<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        id: z.ZodOptional<z.ZodString>;
        name: z.ZodString;
        birthYear: z.ZodNumber;
        deathYear: z.ZodNumber;
        category: z.ZodString;
        description: z.ZodDefault<z.ZodString>;
        imageUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        wikiLink: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        lifePeriods: z.ZodOptional<z.ZodArray<z.ZodObject<{
            country: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
            start: z.ZodNumber;
            end: z.ZodNumber;
        }, z.core.$strip>>>;
    }, z.core.$strip>>>;
    achievements: z.ZodDefault<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        id: z.ZodOptional<z.ZodNumber>;
        person: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
        country: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
        year: z.ZodNumber;
        description: z.ZodString;
        wikipediaUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        imageUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>>;
    periods: z.ZodDefault<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        id: z.ZodOptional<z.ZodNumber>;
        person: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
        country: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>;
        periodType: z.ZodString;
        startYear: z.ZodNumber;
        endYear: z.ZodNumber;
        comment: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>>;
    lists: z.ZodDefault<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        id: z.ZodOptional<z.ZodNumber>;
        title: z.ZodString;
        description: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        items: z.ZodDefault<z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<{
                person: "person";
                achievement: "achievement";
                period: "period";
            }>;
            ref: z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>;
            showAsGlobal: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
        }, z.core.$strip>>>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const ContentImportModeSchema: z.ZodEnum<{
    "create-only": "create-only";
    upsert: "upsert";
}>;
export declare const ContentImportRequestSchema: z.ZodObject<{
    content: z.ZodString;
    mode: z.ZodDefault<z.ZodEnum<{
        "create-only": "create-only";
        upsert: "upsert";
    }>>;
    dryRun: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export declare const ContentImportEntrySchema: z.ZodObject<{
    collection: z.ZodEnum<{
        persons: "persons";
        achievements: "achievements";
        periods: "periods";
        lists: "lists";
        listItems: "listItems";
    }>;
    key: z.ZodString;
    id: z.ZodOptional<z.ZodNullable<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>>;
    action: z.ZodEnum<{
        error: "error";
        created: "created";
        updated: "updated";
        skipped: "skipped";
    }>;
    message: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ContentImportReportSchema: z.ZodObject<{
    ok: z.ZodBoolean;
    dryRun: z.ZodBoolean;
    mode: z.ZodEnum<{
        "create-only": "create-only";
        upsert: "upsert";
    }>;
    version: z.ZodOptional<z.ZodNumber>;
    counts: z.ZodObject<{
        created: z.ZodNumber;
        updated: z.ZodNumber;
        skipped: z.ZodNumber;
        errors: z.ZodNumber;
    }, z.core.$strip>;
    entries: z.ZodArray<z.ZodObject<{
        collection: z.ZodEnum<{
            persons: "persons";
            achievements: "achievements";
            periods: "periods";
            lists: "lists";
            listItems: "listItems";
        }>;
        key: z.ZodString;
        id: z.ZodOptional<z.ZodNullable<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>>;
        action: z.ZodEnum<{
            error: "error";
            created: "created";
            updated: "updated";
            skipped: "skipped";
        }>;
        message: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type ContentBundleLifePeriod = z.infer<typeof ContentBundleLifePeriodSchema>;
export type ContentBundlePerson = z.infer<typeof ContentBundlePersonSchema>;
export type ContentBundleAchievement = z.infer<typeof ContentBundleAchievementSchema>;
export type ContentBundlePeriod = z.infer<typeof ContentBundlePeriodSchema>;
export type ContentBundleListItem = z.infer<typeof ContentBundleListItemSchema>;
export type ContentBundleList = z.infer<typeof ContentBundleListSchema>;
export type ContentBundle = z.infer<typeof ContentBundleSchema>;
export type ContentImportMode = z.infer<typeof ContentImportModeSchema>;
export type ContentImportRequest = z.infer<typeof ContentImportRequestSchema>;
export type ContentImportEntry = z.infer<typeof ContentImportEntrySchema>;
export type ContentImportReport = z.infer<typeof ContentImportReportSchema>;
