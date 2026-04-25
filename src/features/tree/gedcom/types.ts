import type { TreeState } from '@/features/tree/treeSlice';
import type {
    Family,
    Id,
    LifeEventDate,
    Person,
} from '@/features/tree/types';

export type GedcomRecordKind =
    | 'header'
    | 'individual'
    | 'family'
    | 'multimedia'
    | 'unknown';

export type GedcomUnsupportedKind =
    | 'note'
    | 'source'
    | 'customTag'
    | 'media'
    | 'extraMedia'
    | 'binaryMedia';

export type GedcomWarningCode =
    | 'unsupported-note'
    | 'unsupported-source'
    | 'unsupported-custom-tag'
    | 'unsupported-media'
    | 'unsupported-extra-media'
    | 'unsupported-binary-media'
    | 'unsupported-date'
    | 'date-semantics-changed'
    | 'unsupported-life-status'
    | 'life-status-conflict'
    | 'unsupported-relationship-status'
    | 'unknown-pointer'
    | 'import-error'
    | 'mapping-not-implemented';

export type GedcomWarningSeverity = 'info' | 'warning' | 'error';

export interface GedcomWarning {
    code: GedcomWarningCode;
    message: string;
    severity: GedcomWarningSeverity;
    recordKind?: GedcomRecordKind;
    pointer?: string;
    tag?: string;
}

export interface GedcomAdapterResult<TData> {
    data: TData;
    warnings: GedcomWarning[];
}

export type GedcomImportErrorCode = 'parse-error';

export interface GedcomImportError {
    code: GedcomImportErrorCode;
    message: string;
}

export type GedcomImportResult = GedcomAdapterResult<TreeState> & {
    error?: GedcomImportError;
};

export type GedcomExportResult = GedcomAdapterResult<string>;

export interface GedcomPointerMaps {
    personsByPointer: Record<string, Id>;
    familiesByPointer: Record<string, Id>;
}

export interface GedcomAppModelDraft {
    persons: Person[];
    families: Family[];
    pointerMaps: GedcomPointerMaps;
}

export interface GedcomNameMapping {
    givenName?: Person['givenName'];
    familyName?: Person['familyName'];
    maidenName?: Person['maidenName'];
}

export interface GedcomDateMappingResult {
    date?: LifeEventDate;
    warnings: GedcomWarning[];
}

export interface GedcomDateFormatResult {
    value?: string;
    warnings: GedcomWarning[];
}

export interface GedcomMediaFile {
    file: string;
    format?: string;
    title?: string;
}

export interface GedcomPrimaryPhotoResult {
    portrait?: Person['portrait'];
    warnings: GedcomWarning[];
}
