import { createContext } from 'svelte';

export interface FlowChartContext {
	arrowId: () => string;
}

export const [getFlowChartContext, setFlowChartContext] = createContext<FlowChartContext>();
