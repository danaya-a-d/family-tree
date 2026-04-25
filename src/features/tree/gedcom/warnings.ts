import type {
    GedcomRecordKind,
    GedcomUnsupportedKind,
    GedcomWarning,
    GedcomWarningCode,
    GedcomWarningSeverity,
} from './types';

type WarningInput = {
    code: GedcomWarningCode;
    message: string;
    severity?: GedcomWarningSeverity;
    recordKind?: GedcomRecordKind;
    pointer?: string;
    tag?: string;
};

const unsupportedCodeByKind: Record<GedcomUnsupportedKind, GedcomWarningCode> = {
    note: 'unsupported-note',
    source: 'unsupported-source',
    customTag: 'unsupported-custom-tag',
    media: 'unsupported-media',
    extraMedia: 'unsupported-extra-media',
    binaryMedia: 'unsupported-binary-media',
};

export const createGedcomWarning = ({
    code,
    message,
    severity = 'warning',
    recordKind,
    pointer,
    tag,
}: WarningInput): GedcomWarning => ({
    code,
    message,
    severity,
    recordKind,
    pointer,
    tag,
});

export const createUnsupportedGedcomWarning = (
    kind: GedcomUnsupportedKind,
    input: Omit<WarningInput, 'code' | 'severity'> & {
        severity?: GedcomWarningSeverity;
    },
): GedcomWarning =>
    createGedcomWarning({
        ...input,
        code: unsupportedCodeByKind[kind],
        severity: input.severity,
    });
