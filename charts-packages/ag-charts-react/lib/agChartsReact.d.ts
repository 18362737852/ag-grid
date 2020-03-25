// ag-charts-react v1.0.1
import { Component, RefObject } from "react";
export interface AgChartProps {
    options: any;
}
interface AgChartState {
}
export declare class AgChartsReact extends Component<AgChartProps, AgChartState> {
    props: any;
    state: any;
    static propTypes: any;
    private chart;
    protected chartRef: RefObject<HTMLElement>;
    constructor(props: any, state: any);
    render(): import("react").ReactElement<any, string | ((props: any) => import("react").ReactElement<any, string | any | (new (props: any) => Component<any, any, any>)>) | (new (props: any) => Component<any, any, any>)>;
    createStyleForDiv(): any;
    componentDidMount(): void;
    private applyContainerIfNotSet;
    shouldComponentUpdate(nextProps: any): boolean;
    processPropsChanges(prevProps: any, nextProps: any): void;
    componentWillUnmount(): void;
}
export {};
