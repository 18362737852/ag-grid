import {
    IClientSideRowModel,
    ColDef,
    Column,
    Constants,
    IRowModel,
    ISetFilterParams,
    Promise,
    SetFilterValues,
    SetFilterValuesFunc,
    SetFilterValuesFuncParams,
    TextFilter,
    TextFormatter,
    ValueFormatterService,
    IEventEmitter,
    _,
    EventService,
    RowNode
} from '@ag-grid-community/core';

export enum SetFilterModelValuesType {
    PROVIDED_LIST, PROVIDED_CALLBACK, TAKEN_FROM_GRID_VALUES
}

export class SetValueModel implements IEventEmitter {
    public static EVENT_AVAILABLE_VALUES_CHANGED = 'availableValuesChanged';

    private readonly localEventService = new EventService();
    private readonly filterParams: ISetFilterParams;
    private readonly clientSideRowModel: IClientSideRowModel;
    private readonly formatter: TextFormatter;

    private valuesType: SetFilterModelValuesType;
    private miniFilterText: string = null;

    // The lookup for a set is much faster than the lookup for an array, especially when the length of the array is
    // thousands of records long, so where lookups are important we use a set.

    /** Values provided to the filter for use. */
    private providedValues: SetFilterValues = null;

    /** Values can be loaded asynchronously, so wait on this promise if you need to ensure values have been loaded. */
    private allValuesPromise: Promise<string[]>;

    /** All possible values for the filter, sorted if required. */
    private allValues: string[] = [];

    /** Remaining values when filters from other columns have been applied. */
    private availableValues = new Set<string>();

    /** All values that are currently displayed, after the mini-filter has been applied. */
    private displayedValues: string[] = [];

    /** Values that have been selected for this filter. */
    private selectedValues = new Set<string>();

    constructor(
        private readonly colDef: ColDef,
        rowModel: IRowModel,
        private readonly valueGetter: (node: RowNode) => any,
        private readonly doesRowPassOtherFilters: (node: RowNode) => boolean,
        private readonly suppressSorting: boolean,
        private readonly setIsLoading: (loading: boolean) => void,
        private readonly valueFormatterService: ValueFormatterService,
        private readonly column: Column
    ) {
        if (rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            this.clientSideRowModel = rowModel as IClientSideRowModel;
        }

        this.filterParams = this.colDef.filterParams || {};
        this.formatter = this.filterParams.textFormatter || TextFilter.DEFAULT_FORMATTER;

        const { values } = this.filterParams;

        if (values == null) {
            this.valuesType = SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES;
        } else {
            this.valuesType = Array.isArray(values) ?
                SetFilterModelValuesType.PROVIDED_LIST :
                SetFilterModelValuesType.PROVIDED_CALLBACK;

            this.providedValues = values;
        }

        this.updateAllValues();

        // start with everything selected
        this.allValuesPromise.then(values => this.selectedValues = _.convertToSet(values));
    }

    public addEventListener(eventType: string, listener: Function, async?: boolean): void {
        this.localEventService.addEventListener(eventType, listener, async);
    }

    public removeEventListener(eventType: string, listener: Function, async?: boolean): void {
        this.localEventService.removeEventListener(eventType, listener, async);
    }

    /**
     * Re-fetches the values used in the filter from the value source.
     * If keepSelection is false or selectAll is true, the filter selection will be reset to everything selected,
     * otherwise the current selection will be preserved.
     */
    public refetchValues(keepSelection = true): void {
        const currentModel = this.getModel();

        this.updateAllValues();

        // ensure model is updated for new values
        this.allValuesPromise.then(() => this.setModel(keepSelection ? currentModel : null));
    }

    /**
     * Overrides the current values being used for the set filter.
     * If keepSelection is false, the filter selection will be reset to everything selected,
     * otherwise the current selection will be preserved.
     */
    public overrideValues(valuesToUse: string[], keepSelection = true): void {
        // wait for any existing values to be populated before overriding
        this.allValuesPromise.then(() => {
            this.valuesType = SetFilterModelValuesType.PROVIDED_LIST;
            this.providedValues = valuesToUse;
            this.refetchValues(keepSelection);
        });
    }

    public refreshAfterAnyFilterChanged(): void {
        if (this.showAvailableOnly()) {
            this.updateAvailableValues();
        }
    }

    private updateAllValues(): void {
        switch (this.valuesType) {
            case SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES:
            case SetFilterModelValuesType.PROVIDED_LIST: {
                const values = this.valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES ?
                    this.getValuesFromRows(false) : _.toStrings(this.providedValues as any[]);

                const sortedValues = this.sortValues(values);

                this.allValues = sortedValues;
                this.allValuesPromise = Promise.resolve(sortedValues);

                break;
            }

            case SetFilterModelValuesType.PROVIDED_CALLBACK: {
                this.setIsLoading(true);

                this.allValuesPromise = new Promise<string[]>(resolve => {
                    const callback = this.providedValues as SetFilterValuesFunc;
                    const params: SetFilterValuesFuncParams = {
                        success: values => {
                            const processedValues = _.toStrings(values);

                            this.setIsLoading(false);
                            this.valuesType = SetFilterModelValuesType.PROVIDED_LIST;
                            this.providedValues = processedValues;

                            const sortedValues = this.sortValues(processedValues);

                            this.allValues = sortedValues;

                            resolve(sortedValues);
                        },
                        colDef: this.colDef
                    };

                    window.setTimeout(() => callback(params), 0);
                });

                break;
            }

            default:
                throw new Error('Unrecognised valuesType');
        }

        this.updateAvailableValues();
    }

    public setValuesType(value: SetFilterModelValuesType) {
        this.valuesType = value;
    }

    public getValuesType(): SetFilterModelValuesType {
        return this.valuesType;
    }

    public isValueAvailable(value: string): boolean {
        return this.availableValues.has(value);
    }

    private showAvailableOnly(): boolean {
        return this.valuesType === SetFilterModelValuesType.TAKEN_FROM_GRID_VALUES &&
            !this.filterParams.suppressRemoveEntries;
    }

    private updateAvailableValues(): void {
        this.allValuesPromise.then(values => {
            const availableValues = this.showAvailableOnly() ? this.sortValues(this.getValuesFromRows(true)) : values;

            this.availableValues = _.convertToSet(availableValues);
            this.localEventService.dispatchEvent({ type: SetValueModel.EVENT_AVAILABLE_VALUES_CHANGED });
            this.updateDisplayedValues();
        });
    }

    private sortValues(values: string[]): string[] {
        if (this.suppressSorting) { return values; }

        const comparator = this.filterParams.comparator ||
            this.colDef.comparator as (a: any, b: any) => number ||
            _.defaultComparator;

        return values.sort(comparator);
    }

    private getValuesFromRows(removeUnavailableValues = false): string[] {
        if (!this.clientSideRowModel) {
            console.error('ag-Grid: Set Filter cannot initialise because you are using a row model that does not contain all rows in the browser. Either use a different filter type, or configure Set Filter such that you provide it with values');
            return [];
        }

        const values = new Set<string>();
        const { keyCreator } = this.colDef;

        this.clientSideRowModel.forEachLeafNode(node => {
            // only pull values from rows that have data. this means we skip filler group nodes.
            if (!node.data || (removeUnavailableValues && !this.doesRowPassOtherFilters(node))) {
                return;
            }

            let value = this.valueGetter(node);

            if (keyCreator) {
                value = keyCreator({ value });
            }

            value = _.makeNull(value);

            if (value != null && Array.isArray(value)) {
                _.forEach(value, x => {
                    const formatted = _.toStringOrNull(_.makeNull(x));
                    values.add(formatted);
                });
            } else {
                values.add(_.toStringOrNull(value));
            }
        });

        return _.values(values);
    }

    /** Sets mini filter value. Returns true if it changed from last value, otherwise false. */
    public setMiniFilter(value?: string): boolean {
        value = _.makeNull(value);

        if (this.miniFilterText === value) {
            //do nothing if filter has not changed
            return false;
        }

        this.miniFilterText = value;
        this.updateDisplayedValues();

        return true;
    }

    public getMiniFilter(): string {
        return this.miniFilterText;
    }

    private updateDisplayedValues(): void {
        // if no filter, just display all available values
        if (this.miniFilterText == null) {
            this.displayedValues = _.values(this.availableValues);
            return;
        }

        // if filter present, we filter down the list
        this.displayedValues = [];

        // to allow for case insensitive searches, upper-case both filter text and value
        const formattedFilterText = this.formatter(this.miniFilterText).toUpperCase();

        const matchesFilter = (valueToCheck: string): boolean =>
            valueToCheck != null && valueToCheck.toUpperCase().indexOf(formattedFilterText) >= 0;

        this.availableValues.forEach(value => {
            if (value == null) { return; }

            const displayedValue = this.formatter(value);
            const formattedValue = this.valueFormatterService.formatValue(this.column, null, null, displayedValue);

            if (matchesFilter(displayedValue) || matchesFilter(formattedValue)) {
                this.displayedValues.push(value);
            }
        });
    }

    public getDisplayedValueCount(): number {
        return this.displayedValues.length;
    }

    public getDisplayedValue(index: any): string {
        return this.displayedValues[index];
    }

    public isFilterActive(): boolean {
        return this.allValues.length !== this.selectedValues.size;
    }

    public getUniqueValueCount(): number {
        return this.allValues.length;
    }

    public getUniqueValue(index: any): string | null {
        return this.allValues[index];
    }

    public selectAll(clearExistingSelection = false): void {
        if (this.miniFilterText == null) {
            // ensure everything is selected
            this.selectedValues = _.convertToSet(this.allValues);
        } else {
            // ensure everything that matches the mini filter is selected
            if (clearExistingSelection) { this.selectedValues.clear(); }

            _.forEach(this.displayedValues, value => this.selectValue(value));
        }
    }

    public selectNothing(): void {
        if (this.miniFilterText == null) {
            // ensure everything is deselected
            this.selectedValues.clear();
        } else {
            // ensure everything that matches the mini filter is deselected
            _.forEach(this.displayedValues, it => this.deselectValue(it));
        }
    }

    public selectValue(value: string): void {
        this.selectedValues.add(value);
    }

    public deselectValue(value: string): void {
        this.selectedValues.delete(value);
    }

    public isValueSelected(value: string): boolean {
        return this.selectedValues.has(value);
    }

    public isEverythingSelected(): boolean {
        if (this.miniFilterText == null) {
            return this.allValues.length === this.selectedValues.size;
        } else {
            return _.filter(this.displayedValues, it => this.isValueSelected(it)).length === this.displayedValues.length;
        }
    }

    public isNothingSelected(): boolean {
        if (this.miniFilterText == null) {
            return this.selectedValues.size === 0;
        } else {
            return _.filter(this.displayedValues, it => this.isValueSelected(it)).length === 0;
        }
    }

    public getModel(): string[] | null {
        return this.isFilterActive() ? _.values(this.selectedValues) : null;
    }

    public setModel(model: string[]): void {
        this.allValuesPromise.then(values => {
            if (model == null) {
                // reset to everything selected
                this.selectedValues = _.convertToSet(values);
            } else {
                // select all values from the model that exist in the filter
                this.selectedValues.clear();

                const allValues = _.convertToSet(values);

                _.forEach(model, value => {
                    if (allValues.has(value)) {
                        this.selectValue(value);
                    }
                });
            }
        });
    }

    public onFilterValuesReady(callback: (values: string[]) => void): void {
        this.allValuesPromise.then(callback);
    }
}
