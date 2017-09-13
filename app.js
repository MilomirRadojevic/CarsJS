let data = {};
let cars = [];
let selectedCars = [];
let finishedCars = [];
let animationSpeed = null;
let animationActive = false;
let timer = null;
let medals = ['#FFD700', '#C0C0C0', '#CD7F32', null, null];
let trafficSignalisation = [];

//check if input is number
const isNumberKey = function(evt) {
  let charCode = (evt.which) ? evt.which : event.keyCode
  if (charCode > 31 && (charCode < 48 || charCode > 57))
    return false;
  return true;
}

//activate button only if there is some input
const toggleStartButton = function() {
  let input = document.getElementById('left_bottom');
  let button = document.getElementById('right_bottom');
  button.disabled = !input.value;
};

//add background image to search button
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

//draw table which will contain car gallery
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

//redraw selected cars to the road
const resetTrack = function() {
  finishedCars = [];
  animationActive = false;
  
  data.cars.forEach((car) => {
    car.traveledDistance = 0;
    car.nextTrafficSignal = 0;
    car.finished = false;
  });
  
  data.traffic_lights.forEach((light) => {
    light.allow = false;
  });

  drawCars();
};

//put cars in the gallery
const updateCarTable = function() {
  //remove old gallery elements
  let table = document.getElementById('carTable');
  for(let i = 0; i < 6; i++) {
    let frame = document.getElementById('frame' + i);
    while (frame.firstChild) {
      frame.removeChild(frame.firstChild);
    }
  }
  
  //add new elements
  for(let i = 0; i < cars.length; i++) {
    let img = document.createElement('img');
    img.src = cars[i].image;
    img.id = 'img' + i;
    
    let check = document.createElement('input');
    check.type = 'checkbox';
    check.id = 'check' + i;
    
    check.onchange = function() {  
      resetTrack();
    };
    
    let frame = document.getElementById('frame' + i);
    frame.appendChild(img);
    frame.appendChild(check);
  }
  
  resetTrack();
};

//filter cars from API and put them to gallery
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

//canvas drawing
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
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 1;
}

const drawText = function(ctx, font, text, x, y) {
  ctx.font = font;
  ctx.strokeStyle = 'black';
  ctx.strokeText(text, x, y);
}

const drawRoundedRectangle = function(ctx, x1, x2, y1, y2, fillColor) {
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x2 - 20, y2);
  ctx.arcTo(x1, y2, x1, y1, 10);
  ctx.arcTo(x1, y1, x2, y1, 10);
  ctx.arcTo(x2, y1, x2, y2, 10);
  ctx.arcTo(x2, y2, x2 - 20, y2, 10);
  ctx.lineTo(x2 - 20, y2);
  ctx.stroke();
  if(fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
};

const laneHeight = 50;
const numberOfSegments = 10;
const topOffset = 50;
const bottomOffset = -100;
  
const drawRoad = function() {
  
  let road = document.getElementById('road');
  
  //save selected cars to new array used for showing them on the track
  selectedCars = [];
  for(let i = 0; i < cars.length; i++) {
    let check = document.getElementById('check' + i);
    if(check.checked) {
      let car = cars[i];
      car.ind = i;
      selectedCars.push(car);
    }
  }
  
  //set height of track to fit number of seleted cars
  let height = Math.max(1, selectedCars.length);
  road.width = 900;
  road.height = height * laneHeight + 150;
  
  let ctx = road.getContext('2d');
  ctx.lineWidth = 1;

  //draw track elements, lanes, trafic signalization
  drawRoundedRectangle(ctx, 0, road.width, 50, road.height - 100, null);
  
  //draw vertical lines to represent segments
  for(let i = 1; i < numberOfSegments; i++) {
    let xPosition = i * 1.0 / numberOfSegments;
    drawText(ctx, '15px Arial', i + 'xN', xPosition * road.width - 12, 30);
    
    drawSolidLine(ctx, xPosition * road.width, topOffset,
                  xPosition * road.width, road.height + bottomOffset, '#CCCCCC');
  }
  
  //draw horizontal lines between lanes
  for(let i = 1; i < height; i++) {
    drawSolidLine(ctx, 0, i * laneHeight + topOffset,
                  road.width, i * laneHeight + topOffset, 'black');
  }
  
  data.speed_limits.forEach((limit) => {
    let limitPosition = limit.position * 1.0 * road.width / data.distance;
    
    drawDashedLine(ctx, limitPosition, topOffset - 10,
                   limitPosition, road.height + bottomOffset + 20, 5);
    
    drawCircle(ctx, 10, limitPosition, road.height + bottomOffset + 50, 30, '#CCCCCC');
    
    drawText(ctx, '30px Arial', limit.speed, limitPosition - 15, road.height + bottomOffset + 60);
  });
  
  data.traffic_lights.forEach((light) => {
    let lightPosition = light.position * 1.0 * road.width / data.distance;
    
    drawDashedLine(ctx, lightPosition, topOffset - 10,
                   lightPosition, road.height + bottomOffset + 10, 3);
    
    drawRoundedRectangle(ctx, lightPosition - 20, lightPosition + 20,
                         road.height + bottomOffset + 10, road.height + bottomOffset + 90, null);
    
    drawCircle(ctx, 1, lightPosition, road.height + bottomOffset + 35,
               12, light.allow ? '#EEEEEE' : 'red');
    drawCircle(ctx, 1, lightPosition, road.height + bottomOffset + 65,
               12, light.allow ? 'green' : '#EEEEEE');
  });
};

const drawCars = function() {
  let animationFactor = 500;
  
  //redraw track before cars
  drawRoad();
  
  let road = document.getElementById('road');    
  let ctx = road.getContext('2d'); 
  
  //find real vs screen distance ratio
  let realDistance = data.distance;
  
  //distance between first and last segment
  let screenDistance = road.width * 1.0 * (numberOfSegments - 1) / numberOfSegments;
  
  if(animationActive === false) {
    selectedCars.forEach((car) => {
      car.traveledDistance = 0;
    });
  } else {
    selectedCars.forEach((car) => {
      //if not waiting for green light, move forward
      car.traveledDistance += car.waiting ? 0 : car.currentSpeed * animationSpeed / animationFactor;
      
      let signal = trafficSignalisation[car.nextTrafficSignal];
      if(signal !== null) {
        //check if at next sign or traffic light
        if(car.traveledDistance >= signal.position * 1.0 * screenDistance / realDistance) {
          //adjust speed to speed limit
          if(signal.type === 'limit') {
            car.currentSpeed = Math.min(car.speed, signal.speed);
            car.nextTrafficSignal += 1;
          } else if (signal.type === 'light') {
            //wait if not allowed to pass
            if(signal.allow) {
              car.waiting = false;
              car.nextTrafficSignal += 1;
            } else {
              car.waiting = true;
            }
          }
        }
      }
      
      //check if car is at the finish
      if(car.traveledDistance >= screenDistance) {
        car.currentSpeed = 0;
        car.traveledDistance = screenDistance;
        if(!car.finished) {
          car.finished = true;
          finishedCars.push(car);
        }
      }
    });
  }
  
  //award medals to the fastest cars
  for(let i = 0; i < finishedCars.length; i++) {
    finishedCars[i].fillColor = medals[i];
  }
  
  //redraw cars to the new position
  for(let i = 0; i < selectedCars.length; i++) {
    drawRoundedRectangle(ctx, 10 + selectedCars[i].traveledDistance,
                         road.width * 1.0 / numberOfSegments - 10 + selectedCars[i].traveledDistance,
                         i * laneHeight + topOffset + 5, i * laneHeight + topOffset + 45,
                         selectedCars[i].fillColor);
    
    selectedCars[i].fillColor = null;
    
    let img = document.getElementById('img' + selectedCars[i].ind);
    let widthDiff = 1.0 * (road.width * 1.0 / numberOfSegments - 20) / img.width;
    let heightDiff = 40.0 / img.height;
    let diff = Math.min(widthDiff, heightDiff);
    ctx.drawImage(img, 10 + selectedCars[i].traveledDistance,
                  i * laneHeight + topOffset + 10, img.width * diff, img.height * diff);
  }
};

//toggle traffic light if animation is active
const toggleLight = function(light) {
  if(animationActive === false) {
    light.allow = false;
  } else {
    light.allow = ! light.allow;
  }
};

const startAnimation = function() {
  //adjust input speed to 1-10
  animationSpeed = document.getElementById('left_bottom').value;
  if(animationSpeed < 1) {animationSpeed = 1;}
  if(animationSpeed > 10) {animationSpeed = 10;}
  animationActive = true;
  
  finishedCars = [];
  
  //reset car positions
  selectedCars.forEach((car) => {
    car.currentSpeed = car.speed;
    car.traveledDistance = 0;
    car.nextTrafficSignal = 0;
    car.finished = false;
    car.waiting = false;
  });
  
  //start trafic lights
  data.traffic_lights.forEach((light) => {
    light.allow = false;
  
    if(light.light_timer !== null) {
      clearInterval(light.light_timer);
    }
    light.light_timer = setInterval(toggleLight, light.duration, light);
  });

  //start cars
  if(timer !== null) {
    clearInterval(timer);
  }
  timer = setInterval(drawCars, 30);  
};

//load data from API
const loadJson = function() {
  let request = new XMLHttpRequest();
  request.open('GET', 'http://localhost/server.php/data');
  request.onload = function() {
    if (request.status === 200) {
      data = eval('(' + request.response + ')');
      
      //set aditional parameters
      data.traffic_lights.forEach((light) => {
        light.allow = false;
        light.light_timer = null;
        
        light.type = 'light';
        trafficSignalisation.push(light);
      });
      
      data.speed_limits.forEach((limit) => {        
        limit.type = 'limit';
        trafficSignalisation.push(limit);
      });
      
      trafficSignalisation.sort(function(a, b) {
        return a.position - b.position;
      });
      
      trafficSignalisation.push(null);
      
      cars = [];
      data.cars.forEach((car) => {
        car.waiting = false;
        car.nextTrafficSignal = 0;
        cars.push(car);
      });
      updateCarTable();
    }
  };
  
  request.send();
};

//draw elements to the page and ask for data from API
document.addEventListener('DOMContentLoaded', function() {
  drawButtonBg();
  drawCarTable();
  loadJson();
});
