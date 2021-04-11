import { createStore } from "@stencil/store";
import { asArray, generateSearchToken, isEmptyValue, normalizeOptions, normalizeValue } from "../../utils/helpers";

interface State {
    options?: any[],
    normalizedOptions?: any[];
    visibleOptions?: any[],
    value?: string | string[];
    optionValue?: string;
    optionText?: string;
    optionDetail?: string;
    searchText?: string;
}

interface DataSourceOptions {
    onValueChanged?: (value: any) => any
}

export class DataSource {
    state: State;

    constructor(private options: DataSourceOptions) {
        const { state, onChange } = createStore<State>({});

        this.state = state;

        onChange('options', () => {
            const normalizedOptions = normalizeOptions(
                this.state.options,
                this.state.optionValue,
                this.state.optionText,
                this.state.optionDetail);
            this.state.normalizedOptions = normalizedOptions || [];
            this.updateVisibleOptions();
        });

        onChange('searchText', () => {
            this.updateVisibleOptions();
        });

        onChange('value', (value) => {
            const normalized = normalizeValue(value);

            if (normalized !== value) {
                this.state.value = normalized;
                return;
            }

            this.options?.onValueChanged(value);
        });
    }

    private updateVisibleOptions() {
        let { normalizedOptions, searchText } = this.state;

        if (normalizedOptions && searchText) {
            const searchToken = generateSearchToken(searchText);

            const visibleOptions = normalizedOptions.filter(p =>
                p.textSearchToken.indexOf(searchToken) >= 0 || p.detailTextSearchToken.indexOf(searchToken) >= 0);

            const selectedValues = asArray(this.state.value);

            this.state.visibleOptions = visibleOptions.filter(p => !selectedValues.includes(p.value));
        }
        else
            this.state.visibleOptions = normalizedOptions;
    }

    select(value: any) {
        value = normalizeValue(value);
        this.state.value = value;
    }

    getText() {
        if (isEmptyValue(this.state.value))
            return '';

        const option = this.state.normalizedOptions?.find(o => o.value === this.state.value);
        return option?.text || '';
    }
}