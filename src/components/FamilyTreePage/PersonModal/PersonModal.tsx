import Modal from '../../common/Modal/Modal';
import Form from '../../common/Form/Form';
import { useDispatch } from 'react-redux';
import { addPerson, addPersonWithRelation, removePerson, updatePerson } from '@/features/tree/treeSlice';
import Title from '../../common/Title/Title';
import type { ButtonConfig, FormField } from '../../common/ui.types';
import { AddRelativeContext, Gender, LifeEvent, LifeState, Person, RelativeKind } from '@/features/tree/types';
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

    dateOfBirth: LifeEvent['date'];
    placeOfBirth: LifeEvent['place'];

    lifeState: LifeState;
    dateOfDeath: LifeEvent['date'];
    placeOfDeath: LifeEvent['place'];
};

const PersonModal = ({ person, addContext, onClose }: PersonModalProps) => {
    const dispatch = useDispatch();

    const isEdit = !!person;
    const isAddRelative = !!addContext;

    const handleDelete = () => {
        if (person) {
            dispatch(removePerson(person.id));
        }
        onClose();
    };

    function getLifeState(p?: Person): LifeState {
        if (!p) return 'unknown';
        if (p.death === null) return 'living';
        if (p.death) return 'deceased';
        return 'unknown';
    }

    const makeLifeEvent = (date?: string, place?: string): LifeEvent | undefined => {
        const d = date?.trim() || undefined;
        const p = place?.trim() || undefined;
        return d || p ? { date: d, place: p } : undefined;
    };

    const handleSubmit = (values: PersonFormValues) => {
        const basePerson: Partial<Person> = {
            givenName: values.firstName,
            familyName: values.lastName,
            maidenName: values.maidenName,
            gender: values.gender,
            portrait: values.portrait,
            birth: makeLifeEvent(values.dateOfBirth, values.placeOfBirth),
            death: makeLifeEvent(values.dateOfDeath, values.placeOfDeath),
        };

        if (isEdit) {
            dispatch(
                updatePerson({
                    id: person.id, changes: basePerson,
                }),
            );
        } else if (isAddRelative) {
            dispatch(
                addPersonWithRelation({
                    person: basePerson, ctx: addContext,
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

    const GENDER_OPTIONS = [
        { value: 'female', label: 'Female' },
        { value: 'male', label: 'Male' },
        { value: 'unknown', label: 'Unknown' },
    ] as const;

    const LIVING_OPTIONS = [
        { value: 'living', label: 'Living' },
        { value: 'deceased', label: 'Deceased' },
        { value: 'unknown', label: 'Unknown' },
    ] as const;

    const fields = [
        { name: 'portrait', placeholder: 'Photo', type: 'file' },
        { name: 'gender', options: GENDER_OPTIONS, type: 'radio' },

        { name: 'firstName', placeholder: 'First name', type: 'text' },
        { name: 'lastName', placeholder: 'Last name', type: 'text' },
        { name: 'maidenName', placeholder: 'Maiden name', type: 'text', visible: (v) => v.gender === 'female' },

        { name: 'dateOfBirth', placeholder: 'Date of Birth', type: 'date' },
        { name: 'placeOfBirth', placeholder: 'Place of Birth', type: 'text' },

        { name: 'lifeState', options: LIVING_OPTIONS, type: 'radio' },
        {
            name: 'dateOfDeath', placeholder: 'Date of Death', type: 'date',
            visible: (v) => v.lifeState === 'deceased',
        },
        {
            name: 'placeOfDeath', placeholder: 'Place of Death', type: 'text',
            visible: (v) => v.lifeState === 'deceased',
        },
    ] satisfies ReadonlyArray<FormField>;

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

    const formLayout = `"personPhoto ."
                        "gender ."
                        "firstName dateOfBirth"
                        "lastName placeOfBirth"
                        "maidenName ."
                        "living ."
                        "dateOfDeath placeOfDeath"
                        "buttons buttons"`;

    const formColumns = '1fr 1fr';
    const formRows = '160px';

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

            dateOfBirth: person.birth?.date ?? '',
            placeOfBirth: person.birth?.place ?? '',

            lifeState: getLifeState(person),
            dateOfDeath: person.death?.date ?? '',
            placeOfDeath: person.death?.place ?? '',
        }
        : {
            firstName: '',
            lastName: '',
            maidenName: '',
            gender: GENDER_BY_KIND[addContext.kind] ?? 'unknown',
            portrait: null,


            lifeState: 'unknown',
            dateOfBirth: '',
            placeOfBirth: '',

            dateOfDeath: '',
            placeOfDeath: '',
        };

    return (
        <Modal onClose={onClose} btnClose>
            <div className={styles.editModal}>
                <Title level={'h2'} size={'small'}>
                    {isEdit ? 'Edit person' : 'Add person'}
                </Title>
                <Form
                    className={styles.form}
                    buttons={buttons}
                    fields={fields}
                    initialValues={initialValues}
                    formLayout={formLayout}
                    formColumns={formColumns}
                    formRows={formRows}
                    onSubmit={handleSubmit}
                />
            </div>
        </Modal>
    );
};

export default PersonModal;
