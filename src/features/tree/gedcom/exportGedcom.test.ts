// @vitest-environment node
import { describe, expect, it } from 'vitest';
import type { TreeState } from '@/features/tree/treeSlice';
import type { Family, Id, Person } from '@/features/tree/types';
import { exportGedcom } from './exportGedcom';
import { importGedcom } from './importGedcom';
import type { GedcomExportResult, GedcomImportResult, GedcomWarningCode } from './types';

const makeTree = (persons: Person[], families: Family[]): TreeState => ({
    persons: {
        ids: persons.map((person) => person.id),
        entities: Object.fromEntries(persons.map((person) => [person.id, person])),
    },
    families: {
        ids: families.map((family) => family.id),
        entities: Object.fromEntries(families.map((family) => [family.id, family])),
    },
    rootPersonId: persons[0]?.id,
    activeSpouseFamily: Object.fromEntries(
        families.flatMap((family) =>
            family.spouses.map((personId) => [personId, family.id])),
    ),
});

const getImportedPerson = (result: GedcomImportResult, id: Id): Person => {
    const person = result.data.persons.entities[id];
    expect(person).toBeDefined();
    return person as Person;
};

const getImportedFamily = (result: GedcomImportResult, id: Id): Family => {
    const family = result.data.families.entities[id];
    expect(family).toBeDefined();
    return family as Family;
};

const warningCodes = (result: GedcomExportResult): GedcomWarningCode[] =>
    result.warnings.map((warning) => warning.code);

const countMatches = (value: string, pattern: RegExp): number =>
    value.match(pattern)?.length ?? 0;

describe('exportGedcom', () => {
    it('exports supported person fields, portrait, and deceased-only DEAT', () => {
        const result = exportGedcom(makeTree([
            {
                id: 'p:I1',
                givenName: 'John',
                familyName: 'Doe',
                maidenName: 'Smith',
                gender: 'male',
                portrait: 'portraits/john.jpg',
                lifeStatus: 'deceased',
                birth: {
                    date: { mod: 'exact', from: { y: 1900, m: 1, d: 12 } },
                    place: 'London',
                },
                death: {
                    date: { mod: 'bef', from: { y: 1980 } },
                    place: 'Paris',
                },
            },
            {
                id: 'p:I2',
                givenName: 'Living',
                familyName: 'Person',
                gender: 'female',
                lifeStatus: 'living',
                death: { date: { mod: 'exact', from: { y: 2000 } } },
            },
            {
                id: 'p:I3',
                givenName: 'Unknown',
                familyName: 'Person',
                gender: 'unknown',
                lifeStatus: 'unknown',
            },
        ], []));

        expect(result.data).toContain('0 @I1@ INDI');
        expect(result.data).toContain('1 NAME John /Smith/');
        expect(result.data).toContain('2 GIVN John');
        expect(result.data).toContain('2 SURN Smith');
        expect(result.data).toContain('2 _MARNM Doe');
        expect(result.data).toContain('1 NAME Living /Person/');
        expect(result.data).toContain('2 SURN Person');
        expect(result.data).not.toContain('2 TYPE maiden');
        expect(result.data).toContain('1 SEX M');
        expect(result.data).toContain('1 BIRT');
        expect(result.data).toContain('2 DATE 12 JAN 1900');
        expect(result.data).toContain('2 PLAC London');
        expect(result.data).toContain('1 DEAT');
        expect(result.data).toContain('2 DATE BEF 1980');
        expect(result.data).toContain('2 PLAC Paris');
        expect(result.data).toContain('1 OBJE');
        expect(result.data).toContain('2 FILE portraits/john.jpg');
        expect(result.data).toContain('1 _MYROOTS_LIFE_STATUS living');
        expect(result.data).not.toContain('1 _MYROOTS_LIFE_STATUS unknown');
        expect(result.data).not.toContain('1 _MYROOTS_LIFE_STATUS deceased');
        expect(countMatches(result.data, /^1 DEAT$/gm)).toBe(1);
        expect(result.data).not.toContain('rootPersonId');
        expect(result.data).not.toContain('activeSpouseFamily');
        expect(result.data).not.toContain('lifeStatus');

        const imported = importGedcom(result.data);
        expect(getImportedPerson(imported, 'p:I1').lifeStatus).toBe('deceased');
        expect(getImportedPerson(imported, 'p:I1').familyName).toBe('Doe');
        expect(getImportedPerson(imported, 'p:I1').maidenName).toBe('Smith');
        expect(getImportedPerson(imported, 'p:I1').portrait).toBe('portraits/john.jpg');
        expect(getImportedPerson(imported, 'p:I2').lifeStatus).toBe('living');
        expect(getImportedPerson(imported, 'p:I2').death).toBeUndefined();
        expect(getImportedPerson(imported, 'p:I3').lifeStatus).toBe('unknown');
    });

    it('exports app date modifiers to supported GEDCOM date forms', () => {
        const result = exportGedcom(makeTree([
            { id: 'p:I1', gender: 'unknown', birth: { date: { mod: 'exact', from: { y: 1900 } } } },
            { id: 'p:I2', gender: 'unknown', birth: { date: { mod: 'abt', from: { y: 1900 } } } },
            { id: 'p:I3', gender: 'unknown', birth: { date: { mod: 'bef', from: { y: 1900 } } } },
            { id: 'p:I4', gender: 'unknown', birth: { date: { mod: 'aft', from: { y: 1900 } } } },
            {
                id: 'p:I5',
                gender: 'unknown',
                birth: { date: { mod: 'between', from: { y: 1900 }, to: { y: 1901 } } },
            },
            { id: 'p:I6', gender: 'unknown', birth: { date: { mod: 'exact', from: { y: 900 } } } },
        ], []));

        expect(result.data).toContain('2 DATE 1900');
        expect(result.data).toContain('2 DATE ABT 1900');
        expect(result.data).toContain('2 DATE BEF 1900');
        expect(result.data).toContain('2 DATE AFT 1900');
        expect(result.data).toContain('2 DATE BET 1900 AND 1901');
        expect(warningCodes(result)).toContain('unsupported-date');
    });

    it('exports family links and relationship statuses without app-only state', () => {
        const persons: Person[] = [
            {
                id: 'p:I1',
                givenName: 'Husband',
                familyName: 'One',
                gender: 'male',
                lifeStatus: 'deceased',
            },
            { id: 'p:I2', givenName: 'Wife', familyName: 'One', gender: 'female' },
            { id: 'p:I3', givenName: 'Child', familyName: 'One', gender: 'unknown' },
        ];
        const familyBase = { spouses: ['p:I1', 'p:I2'], children: ['p:I3'] };
        const families: Family[] = [
            {
                id: 'f:F1',
                ...familyBase,
                relationshipStatus: 'married',
                marriage: { date: { mod: 'exact', from: { y: 1900 } } },
            },
            {
                id: 'f:F2',
                ...familyBase,
                relationshipStatus: 'divorced',
                marriage: { date: { mod: 'exact', from: { y: 1900 } } },
                divorce: { date: { mod: 'exact', from: { y: 1910 } } },
            },
            { id: 'f:F3', ...familyBase, relationshipStatus: 'annulled' },
            { id: 'f:F4', ...familyBase, relationshipStatus: 'engaged' },
            { id: 'f:F5', ...familyBase, relationshipStatus: 'unknown' },
            {
                id: 'f:F6',
                ...familyBase,
                relationshipStatus: 'separated',
                marriage: { date: { mod: 'exact', from: { y: 1920 } } },
            },
            { id: 'f:F7', ...familyBase, relationshipStatus: 'endedByDeath' },
            { id: 'f:F8', ...familyBase, relationshipStatus: 'dating' },
            { id: 'f:F9', ...familyBase, relationshipStatus: 'other' },
        ];

        const result = exportGedcom(makeTree(persons, families));

        expect(result.data).toContain('0 @F1@ FAM');
        expect(result.data).toContain('1 HUSB @I1@');
        expect(result.data).toContain('1 WIFE @I2@');
        expect(result.data).toContain('1 CHIL @I3@');
        expect(result.data).toContain('1 MARR');
        expect(result.data).toContain('1 DIV');
        expect(result.data).toContain('1 ANUL');
        expect(result.data).toContain('1 ENGA');
        expect(result.data).toContain('1 _MYROOTS_REL_STATUS separated');
        expect(result.data).toContain('1 _MYROOTS_REL_STATUS endedByDeath');
        expect(result.data).toContain('1 _MYROOTS_REL_STATUS dating');
        expect(result.data).toContain('1 _MYROOTS_REL_STATUS other');
        expect(result.data).not.toContain('1 _MYROOTS_REL_STATUS unknown');

        const imported = importGedcom(result.data);
        expect(getImportedFamily(imported, 'f:F1').relationshipStatus).toBe('married');
        expect(getImportedFamily(imported, 'f:F2').relationshipStatus).toBe('divorced');
        expect(getImportedFamily(imported, 'f:F2').marriage?.date).toEqual({ mod: 'exact', from: { y: 1900 } });
        expect(getImportedFamily(imported, 'f:F2').divorce?.date).toEqual({ mod: 'exact', from: { y: 1910 } });
        expect(getImportedFamily(imported, 'f:F3').relationshipStatus).toBe('annulled');
        expect(getImportedFamily(imported, 'f:F4').relationshipStatus).toBe('engaged');
        expect(getImportedFamily(imported, 'f:F5').relationshipStatus).toBe('unknown');
        expect(getImportedFamily(imported, 'f:F6').relationshipStatus).toBe('separated');
        expect(getImportedFamily(imported, 'f:F7').relationshipStatus).toBe('endedByDeath');
        expect(getImportedFamily(imported, 'f:F8').relationshipStatus).toBe('dating');
        expect(getImportedFamily(imported, 'f:F9').relationshipStatus).toBe('other');
    });

    it('uses deterministic HUSB/WIFE fallback for unknown-gender spouses', () => {
        const result = exportGedcom(makeTree([
            { id: 'p:I1', givenName: 'First', gender: 'unknown' },
            { id: 'p:I2', givenName: 'Second', gender: 'unknown' },
        ], [
            {
                id: 'f:F1',
                spouses: ['p:I1', 'p:I2'],
                children: [],
                relationshipStatus: 'married',
            },
        ]));

        expect(countMatches(result.data, /^1 HUSB /gm)).toBe(1);
        expect(countMatches(result.data, /^1 WIFE /gm)).toBe(1);
        expect(result.data).toContain('1 HUSB @I1@');
        expect(result.data).toContain('1 WIFE @I2@');
        expect(countMatches(result.data, /^1 SEX U$/gm)).toBe(2);

        const imported = importGedcom(result.data);
        expect(getImportedFamily(imported, 'f:F1').spouses).toEqual(['p:I1', 'p:I2']);
        expect(getImportedFamily(imported, 'f:F1').relationshipStatus).toBe('married');
    });

    it('uses deterministic HUSB/WIFE fallback for same-gender spouses', () => {
        const result = exportGedcom(makeTree([
            { id: 'p:I1', givenName: 'First', gender: 'female' },
            { id: 'p:I2', givenName: 'Second', gender: 'female' },
        ], [
            {
                id: 'f:F1',
                spouses: ['p:I1', 'p:I2'],
                children: [],
                relationshipStatus: 'divorced',
            },
        ]));

        expect(countMatches(result.data, /^1 HUSB /gm)).toBe(1);
        expect(countMatches(result.data, /^1 WIFE /gm)).toBe(1);
        expect(result.data).toContain('1 HUSB @I1@');
        expect(result.data).toContain('1 WIFE @I2@');
        expect(countMatches(result.data, /^1 SEX F$/gm)).toBe(2);

        const imported = importGedcom(result.data);
        expect(getImportedFamily(imported, 'f:F1').spouses).toEqual(['p:I1', 'p:I2']);
        expect(getImportedFamily(imported, 'f:F1').relationshipStatus).toBe('divorced');
    });

    it('skips extra spouses beyond one HUSB and one WIFE with a warning', () => {
        const result = exportGedcom(makeTree([
            { id: 'p:I1', gender: 'unknown' },
            { id: 'p:I2', gender: 'unknown' },
            { id: 'p:I3', gender: 'unknown' },
        ], [
            {
                id: 'f:F1',
                spouses: ['p:I1', 'p:I2', 'p:I3'],
                children: [],
                relationshipStatus: 'other',
            },
        ]));

        expect(countMatches(result.data, /^1 HUSB /gm)).toBe(1);
        expect(countMatches(result.data, /^1 WIFE /gm)).toBe(1);
        expect(warningCodes(result)).toContain('mapping-not-implemented');

        const imported = importGedcom(result.data);
        expect(getImportedFamily(imported, 'f:F1').spouses).toEqual(['p:I1', 'p:I2']);
        expect(getImportedFamily(imported, 'f:F1').relationshipStatus).toBe('other');
    });

    it('warns and skips family links to missing persons', () => {
        const result = exportGedcom(makeTree([
            { id: 'p:I1', gender: 'unknown' },
        ], [
            {
                id: 'f:F1',
                spouses: ['p:I1', 'p:MISSING_SPOUSE'],
                children: ['p:MISSING_CHILD'],
                relationshipStatus: 'unknown',
            },
        ]));

        expect(result.data).toContain('1 HUSB @I1@');
        expect(warningCodes(result).filter((code) => code === 'unknown-pointer')).toHaveLength(2);
    });
});
