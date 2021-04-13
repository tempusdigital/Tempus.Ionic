# t-combobox-modal



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute     | Description | Type                | Default                                 |
| ------------- | ------------- | ----------- | ------------------- | --------------------------------------- |
| `autofocus`   | `autofocus`   |             | `boolean`           | `undefined`                             |
| `debounce`    | `debounce`    |             | `number`            | `ComboboxDefaultOptions.searchDebounce` |
| `disabled`    | `disabled`    |             | `boolean`           | `undefined`                             |
| `messages`    | --            |             | `IComboboxMessages` | `undefined`                             |
| `multiple`    | `multiple`    |             | `boolean`           | `undefined`                             |
| `name`        | `name`        |             | `string`            | `undefined`                             |
| `options`     | --            |             | `IComboboxOption[]` | `undefined`                             |
| `placeholder` | `placeholder` |             | `string`            | `undefined`                             |
| `readonly`    | `readonly`    |             | `boolean`           | `undefined`                             |
| `required`    | `required`    |             | `boolean`           | `undefined`                             |
| `value`       | `value`       |             | `any`               | `undefined`                             |


## Events

| Event      | Description | Type               |
| ---------- | ----------- | ------------------ |
| `change`   |             | `CustomEvent<any>` |
| `ionStyle` |             | `CustomEvent<any>` |


## Dependencies

### Used by

 - [t-combobox](../t-combobox)

### Depends on

- ion-input
- ion-button
- ion-icon
- [t-combobox-modal-list](../t-combobox-modal-list)
- ion-searchbar
- ion-buttons
- ion-toolbar
- ion-header
- ion-content
- ion-list
- ion-virtual-scroll
- ion-item
- ion-label
- ion-radio
- ion-checkbox
- ion-radio-group

### Graph
```mermaid
graph TD;
  t-combobox-modal --> ion-input
  t-combobox-modal --> ion-button
  t-combobox-modal --> ion-icon
  t-combobox-modal --> t-combobox-modal-list
  t-combobox-modal --> ion-searchbar
  t-combobox-modal --> ion-buttons
  t-combobox-modal --> ion-toolbar
  t-combobox-modal --> ion-header
  t-combobox-modal --> ion-content
  t-combobox-modal --> ion-list
  t-combobox-modal --> ion-virtual-scroll
  t-combobox-modal --> ion-item
  t-combobox-modal --> ion-label
  t-combobox-modal --> ion-radio
  t-combobox-modal --> ion-checkbox
  t-combobox-modal --> ion-radio-group
  ion-button --> ion-ripple-effect
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
  ion-searchbar --> ion-icon
  t-combobox --> t-combobox-modal
  style t-combobox-modal fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
