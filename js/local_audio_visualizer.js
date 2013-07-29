(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

window.onload = function() {
  var element = document.getElementById('container')
  dropAndLoad(element, init, "ArrayBuffer")
}


// Reusable dropAndLoad function: it reads a local file dropped on a
// `dropElement` in the DOM in the specified `readFormat`
// (In this case, we want an arrayBuffer)
function dropAndLoad(dropElement, callback, readFormat) {
  var readFormat = readFormat || "DataUrl"

  dropElement.addEventListener('dragover', function(e) {
    e.stopPropagation()
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, false)

  dropElement.addEventListener('drop', function(e) {
    e.stopPropagation()
    e.preventDefault()
    loadFile(e.dataTransfer.files[0])
  }, false) 

  function loadFile(files) {
    var file = files
    var reader = new FileReader()
    reader.onload = function(e) {
      callback(e.target.result)
    }
    reader['readAs'+readFormat](file)
  }
}

// Once the file is loaded, we start getting our hands dirty.
function init(arrayBuffer) {
  document.getElementById('instructions').innerHTML = 'Loading ...'
  // Create a new `audioContext` and its `analyser`
  window.audioCtx = new AudioContext()
  window.analyser = audioCtx.createAnalyser()
  // If a sound is still playing, stop it.
  if (window.source)
    source.noteOff(0)
  // Decode the data in our array into an audio buffer
  audioCtx.decodeAudioData(arrayBuffer, function(buffer) {
    // Use the audio buffer with as our audio source
    window.source = audioCtx.createBufferSource()   
    source.buffer = buffer
    // Connect to the analyser ...
    source.connect(analyser)
    // and back to the destination, to play the sound after the analysis.
    analyser.connect(audioCtx.destination)
    // Start playing the buffer.
    source.start(0)
    // Initialize a visualizer object
    var viz = new simpleViz()
    // Finally, initialize the visualizer.
    new visualizer(viz['update'], analyser)
    document.getElementById('instructions').innerHTML = ''
  })
}

// The visualizer object. 
// Calls the `visualization` function every time a new frame
// is available.
// Is passed an `analyser` (audioContext analyser).
function visualizer(visualization, analyser) {
  var self = this
  this.visualization = visualization  
  var last = Date.now()
  var loop = function() {
    var dt = Date.now() - last
    // we get the current byteFreq data from our analyser
    var byteFreq = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(byteFreq)
    last = Date.now()
    // We might want to use a delta time (`dt`) too for our visualization.
    self.visualization(byteFreq, dt)
    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
}

// A simple visualization. Its update function illustrates how to use 
// the byte frequency data from an audioContext analyser.
function simpleViz(canvas) {
  var self = this
  this.canvas = document.getElementById('canvas')
  this.ctx = this.canvas.getContext("2d")
  this.copyCtx = document.getElementById('canvas-copy').getContext("2d")
  this.ctx.fillStyle = '#fff' 
  this.barWidth = 10
  this.barGap = 4
  // We get the total number of bars to display
  this.bars = Math.floor(this.canvas.width / (this.barWidth + this.barGap))
  // This function is launched for each frame, together with the byte frequency data.
  this.update = function(byteFreq) {
    self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height)
    // We take an element from the byteFreq array for each of the bars.
    // Let's pretend our byteFreq contains 20 elements, and we have five bars...
    var step = Math.floor(byteFreq.length / self.bars)
    // `||||||||||||||||||||` elements
    // `|   |   |   |   |   ` elements we'll use for our bars
    for (var i = 0; i < self.bars; i ++) {
      // Draw each bar
      var barHeight = byteFreq[i*step]
      self.ctx.fillRect(
        i * (self.barWidth + self.barGap), 
        self.canvas.height - barHeight, 
        self.barWidth, 
        barHeight)
      self.copyCtx.clearRect(0, 0, self.canvas.width, self.canvas.height)
      self.copyCtx.drawImage(self.canvas, 0, 0)
    }
  }
}


