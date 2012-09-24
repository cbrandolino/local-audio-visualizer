var audioCtx = new webkitAudioContext()

window.onload = function() {
  var element = document.getElementById('container')
  dropAndLoad(element, init, "ArrayBuffer")
}

function init(arrayBuffer) {
  audioCtx.decodeAudioData(arrayBuffer, function(buffer) {
    var source = audioCtx.createBufferSource()   
    source.buffer = buffer
    source.connect(audioCtx.destination)
    source.noteOn(0)
  })
}

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
