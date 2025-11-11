// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// This file is automatically copied from backend/shared-dto
// Source: C:\Users\Selecty\Documents\PetProjects\chronoline-backend-only\shared-dto\dist\dtoDescriptors.d.ts
// Generated: 2025-11-10T06:19:41.374Z

export const DTO_VERSION = "2025-11-08-2";
export type dtoDescriptors = {
    readonly UpsertPerson: {
        readonly id: "string";
        readonly name: "string";
        readonly birthYear: "int";
        readonly deathYear: "int";
        readonly category: "string";
        readonly description: "string";
        readonly imageUrl: "url|null?";
        readonly wikiLink: "url|null?";
        readonly saveAsDraft: "boolean?";
        readonly lifePeriods: "PersonLifePeriodInput[]?";
    };
    readonly PersonLifePeriodInput: {
        readonly countryId: "int+";
        readonly start: "int";
        readonly end: "int";
    };
    readonly LifePeriodItem: {
        readonly country_id: "int+";
        readonly start_year: "int";
        readonly end_year: "int";
        readonly period_type: "string?";
    };
    readonly LifePeriods: {
        readonly periods: "LifePeriodItem[]";
    };
    readonly PersonEditPayload: {
        readonly name: "string?";
        readonly birthYear: "int?";
        readonly deathYear: "int?";
        readonly category: "string?";
        readonly description: "string?";
        readonly imageUrl: "url|null?";
        readonly wikiLink: "url|null?";
    };
    readonly AchievementGeneric: {
        readonly year: "int";
        readonly description: "string";
        readonly wikipedia_url: "url|null?";
        readonly image_url: "url|null?";
        readonly country_id: "int|null?";
    };
    readonly AchievementPerson: {
        readonly year: "int";
        readonly description: "string";
        readonly wikipedia_url: "url|null?";
        readonly image_url: "url|null?";
        readonly saveAsDraft: "boolean?";
    };
    readonly ListPublicationRequest: {
        readonly description: "string?";
    };
    readonly ListModerationAction: {
        readonly action: "enum('approve'|'reject')";
        readonly comment: "string?";
        readonly slug: "string?";
    };
};
