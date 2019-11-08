/*
import { IComboboxOption } from "../../interface";
import { debounce } from "../../utils/helpers";

export interface State {
    value?: string | string[];

    multiple?: boolean;

    options?: IComboboxOption[];

    normalizedOptions?: IComboboxOption[];

    visibleOptions?: NormalizedOption;

    inputText?: string;
}

export interface NormalizedOption {
    text: string;
    value: string;
    searchToken: string;
}

export class ComboboxStore {
    private state: State = {
        normalizedOptions: null,
        multiple: false,
        options: null,
        inputText: '',
        value: '',
        visibleOptions: null
    };

    constructor() {
        this.notifyUpdate = debounce(this.notifyUpdate.bind(this));
    }

    public setOptions(options: IComboboxOption[]) {
        if (this.state.options === options) 
            return;

        throw new Error("Method not implemented.");

        this.notifyUpdate();
    }

    public setMultiple(multiple: boolean) {
        if (this.state.multiple === multiple) 
            return;
        throw new Error("Method not implemented.");

        this.notifyUpdate();
    }

    public setValue(value: string|string[]) {
        if (this.state.value === value) 
            return;

        throw new Error("Method not implemented.");

        this.notifyUpdate();
    }

    public setSearchText(searchText: string) {
        throw new Error("Method not implemented.");

        this.notifyUpdate();
    }

    private notifyUpdate() {
        throw new Error("Method not implemented.");
    }

    public getState() {
        return this.state;
    }
}
*/