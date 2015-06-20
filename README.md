Ruler of Google Maps
=================

`google-maps-ruler` is a small JavaScript library to allow users to measure distance between points on Google Maps.

# Install

## Bower

Use `bower install google-maps-ruler` to install this package.

## Download

Download from GitHub and include `dist/google-maps-ruler.js` or `dist/google-maps-ruler.min.js` in your app.

# How to use

`google-maps-ruler` uses [UMD](https://github.com/umdjs/umd), so it works in CommonJS, AMD and browser environments. For example, if the JavaScript file is included using `<script>` directly, it exposes a global object `gmruler`.

`gmruler` requires a `google.maps.Map` object to work with. After `google.maps.Map` is created, use `gmruler.init` to initialize.

```coffeescript
gmruler.init(map, {
  distanceUnit: 'mile'
})
```

## User interactions

After `google-maps-ruler` is initialized on the map, following user interactions are supported:

* Right click to add a new point.
* Double-click on a point to remove it.
* Drag the point label to change its position.

## Configurations

The second argument of `gmruler.init` function is an simple object for configuration. Configurations supported are:

* `strokeColor` - Color of the polyline connecting points, e.g. `#ff0000`.
* `strokeWeight` - Weight of the polyline connecting points, e.g. `2`.
* `distanceUnit` - Unit for distance, can be `mile` or `km`. `km` is the default value.

## Samples

Refer to `sample` folder for some examples.

# Customisations

## Style

Update CSS style `gmruler-label`.
