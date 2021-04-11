import { Component, h, Method, Prop, Element, Watch, Event, EventEmitter, State } from "@stencil/core";
import { debounce, stopPropagation } from "../../utils/helpers";
import { DataSource } from "./datasource";
import { DefaultComboboxMessages, IComboboxMessages } from "./interfaces";

@Component({
    tag: 't-combobox2',
    styleUrl: 't-combobox2.scss'
})
export class TCombobox2 {
    @Element() private host: HTMLElement;

    private dataSource: DataSource;

    private get isListOpened() {
        return !!this.popover;
    }

    private popover: HTMLTComboboxPopoverListElement;

    @Prop() options: any[];

    @Prop() optionValue: string;

    @Prop() optionText: string;

    @Prop() optionDetail: string;

    @Prop({ mutable: true }) value: any;

    @Prop() debounce: number = 300;

    @Prop({ mutable: true }) messages: IComboboxMessages;

    @Event() change: EventEmitter;

    @State() private searching = false;

    private hasFocus = false;

    componentWillLoad() {
        this.dataSource = new DataSource({
            onValueChanged: (value) => {
                if (this.isListOpened)
                    this.closeList();

                if (this.value !== value) {
                    this.value = value;
                    this.change.emit();
                }
            }
        });

        this.updateDataSource();

        this.search = debounce(this.search.bind(this), this.debounce);
    }

    @Watch('options')
    @Watch('value')
    updateDataSource() {
        console.log('updateDataSouce');
        this.dataSource.state.optionValue = this.optionValue;
        this.dataSource.state.optionText = this.optionText;
        this.dataSource.state.optionDetail = this.optionDetail;
        this.dataSource.state.value = this.value;
        this.dataSource.state.options = this.options;
    }

    @Watch('messages')
    messagesChanged() {
        if (!this.messages)
            this.messages = { ...DefaultComboboxMessages };
        else
            this.messages = { ...DefaultComboboxMessages, ...this.messages };
    }

    @Method()
    async openList() {
        if (this.isListOpened)
            return;

        try {
            if (!this.searching)
                this.dataSource.search('');

            let popover = document.createElement('t-combobox-popover-list');
            this.popover = popover;

            popover.onselect = () => {
                this.closeList();
                this.clearSearch();
            };

            popover.dataSource = this.dataSource;
            popover.messages = this.messages;

            let container = this.getContainer();

            this.syncPopover();

            container.appendChild(popover);

            await popover.componentOnReady();
        }
        catch (err) {
            this.closeList();

            throw err;
        }
    }

    private getContainer() {
        let content = this.host.closest('ion-content');
        if (content)
            return content;

        return document.querySelector('ion-app');
    }

    private getOffset(el: HTMLElement) {
        var _x = 0;
        var _y = 0;
        while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop) && el.tagName.toUpperCase() != 'ION-CONTENT') {
            _x += el.offsetLeft;
            _y += el.offsetTop;
            el = el.offsetParent as HTMLElement;
        }
        return { top: _y, left: _x };
    }

    private async syncPopover() {
        if (!this.popover)
            return;

        let target = this.host;

        let offset = this.getOffset(target);

        let top = offset.top + target.offsetHeight;
        let left = offset.left;
        let width = target.offsetWidth;

        let insideIonItem = target.closest('ion-item');

        if (insideIonItem)
            top += 4;

        let popover = this.popover;

        popover.style.top = `${top}px`;
        popover.style.left = `${left}px`;
        popover.style.width = `${width}px`;
    }

    @Method()
    closeList() {
        if (this.popover) {
            this.popover.remove();
            this.popover = null;
        }
    }

    private handleInputBlur = (e) => {
        this.hasFocus = false;

        this.closeList();

        const option = this.dataSource.getOptionByText(e.target.value);

        if (option)
            this.dataSource.state.value = option.value;
        else
            this.dataSource.state.value = '';

        this.clearSearch();

        e.target.value = this.dataSource.getText();
    }

    private handleInputType = (e) => {
        this.searching = true;
        this.search(e.target.value);
    }

    private handleInputClick = () => {
        this.openList();
    }

    private handleInputFocus = () => {
        this.hasFocus = true;
    }

    private clearSearch() {
        this.searching = false;
    }

    private search(term) {
        if (!this.hasFocus)
            return;

        this.searching = true;
        this.dataSource.search(term);
        this.openList();
    }

    render() {
        const value = this.dataSource.getText();

        return (
            <ion-input
                type="search"
                autocomplete="off"
                autocorrect="off"
                value={value}
                debounce={this.debounce}
                onChange={stopPropagation}
                onInput={stopPropagation}
                onIonInput={this.handleInputType}
                onClick={this.handleInputClick}
                onIonFocus={this.handleInputFocus}
                onIonBlur={this.handleInputBlur} />
        )
    }
}