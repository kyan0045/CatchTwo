# display-image

> Show pictures in terminal

![Preview](https://i.imgur.com/WyDM6E1.png)
<sub>Example image: https://pixabay.com/de/natur-blume-flora-sommer-blatt-3373196/</sub>

## :package: Install

```command
npm i display-image
```

## :clipboard: Usage

### From URL

```javascript
const displayImage = require("display-image")

displayImage.fromURL("https://exmaple.com/image.jpg").then(image => {
  console.log(image)
})
```

### From file

```javascript
const displayImage = require("display-image")

displayImage.fromFile("path/to/image.jpg").then(image => {
  console.log(image)
})
```