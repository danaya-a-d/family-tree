import { nanoid } from '@reduxjs/toolkit';
export const makePersonId = () => `p:${nanoid(12)}`;
export const makeFamilyId = () => `f:${nanoid(12)}`;