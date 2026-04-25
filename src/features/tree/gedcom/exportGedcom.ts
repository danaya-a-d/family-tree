import type { EntityState } from '@reduxjs/toolkit';
import type { TreeState } from '@/features/tree/treeSlice';
import type { Family, Gender, Id, LifeEvent, Person, RelationshipStatus } from '@/features/tree/types';
import { mapAppDateToGedcom } from './dates';
import { GEDCOM_LIFE_STATUS_TAG } from './lifeStatus';
import { formatGedcomName, GEDCOM_MARRIED_NAME_TAG } from './names';
import { GEDCOM_REL_STATUS_TAG } from './relationshipStatus';
import type { GedcomExportResult, GedcomWarning } from './types';
import { createGedcomWarning } from './warnings';

type PointerMaps = {
    personPointers: Map<Id, string>;
    familyPointers: Map<Id, string>;
};

const toEntityArray = <TEntity extends { id: Id }>(state: EntityState<TEntity, Id>): TEntity[] =>
    state.ids
        .map((id) => state.entities[id])
        .filter(Boolean) as TEntity[];

const cleanGedcomValue = (value: string): string =>
    value.replace(/[\r\n]+/g, ' ').trim();

const addLine = (
    lines: string[],
    level: number,
    tag: string,
    value?: string | null,
): void => {
    const cleaned = value == null ? '' : cleanGedcomValue(value);
    lines.push(cleaned ? `${level} ${tag} ${cleaned}` : `${level} ${tag}`);
};

const sanitizePointerPart = (value: string): string =>
    value.replace(/^@|@$/g, '').replace(/[^A-Za-z0-9_-]/g, '_') || 'UNKNOWN';

const makePointer = (
    gedcomPrefix: 'I' | 'F',
    appPrefix: 'p' | 'f',
    id: Id,
    usedPointers: Set<string>,
): string => {
    const raw = id.startsWith(`${appPrefix}:`) ? id.slice(2) : id;
    const sanitized = sanitizePointerPart(raw);
    const base = sanitized.toUpperCase().startsWith(gedcomPrefix)
        ? sanitized
        : `${gedcomPrefix}${sanitized}`;

    let pointer = `@${base}@`;
    let suffix = 2;
    while (usedPointers.has(pointer)) {
        pointer = `@${base}_${suffix}@`;
        suffix += 1;
    }

    usedPointers.add(pointer);
    return pointer;
};

const buildPointerMaps = (persons: Person[], families: Family[]): PointerMaps => {
    const usedPointers = new Set<string>();
    const personPointers = new Map<Id, string>();
    const familyPointers = new Map<Id, string>();

    for (const person of persons) {
        personPointers.set(person.id, makePointer('I', 'p', person.id, usedPointers));
    }

    for (const family of families) {
        familyPointers.set(family.id, makePointer('F', 'f', family.id, usedPointers));
    }

    return { personPointers, familyPointers };
};

const mapGenderToGedcom = (gender: Gender): string => {
    switch (gender) {
        case 'female':
            return 'F';
        case 'male':
            return 'M';
        default:
            return 'U';
    }
};

const addDateAndPlaceLines = (
    lines: string[],
    level: number,
    event: LifeEvent | undefined | null,
    warnings: GedcomWarning[],
    recordKind: 'individual' | 'family',
    pointer: string,
): void => {
    const dateResult = mapAppDateToGedcom(event?.date);
    warnings.push(
        ...dateResult.warnings.map((warning) => ({
            ...warning,
            recordKind,
            pointer,
        })),
    );

    if (dateResult.value) addLine(lines, level, 'DATE', dateResult.value);
    if (event?.place) addLine(lines, level, 'PLAC', event.place);
};

const addEvent = (
    lines: string[],
    level: number,
    tag: string,
    event: LifeEvent | undefined | null,
    warnings: GedcomWarning[],
    recordKind: 'individual' | 'family',
    pointer: string,
    force = false,
): void => {
    if (!force && !event?.date && !event?.place) return;

    addLine(lines, level, tag);
    addDateAndPlaceLines(lines, level + 1, event, warnings, recordKind, pointer);
};

const trimValue = (value: string | undefined): string | undefined =>
    value?.trim() || undefined;

const addNameRecord = (lines: string[], person: Person): void => {
    const givenName = trimValue(person.givenName);
    const familyName = trimValue(person.familyName);
    const maidenName = trimValue(person.maidenName);
    const primarySurname = maidenName ?? familyName;
    const primaryName = formatGedcomName({
        givenName,
        familyName: primarySurname,
    });

    if (!primaryName) return;

    addLine(lines, 1, 'NAME', primaryName);
    if (givenName) addLine(lines, 2, 'GIVN', givenName);
    if (primarySurname) addLine(lines, 2, 'SURN', primarySurname);
    if (familyName && maidenName) addLine(lines, 2, GEDCOM_MARRIED_NAME_TAG, familyName);
};

const addPersonRecord = (
    lines: string[],
    person: Person,
    pointer: string,
    warnings: GedcomWarning[],
): void => {
    addLine(lines, 0, pointer, 'INDI');

    addNameRecord(lines, person);
    addLine(lines, 1, 'SEX', mapGenderToGedcom(person.gender));
    if (person.lifeStatus === 'living') {
        addLine(lines, 1, GEDCOM_LIFE_STATUS_TAG, 'living');
    }

    addEvent(lines, 1, 'BIRT', person.birth, warnings, 'individual', pointer);

    if (person.lifeStatus === 'deceased') {
        addEvent(lines, 1, 'DEAT', person.death, warnings, 'individual', pointer, true);
    }

    if (person.portrait) {
        addLine(lines, 1, 'OBJE');
        addLine(lines, 2, 'FILE', person.portrait);
    }
};

const standardEventTagByStatus: Partial<Record<RelationshipStatus, string>> = {
    married: 'MARR',
    divorced: 'DIV',
    annulled: 'ANUL',
    engaged: 'ENGA',
};

const customStatusValues = new Set<RelationshipStatus>([
    'separated',
    'endedByDeath',
    'dating',
    'other',
]);

const addRelationshipStatus = (
    lines: string[],
    family: Family,
    warnings: GedcomWarning[],
    pointer: string,
): void => {
    const status = family.relationshipStatus ?? 'unknown';

    if (family.marriage && ['married', 'divorced', 'separated', 'endedByDeath'].includes(status)) {
        addEvent(lines, 1, 'MARR', family.marriage, warnings, 'family', pointer, true);
    }

    if (status === 'divorced') {
        addEvent(lines, 1, 'DIV', family.divorce, warnings, 'family', pointer, true);
        return;
    }

    if (status === 'married') {
        if (!family.marriage) addEvent(lines, 1, 'MARR', undefined, warnings, 'family', pointer, true);
        return;
    }

    const standardTag = standardEventTagByStatus[status];
    if (standardTag) {
        addEvent(lines, 1, standardTag, undefined, warnings, 'family', pointer, true);
        return;
    }

    if (customStatusValues.has(status)) {
        addLine(lines, 1, GEDCOM_REL_STATUS_TAG, status);
    }
};

type SpouseTag = 'HUSB' | 'WIFE';

type SpouseExportLink = {
    tag: SpouseTag;
    personId: Id;
};

const warnMissingSpouse = (
    warnings: GedcomWarning[],
    familyPointer: string,
    spouseId: Id,
): void => {
    warnings.push(
        createGedcomWarning({
            code: 'unknown-pointer',
            message: `Family references missing spouse ${spouseId}; GEDCOM link is skipped.`,
            recordKind: 'family',
            pointer: familyPointer,
            tag: 'FAM',
        }),
    );
};

const warnExtraSpouses = (
    warnings: GedcomWarning[],
    familyPointer: string,
    spouseIds: Id[],
): void => {
    if (spouseIds.length === 0) return;

    warnings.push(
        createGedcomWarning({
            code: 'mapping-not-implemented',
            message: `GEDCOM export supports at most two spouses per family; skipped ${spouseIds.join(', ')}.`,
            recordKind: 'family',
            pointer: familyPointer,
            tag: 'FAM',
        }),
    );
};

const fallbackSpouseLinks = (spouseIds: Id[]): SpouseExportLink[] =>
    spouseIds.slice(0, 2).map((personId, index) => ({
        personId,
        tag: index === 0 ? 'HUSB' : 'WIFE',
    }));

const getSpouseExportLinks = (
    family: Family,
    personsById: Map<Id, Person>,
    personPointers: Map<Id, string>,
    warnings: GedcomWarning[],
    familyPointer: string,
): SpouseExportLink[] => {
    const supportedSpouseIds: Id[] = [];
    const seenSpouseIds = new Set<Id>();

    for (const spouseId of family.spouses) {
        if (!personPointers.has(spouseId)) {
            warnMissingSpouse(warnings, familyPointer, spouseId);
            continue;
        }

        if (!seenSpouseIds.has(spouseId)) {
            seenSpouseIds.add(spouseId);
            supportedSpouseIds.push(spouseId);
        }
    }

    if (supportedSpouseIds.length === 1) {
        const [personId] = supportedSpouseIds;
        const tag = personsById.get(personId)?.gender === 'female' ? 'WIFE' : 'HUSB';
        return [{ personId, tag }];
    }

    const maleSpouseId = supportedSpouseIds.find(
        (personId) => personsById.get(personId)?.gender === 'male',
    );
    const femaleSpouseId = supportedSpouseIds.find(
        (personId) => personsById.get(personId)?.gender === 'female',
    );

    const links = maleSpouseId && femaleSpouseId && maleSpouseId !== femaleSpouseId
        ? [
            { personId: maleSpouseId, tag: 'HUSB' as const },
            { personId: femaleSpouseId, tag: 'WIFE' as const },
        ]
        : fallbackSpouseLinks(supportedSpouseIds);

    const exportedSpouseIds = new Set(links.map((link) => link.personId));
    warnExtraSpouses(
        warnings,
        familyPointer,
        supportedSpouseIds.filter((personId) => !exportedSpouseIds.has(personId)),
    );

    return links;
};

const addPersonPointerLine = (
    lines: string[],
    level: number,
    tag: string,
    personId: Id,
    personPointers: Map<Id, string>,
    warnings: GedcomWarning[],
    familyPointer: string,
): void => {
    const personPointer = personPointers.get(personId);
    if (!personPointer) {
        warnings.push(
            createGedcomWarning({
                code: 'unknown-pointer',
                message: `Family references missing person ${personId}; GEDCOM link is skipped.`,
                recordKind: 'family',
                pointer: familyPointer,
                tag,
            }),
        );
        return;
    }

    addLine(lines, level, tag, personPointer);
};

const addFamilyRecord = (
    lines: string[],
    family: Family,
    pointer: string,
    personsById: Map<Id, Person>,
    personPointers: Map<Id, string>,
    warnings: GedcomWarning[],
): void => {
    addLine(lines, 0, pointer, 'FAM');

    for (const { tag, personId } of getSpouseExportLinks(
        family,
        personsById,
        personPointers,
        warnings,
        pointer,
    )) {
        addPersonPointerLine(lines, 1, tag, personId, personPointers, warnings, pointer);
    }

    for (const childId of family.children) {
        addPersonPointerLine(lines, 1, 'CHIL', childId, personPointers, warnings, pointer);
    }

    addRelationshipStatus(lines, family, warnings, pointer);
};

export const exportGedcom = (tree: TreeState): GedcomExportResult => {
    const persons = toEntityArray(tree.persons);
    const families = toEntityArray(tree.families);
    const personsById = new Map(persons.map((person) => [person.id, person]));
    const { personPointers, familyPointers } = buildPointerMaps(persons, families);
    const warnings: GedcomWarning[] = [];

    const lines: string[] = [
        '0 HEAD',
        '1 GEDC',
        '2 VERS 5.5.1',
        '1 CHAR UTF-8',
    ];

    for (const person of persons) {
        const pointer = personPointers.get(person.id);
        if (pointer) addPersonRecord(lines, person, pointer, warnings);
    }

    for (const family of families) {
        const pointer = familyPointers.get(family.id);
        if (pointer) {
            addFamilyRecord(lines, family, pointer, personsById, personPointers, warnings);
        }
    }

    lines.push('0 TRLR');

    return {
        data: `${lines.join('\n')}\n`,
        warnings,
    };
};
