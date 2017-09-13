let data = {};

const loadJson = function() {
  let request = new XMLHttpRequest();
  request.open('GET', 'http://localhost/server.php/data');
  request.onload = function() {
    if (request.status === 200) {
      data = request.response;
    }
  };
  
  request.send();
};

document.addEventListener("DOMContentLoaded", function() {
  loadJson();
});