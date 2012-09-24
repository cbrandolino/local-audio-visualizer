var element = document.getElementById('container')

window.onload = function() {
  dropAndLoad(window.element, init)
}

function init(dataUrl) {

}

function dropAndLoad(dropElement, callback) {

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
    reader.readAsDataURL(file)
  }
}
