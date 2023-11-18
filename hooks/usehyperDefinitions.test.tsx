import {act} from "react-dom/test-utils";
import {render} from "@testing-library/react";
import {useHyperDefinitions} from "./useHyperDefinitions";
import React from "react";

describe('useHyperDefinitions Hook', () => {
    const mockDefinitions = {
    };

    it('returns HyperDTO or null/undefined and refresh callback', async () => {
        let result: [any, () => void] | undefined;

        await act(async () => {
            render(<TestComponent definitions={mockDefinitions} setHookResult={(hookResult) => (result = hookResult)} />);
        });

        const [hookResult, refreshCallback] = result!;

        expect(hookResult).toBeInstanceOf(Object);
        expect(refreshCallback).toBeInstanceOf(Function);
    });
    interface TestComponentProps {
        definitions: any;
        setHookResult: (result: [any, () => void] | undefined) => void;
    }

    const TestComponent: React.FC<TestComponentProps> = ({ definitions, setHookResult }) => {
        const hookResult = useHyperDefinitions(definitions);

        React.useEffect(() => {
            setHookResult(hookResult);
        }, [hookResult, setHookResult]);

        return null;
    };

});