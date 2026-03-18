import Modal from '../../common/Modal/Modal';
import Form from '../../common/Form/Form';
import Title from '../../common/Title/Title';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { useState } from 'react';
import { addPerson, addPersonWithRelation, removePerson, updateFamily, updatePerson } from '@/features/tree/treeSlice';
import type { ButtonConfig, ErrorsMap, FormField } from '../../common/ui.types';
import {
    AddRelativeContext, Family,
    Gender, Id,
    LifeEvent,
    LifeEventDate,
    LifeState,
    Person, RelationshipStatus,
    RelativeKind, SpousesForPerson,
} from '@/features/tree/types';
import { RadioOption, SelectOption, SelectPersonOption } from '@/components/common/Form/Form.types';
import { validateLifeEventDate } from '@/components/common/validation';
import { selectPersonById, selectSpousesOfPerson, selectAttachSpouseFamilies } from '@/features/tree/selectors';
import { getDefaultPortrait } from '@/features/tree/lib/getDefaultPortrait';
import styles from './PersonModal.module.css';

interface PersonModalProps {
    person?: Person;
    addContext?: AddRelativeContext;
    onClose: () => void;
}

type PersonFormValues = {
    firstName: string;
    lastName: string;
    maidenName: string;
    gender: Gender;
    portrait: string | null;

    dateOfBirth: LifeEventDate;
    placeOfBirth: LifeEvent['place'];

    lifeState: LifeState;
    dateOfDeath: LifeEventDate;
    placeOfDeath: LifeEvent['place'];

    parentFamilyId?: Id | '';
    spouseFamilyId?: Id;
    spouseAttachFamilyId?: Id | '';
    relationshipStatus?: RelationshipStatus;
    dateOfMarriage?: LifeEventDate;
    placeOfMarriage: LifeEvent['place'];
    dateOfDivorce?: LifeEventDate;
    placeOfDivorce: LifeEvent['place'];
};

type SpouseDraft = Pick<Family, 'relationshipStatus' | 'marriage' | 'divorce'>

const EMPTY_SPOUSES: SpousesForPerson[] = [];
const EMPTY_FAMILIES: Family[] = [];

const PersonModal = ({ person, addContext, onClose }: PersonModalProps) => {

    const dispatch = useDispatch();

    const isEdit = !!person;
    const isAddRelative = !!addContext;
    const isAddSpouse = isAddRelative && addContext.kind === 'spouse';
    const isAddChild = isAddRelative && (addContext.kind === 'son' || addContext.kind === 'daughter');

    const anchorPerson = useSelector((s: RootState) =>
        addContext ? selectPersonById(s, addContext.anchorPersonId) : undefined,
    );
    const [spouseErrors, setSpouseErrors] = useState<ErrorsMap>({});
    const spouses = useSelector((s: RootState) =>
        person ? selectSpousesOfPerson(s, person.id) : EMPTY_SPOUSES,
    );
    const parentFamilies = useSelector((s: RootState) =>
        isAddChild && addContext ? selectSpousesOfPerson(s, addContext.anchorPersonId) : EMPTY_SPOUSES,
    );
    const attachSpouseFamilies = useSelector((s: RootState) =>
        isAddSpouse && addContext
            ? selectAttachSpouseFamilies(s, addContext.anchorPersonId)
            : EMPTY_FAMILIES,
    );
    const personsById = useSelector((s: RootState) => s.tree.persons.entities);

    const showSpouseSection = (spouses?.length ?? 0) > 0 || isAddSpouse;

    const [spouseDrafts, setSpouseDrafts] = useState<Record<Id, SpouseDraft>>(
        () => {
            const drafts: Record<Id, SpouseDraft> = {};

            for (const s of spouses) {
                drafts[s.familyId] = {
                    relationshipStatus: s.relationshipStatus,
                    marriage: s.marriage,
                    divorce: s.divorce,
                };
            }
            return drafts;
        },
    );

    const getRelFlags = (v: Pick<PersonFormValues, 'relationshipStatus'>) => {
        const s = v.relationshipStatus;

        const showMarriage =
            s === 'married' ||
            s === 'separated' ||
            s === 'endedByDeath' ||
            s === 'divorced';

        const showDivorce = s === 'divorced';

        return { showMarriage, showDivorce };
    };

    const familiesById = useSelector((s: RootState) => s.tree.families.entities);

    const isSingleParentFamily = (familyId?: Id) => {
        if (!familyId) return false;
        const fam = familiesById[familyId];
        return (fam?.spouses?.length ?? 0) < 2;
    };

    const isCoupleFamilySelected = (v: PersonFormValues) =>
        !!v.spouseFamilyId && !isSingleParentFamily(v.spouseFamilyId);

    const isMarriageVisible = (v: PersonFormValues) =>
        showSpouseSection && isCoupleFamilySelected(v) && getRelFlags(v).showMarriage;

    const isDivorceVisible = (v: PersonFormValues) =>
        showSpouseSection && isCoupleFamilySelected(v) && getRelFlags(v).showDivorce;

    const GENDER_BY_KIND: Record<RelativeKind, Gender | undefined> = {
        father: 'male',
        son: 'male',
        brother: 'male',
        mother: 'female',
        daughter: 'female',
        sister: 'female',
        spouse: 'unknown',
    };

    const initialValues: PersonFormValues = person
        ? {
            firstName: person.givenName ?? '',
            lastName: person.familyName ?? '',
            maidenName: person.maidenName ?? '',
            gender: person.gender ?? 'unknown',
            portrait: person.portrait ?? null,

            dateOfBirth: person.birth?.date ?? undefined,
            placeOfBirth: person.birth?.place ?? '',

            lifeState: person.lifeStatus ?? 'unknown',
            dateOfDeath: person.death?.date ?? undefined,
            placeOfDeath: person.death?.place ?? '',

            parentFamilyId: '',
            spouseFamilyId: spouses[0]?.familyId,
            spouseAttachFamilyId: '',
            relationshipStatus: spouses[0]?.relationshipStatus ?? 'unknown',

            dateOfMarriage: spouses[0]?.marriage?.date ?? undefined,
            placeOfMarriage: spouses[0]?.marriage?.place ?? '',

            dateOfDivorce: spouses[0]?.divorce?.date ?? undefined,
            placeOfDivorce: spouses[0]?.divorce?.place ?? '',
        }
        : {
            firstName: '',
            lastName: '',
            maidenName: '',
            gender: GENDER_BY_KIND[addContext.kind] ?? 'unknown',
            portrait: null,

            lifeState: 'unknown',
            dateOfBirth: undefined,
            placeOfBirth: '',

            dateOfDeath: undefined,
            placeOfDeath: '',

            parentFamilyId: parentFamilies[0]?.familyId ?? '',
            spouseFamilyId: undefined,
            spouseAttachFamilyId: attachSpouseFamilies[0]?.id ?? '',
            relationshipStatus: 'unknown',

            dateOfMarriage: undefined,
            placeOfMarriage: '',

            dateOfDivorce: undefined,
            placeOfDivorce: '',
        };

    const [currenSpouseFamilyId, setCurrenSpouseFamilyId] = useState<Id | null>(
        initialValues.spouseFamilyId ?? null,
    );

    const handleDelete = () => {
        if (person) {
            dispatch(removePerson(person.id));
        }
        onClose();
    };

    const makeLifeEvent = (date?: LifeEventDate, place?: string): LifeEvent | undefined => {
        const d = date || undefined;
        const p = place?.trim() || undefined;
        return d || p ? { date: d, place: p } : undefined;
    };

    const spouseDraftFromValues = (values: PersonFormValues): SpouseDraft | null => {
        const familyId = values.spouseFamilyId;
        if (!familyId) return null;

        const status = values.relationshipStatus ?? 'unknown';
        const { showMarriage, showDivorce } = getRelFlags({ relationshipStatus: status });

        return {
            relationshipStatus: status,
            marriage: showMarriage
                ? makeLifeEvent(values.dateOfMarriage, values.placeOfMarriage)
                : undefined,
            divorce: showDivorce
                ? makeLifeEvent(values.dateOfDivorce, values.placeOfDivorce)
                : undefined,
        };
    };

    const handleSubmit = (values: PersonFormValues) => {
        const basePerson: Partial<Person> = {
            givenName: values.firstName,
            familyName: values.lastName,
            maidenName: values.maidenName,
            gender: values.gender,
            portrait: values.portrait,
            lifeStatus: values.lifeState,
            birth: makeLifeEvent(values.dateOfBirth, values.placeOfBirth),
            death: values.lifeState === 'deceased'
                ? makeLifeEvent(values.dateOfDeath, values.placeOfDeath)
                : undefined,
        };

        const { showMarriage, showDivorce } = getRelFlags(values);

        const familyChanges: Partial<Family> = {
            relationshipStatus: values.relationshipStatus,
            marriage: showMarriage
                ? makeLifeEvent(values.dateOfMarriage, values.placeOfMarriage)
                : undefined,
            divorce: showDivorce
                ? makeLifeEvent(values.dateOfDivorce, values.placeOfDivorce)
                : undefined,
        };

        const ctxForDispatch: AddRelativeContext =
            isAddChild && values.parentFamilyId
                ? { ...addContext, familyId: values.parentFamilyId }
                : isAddSpouse && values.spouseAttachFamilyId
                    ? { ...addContext, familyId: values.spouseAttachFamilyId }
                    : addContext;

        if (isEdit) {
            const draftsToSave: Record<Id, SpouseDraft> = { ...spouseDrafts };

            if (values.spouseFamilyId) {
                draftsToSave[values.spouseFamilyId] = {
                    relationshipStatus: values.relationshipStatus,
                    marriage: showMarriage
                        ? makeLifeEvent(values.dateOfMarriage, values.placeOfMarriage)
                        : undefined,
                    divorce: showDivorce
                        ? makeLifeEvent(values.dateOfDivorce, values.placeOfDivorce)
                        : undefined,
                };
            }

            for (const [familyId, draft] of Object.entries(draftsToSave)) {
                const relationshipStatus = draft.relationshipStatus ?? 'unknown';
                const { showMarriage, showDivorce } = getRelFlags({ relationshipStatus });

                dispatch(
                    updateFamily({
                        id: familyId as Id,
                        changes: {
                            relationshipStatus,
                            marriage: showMarriage ? draft.marriage : undefined,
                            divorce: showDivorce ? draft.divorce : undefined,
                        },
                    }),
                );
            }

            dispatch(
                updatePerson({
                    id: person.id,
                    changes: basePerson,
                }),
            );
        } else if (isAddRelative) {
            dispatch(
                addPersonWithRelation({
                    person: basePerson,
                    ctx: ctxForDispatch,
                    ...(isAddSpouse ? { family: familyChanges } : {}),
                }),
            );
        } else {
            dispatch(
                addPerson({
                    ...basePerson,
                }),
            );
        }

        onClose();
    };

    const GENDER_OPTIONS: RadioOption[] = [
        { value: 'female', label: 'Female' },
        { value: 'male', label: 'Male' },
        { value: 'unknown', label: 'Unknown' },
    ] as const;

    const LIVING_OPTIONS: RadioOption[] = [
        { value: 'living', label: 'Living' },
        { value: 'deceased', label: 'Deceased' },
        { value: 'unknown', label: 'Unknown' },
    ] as const;

    const REL_OPTIONS: SelectOption[] = [
        { value: 'married', label: 'Marriage' },
        { value: 'divorced', label: 'Divorced' },
        { value: 'separated', label: 'Living separately' },
        { value: 'endedByDeath', label: 'Union ended by death' },
        { value: 'engaged', label: 'Engaged' },
        { value: 'dating', label: 'In a relationship' },
        { value: 'annulled', label: 'Annulled' },
        { value: 'other', label: 'Other' },
        { value: 'unknown', label: 'Unknown' },
    ] as const;

    const noSecondParentLabel =
        anchorPerson?.gender === 'female' ? 'No father'
            : anchorPerson?.gender === 'male' ? 'No mother'
                : 'No second parent';

    const noSecondParentPhoto =
        anchorPerson?.gender === 'female' ? getDefaultPortrait('male')
            : anchorPerson?.gender === 'male' ? getDefaultPortrait('female')
                : getDefaultPortrait('unknown');

    const PARENT_FAMILY_OPTIONS: SelectPersonOption[] = [
        ...parentFamilies.map(f => ({
            value: f.familyId,
            label: f.spouseLabel,
            photo: f.spousePortrait,
        })),
        { value: '', label: noSecondParentLabel, photo: noSecondParentPhoto },
    ];

    const SPOUSE_OPTIONS: SelectPersonOption[] =
        spouses.map(s => ({
            value: s.familyId,
            label: s.spouseLabel,
            photo: s.spousePortrait,
        }));

    const SPOUSE_ATTACH_FAMILY_OPTIONS: SelectPersonOption[] = [
        ...attachSpouseFamilies.map(f => {
            const n = f.children?.length ?? 0;
            const p = personsById[f.spouses[0]];

            return {
                value: f.id,
                label: n > 0 ? `Existing family (${n} children)` : 'Existing family (no children)',
                photo: p?.portrait || getDefaultPortrait(p?.gender),
            };
        }),

        { value: '', label: 'Create new family', photo: getDefaultPortrait('unknown') },
    ];

    const fields: ReadonlyArray<FormField<PersonFormValues>> = [
        { name: 'portrait', placeholder: 'Photo', type: 'file' },
        { name: 'gender', options: GENDER_OPTIONS, type: 'radio' },

        { name: 'firstName', placeholder: 'First name', type: 'text' },
        { name: 'lastName', placeholder: 'Last name', type: 'text' },
        { name: 'maidenName', placeholder: 'Maiden name', type: 'text', visible: (v) => v.gender === 'female' },

        { name: 'dateOfBirth', placeholder: 'Date of birth', type: 'event' },
        { name: 'placeOfBirth', placeholder: 'Place of birth', type: 'text' },

        { name: 'lifeState', options: LIVING_OPTIONS, type: 'radio' },
        {
            name: 'dateOfDeath', placeholder: 'Date of death', type: 'event',
            visible: (v) => v.lifeState === 'deceased',
        },
        {
            name: 'placeOfDeath', placeholder: 'Place of death', type: 'text',
            visible: (v) => v.lifeState === 'deceased',
        },

        {
            name: 'spouseAttachFamilyId',
            placeholder: 'Attach to family',
            selectors: SPOUSE_ATTACH_FAMILY_OPTIONS,
            type: 'personsel',
            visible: () => isAddSpouse && attachSpouseFamilies.length > 0,
        },

        {
            name: 'parentFamilyId',
            placeholder: 'Second parent',
            selectors: PARENT_FAMILY_OPTIONS,
            type: 'personsel',
            visible: () => isAddChild,
        },

        {
            name: 'spouseFamilyId', placeholder: 'Spouse', selectors: SPOUSE_OPTIONS, type: 'personsel',
            visible: () => (spouses?.length ?? 0) > 0,
            onValueChange: ({ value, values, setValue }) => {
                const newId = value as Id;
                const currentId = currenSpouseFamilyId;

                if (currentId) {
                    const errors = validateDateFields(values, SPOUSE_DATE_FIELDS);

                    if (Object.keys(errors).length > 0) {
                        setSpouseErrors(errors);
                        if (values.spouseFamilyId) {
                            setValue('spouseFamilyId', currentId);
                        }
                        return;
                    }

                    const snapshot = spouseDraftFromValues(values);
                    if (snapshot) {
                        setSpouseDrafts(prev => ({
                            ...prev,
                            [currentId]: snapshot,
                        }));
                    }
                }

                setSpouseErrors({});
                setCurrenSpouseFamilyId(newId);

                setValue('spouseFamilyId', newId);
                const draft = spouseDrafts[newId];
                if (draft) {
                    setValue('relationshipStatus', draft.relationshipStatus ?? 'unknown');
                    setValue('dateOfMarriage', draft.marriage?.date ?? undefined);
                    setValue('placeOfMarriage', draft.marriage?.place ?? '');
                    setValue('dateOfDivorce', draft.divorce?.date ?? undefined);
                    setValue('placeOfDivorce', draft.divorce?.place ?? '');
                }
            },
        },

        {
            name: 'relationshipStatus', placeholder: 'Relationship', selectors: REL_OPTIONS, type: 'select',
            visible: (v) => showSpouseSection && isCoupleFamilySelected(v),
            onValueChange: ({ value, values }) => {
                const familyId = values.spouseFamilyId as Id | undefined;
                if (!familyId) return;
                setSpouseDrafts(prev => ({
                    ...prev,
                    [familyId]: {
                        ...(prev[familyId] ?? {}),
                        relationshipStatus: value as RelationshipStatus,
                    },
                }));
            },
        },

        {
            name: 'placeOfMarriage', placeholder: 'Place of marriage', type: 'text',
            visible: isMarriageVisible,
            onValueChange: ({ value, values }) => {
                const familyId = values.spouseFamilyId as Id | undefined;
                if (!familyId) return;

                setSpouseDrafts(prev => ({
                    ...prev,
                    [familyId]: {
                        ...(prev[familyId] ?? {}),
                        marriage: {
                            ...(prev[familyId]?.marriage ?? {}),
                            place: value as LifeEvent['place'],
                        },
                    },
                }));
            },
        },
        {
            name: 'dateOfMarriage', placeholder: 'Date of marriage', type: 'event',
            visible: isMarriageVisible,
            onValueChange: ({ value, values }) => {
                const familyId = values.spouseFamilyId as Id | undefined;
                if (!familyId) return;

                setSpouseDrafts(prev => ({
                    ...prev,
                    [familyId]: {
                        ...(prev[familyId] ?? {}),
                        marriage: {
                            ...(prev[familyId]?.marriage ?? {}),
                            date: value as LifeEventDate,
                        },
                    },
                }));
            },
        },

        {
            name: 'placeOfDivorce', placeholder: 'Place of divorce', type: 'text',
            visible: isDivorceVisible,
            onValueChange: ({ value, values }) => {
                const familyId = values.spouseFamilyId as Id | undefined;
                if (!familyId) return;

                setSpouseDrafts(prev => ({
                    ...prev,
                    [familyId]: {
                        ...(prev[familyId] ?? {}),
                        divorce: {
                            ...(prev[familyId]?.divorce ?? {}),
                            place: value as LifeEvent['place'],
                        },
                    },
                }));
            },
        },
        {
            name: 'dateOfDivorce', placeholder: 'Date of divorce', type: 'event',
            visible: isDivorceVisible,
            onValueChange: ({ value, values }) => {
                const familyId = values.spouseFamilyId as Id | undefined;
                if (!familyId) return;

                setSpouseDrafts(prev => ({
                    ...prev,
                    [familyId]: {
                        ...(prev[familyId] ?? {}),
                        divorce: {
                            ...(prev[familyId]?.divorce ?? {}),
                            date: value as LifeEventDate,
                        },
                    },
                }));
            },
        },

    ];

    const baseButtons = [
        {
            label: 'Okay',
            style: 'red',
            type: 'button',
            actionType: 'submit',
        },
        {
            label: 'Cancel',
            style: 'black',
            type: 'button',
            actionType: 'button',
            onClick: () => onClose(),
        },
    ] satisfies ReadonlyArray<ButtonConfig>;

    const deleteButton = {
        label: 'Delete person',
        style: 'trans',
        type: 'button',
        actionType: 'button',
        onClick: handleDelete,
    } satisfies ButtonConfig;

    const buttons = isEdit ? [...baseButtons, deleteButton] : baseButtons;

    const formLayout = (v: PersonFormValues) => {
        const rows = [
            `"personPhoto ."`,
            `"gender ."`,
            `"firstName dateOfBirth"`,
            `"lastName dateOfBirth"`,
        ];

        if (v.gender === 'female') {
            rows.push(`"maidenName placeOfBirth"`);
            rows.push(`"living ."`);
        } else {
            rows.push(`"living placeOfBirth"`);
        }

        if (v.lifeState === 'deceased') {
            rows.push(`"dateOfDeath ."`);
            rows.push(`"dateOfDeath placeOfDeath"`);
        }

        if (isAddSpouse && attachSpouseFamilies.length > 0) rows.push(`"spouseAttachFamilyId ."`);
        if ((spouses?.length ?? 0) > 0) rows.push(`"spouseFamilyId ."`);
        if (isAddChild) rows.push(`"parentFamilyId ."`);

        if (showSpouseSection && isCoupleFamilySelected(v)) {
            const { showMarriage, showDivorce } = getRelFlags(v);

            rows.push(showMarriage ? `"relationshipStatus dateOfMarriage"` : `"relationshipStatus ."`);
            if (showMarriage) rows.push(`"placeOfMarriage dateOfMarriage"`);
            if (showDivorce) {
                rows.push(`"dateOfDivorce ."`);
                rows.push(`"dateOfDivorce placeOfDivorce"`);
            }
        }

        rows.push(`"buttons buttons"`);
        return rows.join('\n');
    };

    const formColumns = '1fr 1fr';
    const formRows = '160px';

    const PERSON_DATE_FIELDS = [
        'dateOfBirth',
        'dateOfDeath',
    ] as const satisfies (keyof PersonFormValues)[];

    const SPOUSE_DATE_FIELDS = [
        'dateOfMarriage',
        'dateOfDivorce',
    ] as const satisfies (keyof PersonFormValues)[];

    const validateDateFields = (
        values: PersonFormValues,
        fields: readonly (keyof PersonFormValues)[],
    ): ErrorsMap => {
        const errors: ErrorsMap = {};

        for (const field of fields) {
            const key = field as string;
            const error = validateLifeEventDate(
                values[field] as LifeEventDate | undefined);
            if (error) errors[key] = [error];
        }

        return errors;
    };

    const mergeErrors = (...maps: Array<ErrorsMap | undefined>) => {
        const res: ErrorsMap = {};
        for (const m of maps) {
            if (!m) continue;
            for (const k of Object.keys(m)) res[k] = m[k];
        }
        return res;
    };

    const validate = (values: PersonFormValues) =>
        mergeErrors(
            (values.spouseFamilyId || isAddSpouse) ? validateDateFields(values, SPOUSE_DATE_FIELDS) : {},
            validateDateFields(values, PERSON_DATE_FIELDS),
        );

    return (
        <Modal onClose={onClose} btnClose>
            <div className={styles.editModal}>
                <div className={styles.header}>
                    <Title level={'h2'} size={'small'}>
                        {isEdit ? 'Edit person' : 'Add person'}
                    </Title>

                    <Title level={'h3'} size={'extraSmall'}>
                        General Information
                    </Title>
                </div>

                <Form<PersonFormValues>
                    className={styles.form}
                    buttons={buttons}
                    fields={fields}
                    initialValues={initialValues}
                    formLayout={formLayout}
                    formColumns={formColumns}
                    formRows={formRows}
                    onSubmit={handleSubmit}
                    externalLocalErrors={spouseErrors}
                    validate={validate}
                />
            </div>
        </Modal>
    );
};

export default PersonModal;
