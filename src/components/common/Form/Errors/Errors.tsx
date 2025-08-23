import { useEffect, useRef, useState } from 'react';
import type { ErrorsMap } from '../../ui.types';
import Toasts from '../../Toast/Toasts';

interface ErrorsProps {
    submitCount: number;
    globalErrors?: ErrorsMap;
    localErrors?: ErrorsMap;
}

const Errors = ({ submitCount, globalErrors = {} as ErrorsMap, localErrors = {} as ErrorsMap }: ErrorsProps) => {
    const prevSubmit = useRef<number>(submitCount);
    const [mode, setMode] = useState<'global' | 'local'>('local');

    useEffect(() => {
        if (submitCount !== prevSubmit.current) {
            prevSubmit.current = submitCount;
            setMode('global');
        }
    }, [submitCount]);

    useEffect(() => {
        setMode('local');
    }, [localErrors]);

    const errorsForToast: ErrorsMap = mode === 'global' ? globalErrors : localErrors;

    return <Toasts errors={errorsForToast} />;
};

export default Errors;
