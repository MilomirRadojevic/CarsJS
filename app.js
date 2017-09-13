let data = {};
let cars = [];

const drawButtonBg = function() {
  let buttonBgImage = document.createElement('canvas');        
  var ctx = buttonBgImage.getContext("2d");

  ctx.translate(22, 0);
  ctx.rotate(45 * Math.PI / 180);

  ctx.moveTo(10, 6);
  ctx.lineTo(18, 6);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(5, 6, 4, 0, 2 * Math.PI);
  ctx.stroke();

  let r = document.getElementById('right');
  var dataURL = buttonBgImage.toDataURL("image/png");
  r.style.backgroundImage = "url(" + dataURL + ")";
};

const drawCarTable = function() {        
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
  for(let i = 0; i < 6; i++) {
    let frame = document.getElementById('frame' + i);
    while (frame.firstChild) {
      frame.removeChild(frame.firstChild);
    }
  }
  for(let i = 0; i < cars.length; i++) {
    let img = document.createElement('img');
    img.src = cars[i].image;
    
    let check = document.createElement('input');
    check.type = 'checkbox';
    check.id = 'check' + i;
    check.onchange = function() {
      drawRoad();
    };
    
    let frame = document.getElementById('frame' + i);
    frame.appendChild(img);
    frame.appendChild(check);
  }
};

const filterCars = function() {
  let filter = document.getElementById('left').value;
  cars = [];
  data.cars.forEach((car) => {
    if(filter === '' || car.name.toLowerCase().indexOf(filter.toLowerCase()) >= 0) {
      cars.push(car);
    }
  });
  updateCarTable();
};

const drawRoad = function() {  
  let road = document.getElementById('road');
  
  let countSelected = 0;
  for(let i = 0; i < cars.length; i++) {
    let check = document.getElementById('check' + i);
    if(check.checked) {
      countSelected += 1;
    }
  }
  
  road.width = 900;
  road.height = Math.max(1, countSelected) * 100;
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
      drawRoad();
    }
  };
  
  request.send();
};

document.addEventListener('DOMContentLoaded', function() {
  drawButtonBg();
  drawCarTable();
  loadJson();
});