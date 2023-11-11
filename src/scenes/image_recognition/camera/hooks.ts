import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

export const useIsAppForeground = (): boolean => {
    const [isForeground, setIsForeground] = useState(true);
    const isFocused = useIsFocused();

    useEffect(() => {
        const onChange = (state: AppStateStatus): void => {
            setIsForeground(state === 'active');
        };
        const listener = AppState.addEventListener('change', onChange);
        return () => listener.remove();
    }, [setIsForeground]);

    return isForeground && isFocused;
};

