import { Component, h, Method, Prop, Element, Watch, Event, EventEmitter, State } from "@stencil/core";
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

    private popover: HTMLElement;

    @Prop() options: any[];

    @Prop() optionValue: string;

    @Prop() optionText: string;

    @Prop() optionDetail: string;

    @Prop({ mutable: true }) value: any;

    @Prop() debounce: number = 300;

    @Prop({ mutable: true }) messages: IComboboxMessages;

    @Event() change: EventEmitter;

    @State() private searching = false;

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
            let popover = document.createElement('t-combobox-popover-list');
            this.popover = popover;

            popover.onselect = () => {
                this.closeList();
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

    private handleInputFocus = () => {
        this.openList();
    }

    private handleInputBlur = () => {
        this.searching = false;
        this.closeList();
    }

    private handleSearch = (e) => {
        this.searching = true;
        this.dataSource.state.searchText = e.target.value;
        this.openList();
    }

    render() {
        const value = this.searching
            ? this.dataSource.state.searchText
            : this.dataSource.getText();

        return (
            <ion-input
                value={value}
                debounce={this.debounce}
                onIonInput={this.handleSearch}
                onClick={this.handleInputFocus}
                onIonBlur={this.handleInputBlur} />
        )
    }
}