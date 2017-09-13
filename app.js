let data = {};
let cars = [];

const drawButtonBg = function() {
  let buttonBgImage = document.createElement('canvas');
  var ctx = buttonBgImage.getContext("2d");

  ctx.translate(22, 0);
  ctx.rotate(45 * Math.PI / 180);

  ctx.beginPath();
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
  
  drawRoad();
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
  
  let height = Math.max(1, countSelected);
  road.width = 900;
  road.height = height * 50 + 150;
  
  var ctx = road.getContext('2d');
  ctx.lineWidth = 1;
  
  ctx.beginPath();
  ctx.moveTo(road.width / 2, road.height - 100);
  ctx.arcTo(0, road.height - 100, 0, 50, 10);
  ctx.arcTo(0, 50, road.width, 50, 10);
  ctx.arcTo(road.width, 50, road.width, road.height - 100, 10);
  ctx.arcTo(road.width, road.height - 100, road.width / 2, road.height - 100, 10);
  ctx.lineTo(road.width / 2, road.height - 100);
  ctx.stroke();
  
  for(let i = 1; i < 10; i++) {
    ctx.font="15px Arial";
    ctx.strokeStyle = 'black';
    ctx.strokeText(i + 'xN', i / 10.0 * road.width - 12, 30);
    ctx.beginPath();
    ctx.moveTo(i / 10.0 * road.width, 50);
    ctx.lineTo(i / 10.0 * road.width, road.height - 100);
    ctx.strokeStyle = '#CCCCCC';
    ctx.stroke();
  }
  
  for(let i = 1; i < height; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * 50 + 50);
    ctx.lineTo(road.width, i * 50 + 50);
    ctx.strokeStyle = 'black';
    ctx.stroke();
  }
  
  data.speed_limits.forEach((limit) => {
    ctx.beginPath();
    ctx.moveTo(limit.position * 1.0 * road.width / data.distance, 40);
    ctx.lineTo(limit.position * 1.0 * road.width / data.distance, road.height - 80);
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'gray';
    ctx.setLineDash([10, 10]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.beginPath();
    ctx.lineWidth = 10;
    ctx.arc(limit.position * 1.0 * road.width / data.distance, road.height - 50, 30, 0, 2 * Math.PI);
    ctx.strokeStyle = '#CCCCCC';
    ctx.stroke();
    
    ctx.lineWidth = 1;
    ctx.font = "30px Arial";
    ctx.strokeStyle = 'black';
    ctx.strokeText(limit.speed, limit.position * 1.0 * road.width / data.distance - 15, road.height - 40);
  });
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
  drawButtonBg();
  drawCarTable();
  loadJson();
});
