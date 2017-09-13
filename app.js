let data = {};
let cars = [];
let selectedCars = [];

const isNumberKey = function(evt) {
  let charCode = (evt.which) ? evt.which : event.keyCode
  if (charCode > 31 && (charCode < 48 || charCode > 57))
    return false;
  return true;
}

const toggleStartButton = function() {
  let input = document.getElementById('left_bottom');
  let button = document.getElementById('right_bottom');
  button.disabled = !input.value;
};

const drawButtonBg = function() {
  let buttonBgImage = document.createElement('canvas');
  let ctx = buttonBgImage.getContext("2d");

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
  let dataURL = buttonBgImage.toDataURL('image/png');
  r.style.backgroundImage = 'url(' + dataURL + ')';
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
    img.id = 'img' + i;
    
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

const drawSolidLine = function(ctx, x1, y1, x2, y2, color) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = color;
  ctx.stroke();
};

const drawDashedLine = function(ctx, x1, y1, x2, y2, width) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineWidth = width;
  ctx.strokeStyle = 'gray';
  ctx.setLineDash([10, 10]);
  ctx.stroke();
  ctx.setLineDash([]);
};

const drawCircle = function(ctx, width, x, y, radius, color) {
  ctx.beginPath();
  ctx.lineWidth = width;
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.lineWidth = 1;
}

const drawText = function(ctx, font, text, x, y) {
  ctx.font = font;
  ctx.strokeStyle = 'black';
  ctx.strokeText(text, x, y);
}

const drawRoundedRectangle = function(ctx, x1, x2, y1, y2) {
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x2 - 20, y2);
  ctx.arcTo(x1, y2, x1, y1, 10);
  ctx.arcTo(x1, y1, x2, y1, 10);
  ctx.arcTo(x2, y1, x2, y2, 10);
  ctx.arcTo(x2, y2, x2 - 20, y2, 10);
  ctx.lineTo(x2 - 20, y2);
  ctx.stroke();
};

const drawRoad = function() {  
  let road = document.getElementById('road');
  
  selectedCars = [];
  for(let i = 0; i < cars.length; i++) {
    let check = document.getElementById('check' + i);
    if(check.checked) {
      let car = cars[i];
      car.ind = i;
      selectedCars.push(car);
    }
  }
  
  let height = Math.max(1, selectedCars.length);
  road.width = 900;
  road.height = height * 50 + 150;
  
  let ctx = road.getContext('2d');
  ctx.lineWidth = 1;
  
  //ctx.clearRect(0, 0, road.width, road.height);
  
  drawRoundedRectangle(ctx, 0, road.width, 50, road.height - 100);
  
  for(let i = 1; i < 10; i++) {
    drawText(ctx, '15px Arial', i + 'xN', i / 10.0 * road.width - 12, 30);
    
    drawSolidLine(ctx, i / 10.0 * road.width, 50, i / 10.0 * road.width, road.height - 100, '#CCCCCC');
  }
  
  for(let i = 1; i < height; i++) {
    drawSolidLine(ctx, 0, i * 50 + 50, road.width, i * 50 + 50, 'black');
  }
  
  data.speed_limits.forEach((limit) => {
    let limitPosition = limit.position * 1.0 * road.width / data.distance;
    
    drawDashedLine(ctx, limitPosition, 40, limitPosition, road.height - 80, 5);
    
    drawCircle(ctx, 10, limitPosition, road.height - 50, 30, '#CCCCCC');
    
    drawText(ctx, '30px Arial', limit.speed, limitPosition - 15, road.height - 40);
  });
  
  data.traffic_lights.forEach((light) => {
    let lightPosition = light.position * 1.0 * road.width / data.distance;
    
    drawDashedLine(ctx, lightPosition, 40, lightPosition, road.height - 90, 3);
    
    drawRoundedRectangle(ctx, lightPosition - 20, lightPosition + 20, road.height - 90, road.height - 10);
    
    drawCircle(ctx, 1, lightPosition, road.height - 65, 12, '#DDDDDD');
    drawCircle(ctx, 1, lightPosition, road.height - 35, 12, '#DDDDDD');
  });
  
  drawCars();
};

const drawCars = function() {
  selectedCars.forEach((car) => {
    let road = document.getElementById('road');    
    let ctx = road.getContext('2d');
    
    for(let i = 0; i < selectedCars.length; i++) {
      drawRoundedRectangle(ctx, 10, road.width / 10.0 - 10, i * 50 + 55, i * 50 + 95);
      let img = document.getElementById('img' + selectedCars[i].ind);
      let widthDiff = 1.0 * (road.width / 10.0 - 20) / img.width;
      let heightDiff = 40.0 / img.height;
      let diff = Math.min(widthDiff, heightDiff);
      ctx.drawImage(img, 10, i * 50 + 60, img.width * diff, img.height * diff);
    }
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
