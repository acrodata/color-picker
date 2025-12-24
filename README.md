# Color Picker

[![npm](https://img.shields.io/npm/v/@acrodata/color-picker.svg)](https://www.npmjs.com/package/@acrodata/color-picker)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/acrodata/color-picker/blob/main/LICENSE)

<div align="center">
  <img src="https://repository-images.githubusercontent.com/1089636548/80fd40ee-eba2-4cea-aac8-c2344010a789" width="640" alt="color-picker" />
</div>

Another beautiful color picker

#### Quick links

[Documentation](https://github.com/acrodata/color-picker?tab=readme-ov-file#color-picker) |
[Playground](https://acrodata.github.io/color-picker/)

## Installation

```bash
npm install @acrodata/color-picker --save
```

## Usage

```ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ColorPicker } from '@acrodata/color-picker';

@Component({
  selector: 'your-app',
  template: `
    <color-picker [(ngModel)]="color" />
    <color-picker [(color)]="color" />
  `,
  imports: [FormsModule, ColorPicker],
})
export class YourAppComponent {
  color = '#ff0000';
}
```

## API

| Name           | Type                        | Default     | Description                                     |
| -------------- | --------------------------- | ----------- | ----------------------------------------------- |
| [color]        | string                      | `#000`      | The initial color string.                       |
| [format]       | ColorFormat                 | `undefined` | The output format of the color picker.          |
| [hideAlpha] | boolean                     | `false`     | Whether to hide the alpha channel.              |
| (colorChange)  | EventEmitter\<string\>      | `-`         | Event emitted when the color string changes.    |
| (valueChange)  | EventEmitter\<ColorEvent\>  | `-`         | Event emitted when the color value changes.     |
| (formatChange) | EventEmitter\<ColorFormat\> | `-`         | Event emitted when the color format is changed. |

## CSS Variables

```css
--cp-container-width
--cp-container-shape
--cp-container-padding
--cp-container-margin
--cp-container-elevation-shadow
--cp-container-background-color
--cp-container-text-color

--cp-input-shape
--cp-input-background-color
--cp-input-outline-color
--cp-input-hover-outline-color
--cp-input-focus-outline-color
--cp-input-text-font

--cp-icon-button-shape
--cp-icon-button-text-color
--cp-icon-button-background-color
--cp-icon-button-hover-background-color
--cp-icon-button-active-background-color
--cp-icon-button-focus-background-color
--cp-icon-button-focus-outline-color

--cp-saturation-picker-shape
--cp-saturation-picker-thumb-size
--cp-saturation-picker-thumb-shape
--cp-saturation-picker-thumb-shadow
--cp-saturation-picker-thumb-outline-color
--cp-saturation-picker-thumb-focus-outline-color

--cp-slider-width
--cp-slider-height
--cp-slider-shape
--cp-slider-thumb-width
--cp-slider-thumb-height
--cp-slider-thumb-shape
--cp-slider-thumb-background-color
--cp-slider-thumb-shadow
--cp-slider-thumb-outline-color
--cp-slider-thumb-focus-outline-color
```

## License

MIT
