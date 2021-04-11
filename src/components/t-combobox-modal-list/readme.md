# t-combobox-modal-list



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute  | Description | Type                 | Default     |
| ---------- | ---------- | ----------- | -------------------- | ----------- |
| `debounce` | `debounce` |             | `number`             | `undefined` |
| `messages` | --         |             | `IComboboxMessages`  | `undefined` |
| `multiple` | `multiple` |             | `boolean`            | `false`     |
| `options`  | --         |             | `NormalizedOption[]` | `[]`        |
| `value`    | `value`    |             | `string \| string[]` | `undefined` |


## Events

| Event    | Description | Type               |
| -------- | ----------- | ------------------ |
| `select` |             | `CustomEvent<any>` |


## Methods

### `close() => Promise<any>`



#### Returns

Type: `Promise<any>`




## Dependencies

### Used by

 - [t-combobox-modal](../t-combobox-modal)

### Depends on

- ion-item
- ion-label
- ion-virtual-scroll
- ion-radio-group
- ion-header
- ion-toolbar
- ion-buttons
- ion-button
- ion-icon
- ion-searchbar
- ion-content
- ion-list

### Graph
```mermaid
graph TD;
  t-combobox-modal-list --> ion-item
  t-combobox-modal-list --> ion-label
  t-combobox-modal-list --> ion-virtual-scroll
  t-combobox-modal-list --> ion-radio-group
  t-combobox-modal-list --> ion-header
  t-combobox-modal-list --> ion-toolbar
  t-combobox-modal-list --> ion-buttons
  t-combobox-modal-list --> ion-button
  t-combobox-modal-list --> ion-icon
  t-combobox-modal-list --> ion-searchbar
  t-combobox-modal-list --> ion-content
  t-combobox-modal-list --> ion-list
  ion-item --> ion-icon
  ion-item --> ion-ripple-effect
  ion-button --> ion-ripple-effect
  ion-searchbar --> ion-icon
  t-combobox-modal --> t-combobox-modal-list
  style t-combobox-modal-list fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
