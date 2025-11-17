// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// This file is automatically copied from backend/shared-dto
// Source: shared-dto/dist/schemas.d.ts
// Generated: 2025-11-17T17:09:20.615Z

import { z } from 'zod';
export declare const PersonLifePeriodInputSchema: z.ZodObject<{
    countryId: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodNumber>;
    start: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodNumber>;
    end: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodNumber>;
}, z.core.$strip>;
export declare const UpsertPersonSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    birthYear: z.ZodNumber;
    deathYear: z.ZodNumber;
    category: z.ZodString;
    description: z.ZodDefault<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    wikiLink: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    saveAsDraft: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    lifePeriods: z.ZodOptional<z.ZodArray<z.ZodObject<{
        countryId: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodNumber>;
        start: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodNumber>;
        end: z.ZodPipe<z.ZodTransform<unknown, unknown>, z.ZodNumber>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
export declare const LifePeriodItemSchema: z.ZodObject<{
    country_id: z.ZodNumber;
    start_year: z.ZodNumber;
    end_year: z.ZodNumber;
    period_type: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const LifePeriodsSchema: z.ZodObject<{
    periods: z.ZodArray<z.ZodObject<{
        country_id: z.ZodNumber;
        start_year: z.ZodNumber;
        end_year: z.ZodNumber;
        period_type: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const PersonEditPayloadSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    birthYear: z.ZodOptional<z.ZodNumber>;
    deathYear: z.ZodOptional<z.ZodNumber>;
    category: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    wikiLink: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const AchievementGenericSchema: z.ZodObject<{
    year: z.ZodNumber;
    description: z.ZodString;
    wikipedia_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    image_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    country_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, z.core.$strip>;
export declare const AchievementPersonSchema: z.ZodObject<{
    year: z.ZodNumber;
    description: z.ZodString;
    wikipedia_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    image_url: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    saveAsDraft: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const ListPublicationRequestSchema: z.ZodObject<{
    description: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ListModerationActionSchema: z.ZodObject<{
    action: z.ZodEnum<{
        approve: "approve";
        reject: "reject";
    }>;
    comment: z.ZodOptional<z.ZodString>;
    slug: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
