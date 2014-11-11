$GM = google.maps
$GME = $GM.event

gmruler =
  init: (@map, opts = {}) ->
    @points = []
    @createLine()
    $GME.addListener(map, 'click', (event) =>
      @addPoint(event.latLng)
    )
  createLine: () ->
    return if @line
    @line = new $GM.Polyline(
      path: []
      strokeColor: '#ff0000'
      strokeWeight: 2
    )
    @line.setMap(@map)
  addPoint: (latLng) ->
    @line.getPath().push(latLng)
    point = new LabelOverlay(@map, latLng, '')
    @points.push(point)
  calculateDistance: (point1, point2) ->
    $GM.geometry.spherical.computeDistanceBetween(point1, point2)

class LabelOverlay extends $GM.OverlayView
  constructor: (@map, @coords, @seq) ->
    @div = null
    @setMap(@map)
  onAdd: () ->
    @div = document.createElement('div')
    @div.className = 'gmruler-label'
    @div.innerHTML = @seq
    panes = @getPanes()
    panes.overlayLayer.appendChild(@div)
  draw: () ->
    loc = @getProjection().fromLatLngToDivPixel(@coords)
    @div.style.left = loc.x + 'px'
    @div.style.top = loc.y + 'px'
  onRemove: () ->
    @div.parentNode.removeChild(@div)
    @div = null
