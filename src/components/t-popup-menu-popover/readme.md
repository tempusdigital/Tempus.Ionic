# t-popup-menu-popover



<!-- Auto Generated Below -->


## Properties

| Property  | Attribute | Description | Type                | Default     |
| --------- | --------- | ----------- | ------------------- | ----------- |
| `buttons` | --        |             | `PopupMenuButton[]` | `undefined` |
| `header`  | `header`  |             | `string`            | `undefined` |


## Methods

### `dismiss() => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Depends on

- ion-list
- ion-list-header
- ion-item
- ion-icon

### Graph
```mermaid
graph TD;
  t-popup-menu-popover --> ion-list
  t-popup-menu-popover --> ion-list-header
  t-popup-menu-popover --> ion-item
  t-popup-menu-popover --> ion-icon
  ion-item --> ion-icon
  ion-item --> ion-ripple-effect
  style t-popup-menu-popover fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
