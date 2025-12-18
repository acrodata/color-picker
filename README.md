# Color Picker

[![npm](https://img.shields.io/npm/v/@acrodata/color-picker.svg)](https://www.npmjs.com/package/@acrodata/color-picker)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/acrodata/color-picker/blob/main/LICENSE)

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

| Name           | Type                      | Default     | Description                                       |
| -------------- | ------------------------- | ----------- | ------------------------------------------------- |
| [format]       | ColorFormat               | `undefined` | The output format of the color picker.            |
| [color]        | string                    | `#000`      | The initial color string.                         |
| [disableAlpha] | boolean                   | `false`     | Whether to hide the alpha channel.                |
| (formatChange) | EventEmitter<ColorFormat> | `-`         | Event emitted when the color format is changed.   |
| (colorChange)  | EventEmitter<string>      | `-`         | Event emitted when the color string is changed.   |
| (valueChange)  | EventEmitter<ColorEvent>  | `-`         | Event emitted when the color changes.             |
| (valueChanged) | EventEmitter<ColorEvent>  | `-`         | Event emitted when the color change is finalized. |
