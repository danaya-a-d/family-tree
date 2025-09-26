import type { AppDispatch } from '@/app/store';
import { mockPersons, mockFamilies, mockRootPersonId } from '@/mock/tree';
import {
    addPerson,
    addFamily,
    linkSpouses,
    linkChild,
    setRootPerson,
} from './treeSlice';

export function seedStore(dispatch: AppDispatch) {
    mockPersons.forEach((p) => dispatch(addPerson(p)));
    mockFamilies.forEach((f) => dispatch(addFamily(f)));

    // связи

    // f1: p3 + p4 → ребёнок p1
    dispatch(linkSpouses({ familyId: 'f1', spouseIds: ['p3', 'p4'] }));
    dispatch(linkChild({ familyId: 'f1', childId: 'p1' }));
    // dispatch(linkChild({ familyId: 'f1', childId: 'p9' }));

    // f2: p1 + p2 → дети p5, p6
    dispatch(linkSpouses({ familyId: 'f2', spouseIds: ['p1', 'p2'] }));
    dispatch(linkChild({ familyId: 'f2', childId: 'p5' }));
    dispatch(linkChild({ familyId: 'f2', childId: 'p6' }));
    dispatch(linkChild({ familyId: 'f2', childId: 'p7' }));
    dispatch(linkChild({ familyId: 'f2', childId: 'p8' }));
    //
    dispatch(linkSpouses({ familyId: 'f3', spouseIds: ['p8', 'p9'] }));
    dispatch(linkChild({ familyId: 'f3', childId: 'p10' }));

    // 4) Корневой узел
    dispatch(setRootPerson(mockRootPersonId));
}