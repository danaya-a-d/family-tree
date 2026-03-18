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

    // Родители Daniel
    dispatch(linkSpouses({ familyId: 'f1', spouseIds: ['p2', 'p3'] }));
    dispatch(linkChild({ familyId: 'f1', childId: 'p1' }));

    // Второй брак Grace
    dispatch(linkSpouses({ familyId: 'f2', spouseIds: ['p3', 'p23'] }));

    // Daniel + Oksana
    dispatch(linkSpouses({ familyId: 'f3', spouseIds: ['p1', 'p4'] }));
    dispatch(linkChild({ familyId: 'f3', childId: 'p6' }));
    dispatch(linkChild({ familyId: 'f3', childId: 'p7' }));

    // Daniel + Chloe
    dispatch(linkSpouses({ familyId: 'f4', spouseIds: ['p1', 'p5'] }));
    dispatch(linkChild({ familyId: 'f4', childId: 'p8' }));
    dispatch(linkChild({ familyId: 'f4', childId: 'p27' }));

    // Первый брак Taras
    dispatch(linkSpouses({ familyId: 'f5', spouseIds: ['p9', 'p26'] }));
    dispatch(linkChild({ familyId: 'f5', childId: 'p25' }));

    // Второй брак Taras
    dispatch(linkSpouses({ familyId: 'f6', spouseIds: ['p9', 'p10'] }));
    dispatch(linkChild({ familyId: 'f6', childId: 'p4' }));
    dispatch(linkChild({ familyId: 'f6', childId: 'p11' }));
    dispatch(linkChild({ familyId: 'f6', childId: 'p12' }));

    // Solomiya + Marko
    dispatch(linkSpouses({ familyId: 'f7', spouseIds: ['p11', 'p13'] }));
    dispatch(linkChild({ familyId: 'f7', childId: 'p15' }));

    // Solomiya + Ethan
    dispatch(linkSpouses({ familyId: 'f8', spouseIds: ['p11', 'p14'] }));
    dispatch(linkChild({ familyId: 'f8', childId: 'p16' }));

    // Bohdan single-parent
    dispatch(linkSpouses({ familyId: 'f9', spouseIds: ['p12'] }));
    dispatch(linkChild({ familyId: 'f9', childId: 'p17' }));

    // Родители Chloe
    dispatch(linkSpouses({ familyId: 'f10', spouseIds: ['p18', 'p19'] }));
    dispatch(linkChild({ familyId: 'f10', childId: 'p5' }));
    dispatch(linkChild({ familyId: 'f10', childId: 'p20' }));

    // Olivia + Jack
    dispatch(linkSpouses({ familyId: 'f11', spouseIds: ['p20', 'p21'] }));
    dispatch(linkChild({ familyId: 'f11', childId: 'p22' }));

    // Mila single-parent
    dispatch(linkSpouses({ familyId: 'f12', spouseIds: ['p6'] }));
    dispatch(linkChild({ familyId: 'f12', childId: 'p24' }));

    dispatch(setRootPerson(mockRootPersonId));
}