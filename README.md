# d3.forceSurface

[![NPM](https://nodei.co/npm/d3-force-surface.png?compact=true)](https://nodei.co/npm/d3-force-surface/)

A multi-surface elastic collision force type for the d3-force simulation engine.

It can be used, for example to [keep nodes inside a container](https://bl.ocks.org/vasturiano/2992bcb530bc2d64519c5b25201492fd) or in a [game of Pong](https://bl.ocks.org/vasturiano/94107e18d438942f92b217809eb3e7ba).

## Quick start

```
import d3ForceSurface from '3d-force-surface';
```
or
```
d3.forceSurface = require('3d-force-surface');
```
or even
```
<script src="//unpkg.com/3d-force-surface/dist/3d-force-surface.min.js"></script>
```
then
```
d3.forceSimulation()
    .nodes(<myNodes>)
    .force('surface', d3.forceSurface()
        .surfaces(<mySurfaces>)
    );
```

## API reference

| Method | Description | Default |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- | ------------- |
| <b>surfaces</b>([<i>array</i>]) | Getter/setter for the list of surface lines | [] |
| <b>elasticity</b>([<i>number</i>]) | Getter/setter for every collision's <i>coefficient of restitution</i>, aka <i>elasticity</i>. A value of `1` represents a purely elastic collision with no energy loss, while a `0` will fully eliminate the bounce in the collision direction. Values `>1` can be used to introduce acceleration at each collision. Values `<0` are not recommended. | 1 |
| <b>radius</b>([<i>num</i> or <i>fn</i>]) | Getter/setter for the node object radius accessor function (`fn(node)`) or a constant (`num`) for all nodes. | 1 |
| <b>from</b>([<i>fn</i>]) | Getter/setter for the surface object <b>starting point</b> accessor function `fn(surface)`. It should return a two coordinate object: `{x,y}` | `surface.from` |
| <b>to</b>([<i>fn</i>]) | Getter/setter for the surface object <b>ending point</b> accessor function `fn(surface)`. It should return a two coordinate object: `{x,y}` | `surface.to` |
| <b>oneWay</b>([<i>bool</i> or <i>fn</i>]) | Getter/setter for the surface object "one-way" flag accessor function (`fn(surface)`) or a constant for all surfaces. This flag indicates whether collisions of nodes against the surface should occur in both directions of movement or only in one (when the node is moving in a <i>N>S</i> orientation according to the <i>W>E</i> line axis), effectively ignoring collisions in the other direction. | false |
| <b>onImpact</b>([<i>fn</i>]) | Callback function triggered at every collision, with the signature `onImpact(node, surface)`  ||

## Local development

```
npm install
npm run watch
```
