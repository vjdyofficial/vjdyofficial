// Function to open the preview modal and lock scroll
function openPreview(src) {
  var modal = document.getElementById('previewModal');
  var modalImg = document.getElementById('previewImage');
  modal.style.display = "block";
  modal.classList.add('fade-in');
  modal.classList.remove('fade-out');
  modalImg.classList.add('zoom-in');
  modalImg.classList.remove('zoom-out');
  modalImg.src = src;
  document.body.classList.add('no-scroll');
}

// Function to close the preview modal and unlock scroll
function closePreview() {
  var modal = document.getElementById('previewModal');
  var modalImg = document.getElementById('previewImage');
  modal.classList.add('fade-out');
  modal.classList.remove('fade-in');
  modalImg.classList.add('zoom-out');
  modalImg.classList.remove('zoom-in');
  
  // Delay hiding modal to allow animation to complete
  setTimeout(function() {
    modal.style.display = "none";
    document.body.classList.remove('no-scroll');
  }, 225); // Match the duration of the exit animation
}

function openEdgeSettings() { 
  alert("To change autoplay settings: \n1. Open Edge menu (three dots on the top right). \n2. Go to Settings > Cookies and site permissions > Media autoplay. \n3. Select Allow.");
}