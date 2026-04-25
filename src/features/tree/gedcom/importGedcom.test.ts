// @vitest-environment node
import { describe, expect, it } from 'vitest';
import type { Family, Id, Person } from '@/features/tree/types';
import { importGedcom } from './importGedcom';
import type { GedcomImportResult, GedcomWarningCode } from './types';

const gedcom = (body: string): string =>
    [
        '0 HEAD',
        '1 GEDC',
        '2 VERS 5.5.1',
        '1 CHAR UTF-8',
        body.trim(),
        '0 TRLR',
    ].join('\n');

const getPerson = (result: GedcomImportResult, id: Id): Person => {
    const person = result.data.persons.entities[id];
    expect(person).toBeDefined();
    return person as Person;
};

const getFamily = (result: GedcomImportResult, id: Id): Family => {
    const family = result.data.families.entities[id];
    expect(family).toBeDefined();
    return family as Family;
};

const warningCodes = (result: GedcomImportResult): GedcomWarningCode[] =>
    result.warnings.map((warning) => warning.code);

describe('importGedcom', () => {
    it('imports a single person with basic fields', () => {
        const result = importGedcom(gedcom(`
0 @I1@ INDI
1 NAME John /Doe/
1 SEX M
1 BIRT
2 DATE 12 JAN 1900
`));

        const person = getPerson(result, 'p:I1');

        expect(result.error).toBeUndefined();
        expect(person).toMatchObject({
            id: 'p:I1',
            givenName: 'John',
            familyName: 'Doe',
            gender: 'male',
            lifeStatus: 'unknown',
            birth: {
                date: { mod: 'exact', from: { y: 1900, m: 1, d: 12 } },
            },
        });
    });

    it('imports MyHeritage married and maiden surname fields', () => {
        const result = importGedcom(gedcom(`
0 @I1@ INDI
1 NAME Елена /Рымбалюк/
2 GIVN Елена
2 SURN Рымбалюк
2 _MARNM Давыденко
`));

        expect(getPerson(result, 'p:I1')).toMatchObject({
            givenName: 'Елена',
            familyName: 'Давыденко',
            maidenName: 'Рымбалюк',
        });
        expect(warningCodes(result)).not.toContain('unsupported-custom-tag');
    });

    it('keeps normal GEDCOM SURN as familyName when married name is absent', () => {
        const result = importGedcom(gedcom(`
0 @I1@ INDI
1 NAME Jane /Birth/
2 GIVN Jane
2 SURN Birth
`));

        expect(getPerson(result, 'p:I1')).toMatchObject({
            givenName: 'Jane',
            familyName: 'Birth',
        });
        expect(getPerson(result, 'p:I1').maidenName).toBeUndefined();
    });

    it('warns and ignores misplaced MyHeritage married name tags', () => {
        const result = importGedcom(gedcom(`
0 @I1@ INDI
1 NAME Jane /Birth/
2 GIVN Jane
2 SURN Birth
1 _MARNM Married
`));

        expect(getPerson(result, 'p:I1')).toMatchObject({
            givenName: 'Jane',
            familyName: 'Birth',
        });
        expect(getPerson(result, 'p:I1').maidenName).toBeUndefined();
        expect(warningCodes(result)).toContain('unsupported-custom-tag');
    });

    it('maps DEAT presence to deceased and missing DEAT to unknown', () => {
        const result = importGedcom(gedcom(`
0 @I1@ INDI
1 NAME Alive /Unknown/
0 @I2@ INDI
1 NAME Dead /Known/
1 DEAT
2 DATE 1990
`));

        expect(getPerson(result, 'p:I1').lifeStatus).toBe('unknown');
        expect(getPerson(result, 'p:I2').lifeStatus).toBe('deceased');
    });

    it('imports allowlisted life status custom tag with DEAT precedence', () => {
        const result = importGedcom(gedcom(`
0 @I1@ INDI
1 NAME Living /Custom/
1 _MYROOTS_LIFE_STATUS living
0 @I2@ INDI
1 NAME Conflict /Custom/
1 _MYROOTS_LIFE_STATUS living
1 DEAT
0 @I3@ INDI
1 NAME Invalid /Custom/
1 _MYROOTS_LIFE_STATUS alive
0 @I4@ INDI
1 NAME Deceased /Custom/
1 _MYROOTS_LIFE_STATUS deceased
`));

        expect(getPerson(result, 'p:I1').lifeStatus).toBe('living');
        expect(getPerson(result, 'p:I2').lifeStatus).toBe('deceased');
        expect(getPerson(result, 'p:I3').lifeStatus).toBe('unknown');
        expect(getPerson(result, 'p:I4').lifeStatus).toBe('deceased');
        expect(warningCodes(result)).toContain('life-status-conflict');
        expect(warningCodes(result)).toContain('unsupported-life-status');
        expect(warningCodes(result)).not.toContain('unsupported-custom-tag');
    });

    it.each([
        ['12 JAN 1900', { mod: 'exact', from: { y: 1900, m: 1, d: 12 } }, undefined],
        ['ABT 1900', { mod: 'abt', from: { y: 1900 } }, undefined],
        ['ABOUT 1900', { mod: 'abt', from: { y: 1900 } }, undefined],
        ['EST 1900', { mod: 'abt', from: { y: 1900 } }, 'date-semantics-changed'],
        ['CAL 1900', { mod: 'abt', from: { y: 1900 } }, 'date-semantics-changed'],
        ['BEF 1900', { mod: 'bef', from: { y: 1900 } }, undefined],
        ['AFT 1900', { mod: 'aft', from: { y: 1900 } }, undefined],
        ['BET 1900 AND 1901', { mod: 'between', from: { y: 1900 }, to: { y: 1901 } }, undefined],
        ['FROM 1900 TO 1901', { mod: 'between', from: { y: 1900 }, to: { y: 1901 } }, 'date-semantics-changed'],
        ['FROM 1900', { mod: 'aft', from: { y: 1900 } }, 'date-semantics-changed'],
        ['TO 1900', { mod: 'bef', from: { y: 1900 } }, 'date-semantics-changed'],
    ] as const)('maps GEDCOM date %s', (dateValue, expectedDate, expectedWarning) => {
        const result = importGedcom(gedcom(`
0 @I1@ INDI
1 NAME Date /Person/
1 BIRT
2 DATE ${dateValue}
`));

        expect(getPerson(result, 'p:I1').birth?.date).toEqual(expectedDate);
        if (expectedWarning) {
            expect(warningCodes(result)).toContain(expectedWarning);
        } else {
            expect(warningCodes(result)).not.toContain('unsupported-date');
        }
    });

    it('warns and drops invalid app-incompatible dates', () => {
        const result = importGedcom(gedcom(`
0 @I1@ INDI
1 NAME Invalid /Date/
1 BIRT
2 DATE 32 JAN 1900
`));

        expect(getPerson(result, 'p:I1').birth).toBeUndefined();
        expect(warningCodes(result)).toContain('unsupported-date');
    });

    it('creates families, parentFamilyId, multiple spouse families, and derived active spouse families', () => {
        const result = importGedcom(gedcom(`
0 @I1@ INDI
1 NAME Parent /One/
1 FAMS @F1@
1 FAMS @F2@
1 _ACTIVE_SPOUSE_FAMILY @F999@
0 @I2@ INDI
1 NAME Parent /Two/
0 @I3@ INDI
1 NAME Parent /Three/
0 @I4@ INDI
1 NAME Child /One/
1 FAMC @F1@
0 @F1@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 CHIL @I4@
0 @F2@ FAM
1 HUSB @I1@
1 WIFE @I3@
`));

        expect(getFamily(result, 'f:F1').spouses).toEqual(['p:I1', 'p:I2']);
        expect(getFamily(result, 'f:F1').children).toEqual(['p:I4']);
        expect(getFamily(result, 'f:F2').spouses).toEqual(['p:I1', 'p:I3']);
        expect(getPerson(result, 'p:I4').parentFamilyId).toBe('f:F1');
        expect(result.data.activeSpouseFamily['p:I1']).toBe('f:F1');
        expect(warningCodes(result)).toContain('unsupported-custom-tag');
    });

    it('maps relationship statuses with standard precedence and custom override', () => {
        const result = importGedcom(gedcom(`
0 @I1@ INDI
1 NAME One /Person/
1 DEAT
0 @I2@ INDI
1 NAME Two /Person/
0 @F1@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 MARR
0 @F2@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 DIV
0 @F3@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 ANUL
0 @F4@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 ENGA
0 @F5@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 ENGA
1 MARR
0 @F6@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 MARR
2 DATE 1900
1 DIV
2 DATE 1910
0 @F7@ FAM
1 HUSB @I1@
1 WIFE @I2@
0 @F8@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 _MYROOTS_REL_STATUS separated
1 MARR
0 @F9@ FAM
1 HUSB @I1@
1 WIFE @I2@
1 _OTHER_STATUS custom
1 MARR
`));

        expect(getFamily(result, 'f:F1').relationshipStatus).toBe('married');
        expect(getFamily(result, 'f:F2').relationshipStatus).toBe('divorced');
        expect(getFamily(result, 'f:F3').relationshipStatus).toBe('annulled');
        expect(getFamily(result, 'f:F4').relationshipStatus).toBe('engaged');
        expect(getFamily(result, 'f:F5').relationshipStatus).toBe('married');

        const divorcedFamily = getFamily(result, 'f:F6');
        expect(divorcedFamily.relationshipStatus).toBe('divorced');
        expect(divorcedFamily.marriage?.date).toEqual({ mod: 'exact', from: { y: 1900 } });
        expect(divorcedFamily.divorce?.date).toEqual({ mod: 'exact', from: { y: 1910 } });

        expect(getFamily(result, 'f:F7').relationshipStatus).toBe('unknown');
        expect(getFamily(result, 'f:F7').relationshipStatus).not.toBe('endedByDeath');
        expect(getFamily(result, 'f:F7').relationshipStatus).not.toBe('dating');
        expect(getFamily(result, 'f:F8').relationshipStatus).toBe('separated');
        expect(getFamily(result, 'f:F9').relationshipStatus).toBe('married');
        expect(warningCodes(result)).toContain('unsupported-custom-tag');
    });

    it('imports one primary photo and warns for unsupported, extra, and binary media', () => {
        const result = importGedcom(gedcom(`
0 @I1@ INDI
1 NAME Media /Person/
1 OBJE
2 FILE profile.txt
1 OBJE
2 FILE portrait.jpg
1 OBJE
2 FILE extra.png
1 OBJE
2 BLOB
3 CONT ABC
`));

        expect(getPerson(result, 'p:I1').portrait).toBe('portrait.jpg');
        expect(warningCodes(result)).toContain('unsupported-media');
        expect(warningCodes(result)).toContain('unsupported-extra-media');
        expect(warningCodes(result)).toContain('unsupported-binary-media');
    });

    it('warns for invalid references without crashing', () => {
        const result = importGedcom(gedcom(`
0 @I1@ INDI
1 NAME Ref /Person/
1 FAMC @MISSING_FAMC@
1 FAMS @MISSING_FAMS@
0 @F1@ FAM
1 HUSB @MISSING_HUSB@
1 WIFE @I1@
1 CHIL @MISSING_CHILD@
`));

        expect(result.error).toBeUndefined();
        expect(getFamily(result, 'f:F1').spouses).toEqual(['p:I1']);
        expect(warningCodes(result).filter((code) => code === 'unknown-pointer')).toHaveLength(4);
    });

    it('returns a typed parse error result for invalid GEDCOM', () => {
        const result = importGedcom('not a gedcom file');

        expect(result.error).toEqual({
            code: 'parse-error',
            message: expect.any(String),
        });
        expect(warningCodes(result)).toContain('import-error');
        expect(result.data.persons.ids).toEqual([]);
        expect(result.data.families.ids).toEqual([]);
    });
});
