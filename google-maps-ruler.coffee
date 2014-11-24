$GM = google.maps
$GME = $GM.event

gmruler =
  init: (@map, opts = {}) ->
    @points = []
    @createLine()
    $GME.addListener(@map, 'rightclick', (event) =>
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
    num = @points.length
    @line.getPath().push(latLng)
    point = new LabelOverlay(@map, latLng, num, this)
    @points.push(point)
    @updateDistance(num)

  calculateDistance: (point1, point2) ->
    $GM.geometry.spherical.computeDistanceBetween(point1, point2)

  labelPositionUpdated: (index, position) ->
    @line.getPath().setAt(index, position)
    @updateDistance(index)

  labelRemoved: (index) ->
    return if index == 0
    @line.getPath().removeAt(index)
    @points.splice(index, 1)
    @updateIndex(index)
    @updateDistance(index)

  updateDistance: (startIndex) ->
    startIndex = 1 if startIndex < 1
    for index in [startIndex...@points.length]
      @points[index].distance = @points[index - 1].distance + @calculateDistance(@positionAt(index - 1), @positionAt(index))
      @points[index].updateDistance()

  updateIndex: (startIndex) ->
    startIndex = 1 if startIndex < 1
    for index in [startIndex...@points.length]
      @points[index].index = @points[index].index - 1

  positionAt: (index) ->
    @line.getPath().getAt(index)

class LabelOverlay extends $GM.OverlayView
  constructor: (@map, @position, @index, @observer) ->
    @container = document.createElement('div')
    @container.className = 'gmruler-label'
    @distance = if @index == 0 then 0 else -1
    @setMap(@map)

  onAdd: () ->
    @updateDistance()
    @container.draggable = true

    @eventListeners = [
      $GME.addDomListener(@container, 'mousedown', (e) =>
        @map.set('draggable', false)
        @set('origin', e)

        @moveHandler = $GME.addDomListener(@map.getDiv(), 'mousemove', (e) =>
          origin = @get('origin')
          left   = origin.clientX - e.clientX
          top    = origin.clientY - e.clientY
          pos    = @getProjection().fromLatLngToDivPixel(@position)
          latLng = @getProjection().fromDivPixelToLatLng(new $GM.Point(pos.x - left, pos.y - top))
          @set('origin', e)
          @set('position', latLng)
          @draw()

          @observer.labelPositionUpdated(@index, latLng) if @observer && @observer.labelPositionUpdated
        )
      ),

      $GME.addDomListener(@container, 'mouseup', (e) =>
        @map.set('draggable', true)
        $GME.removeListener(@moveHandler)
      ),

      $GME.addDomListener(@container, 'dblclick', (e) =>
        return if @index == 0
        @onRemove()
        @observer.labelRemoved(@index) if @observer && @observer.labelRemoved
        @stopEvent(e)
      )
    ]

    panes = @getPanes()
    panes.floatPane.appendChild(@container)

  draw: () ->
    loc = @getProjection().fromLatLngToDivPixel(@position)
    @container.style.left = loc.x + 'px'
    @container.style.top = loc.y + 'px'

  updateDistance: () ->
    @container.innerHTML = if @distance > 0 then (@distance / 1000).toFixed(2) + ' km' else if @distance == 0 then 'Start' else ''

  onRemove: () ->
    @container.parentNode.removeChild(@container)
    for eventListener in @eventListeners
      $GME.removeListener(eventListener)
      
  stopEvent: (e) ->
    e.preventDefault() if e.preventDefault
    e.cancelBubble = true
    e.stopPropagation() if e.stopPropagation
