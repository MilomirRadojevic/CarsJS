let data = {};
let cars = [];

const createCarTable = function() {
  let table = document.getElementById('carTable');
  for (let i = 0; i < 2; i++) {
    let row = document.createElement('tr'); 
    for (let j = 0; j < 3; j++) {
      let cell = document.createElement('td');
      
      let frame = document.createElement('div');
      frame.className = 'frame';
      frame.id = 'frame' + (3 * i + j);
      
      cell.appendChild(frame);
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
};

const updateCarTable = function() {
  let table = document.getElementById('carTable');
  for(let i = 0; i < cars.length; i++) {
    let img = document.createElement('img');
    img.src = cars[i].image;
    
    let frame = document.getElementById('frame' + i);
    frame.appendChild(img);
  }
};

const loadJson = function() {
  let request = new XMLHttpRequest();
  request.open('GET', 'http://localhost/server.php/data');
  request.onload = function() {
    if (request.status === 200) {
      data = eval('(' + request.response + ')');
      
      cars = [];
      data.cars.forEach((car) => {
        cars.push(car);
      });
      updateCarTable();
    }
  };
  
  request.send();
};

document.addEventListener('DOMContentLoaded', function() {
  loadJson();
  createCarTable();
});