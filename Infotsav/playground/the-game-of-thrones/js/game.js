var numberOfSquares = 5;
var gameMapping = [];
var singleCubeWidth;
var singleCubeHeight;
var stage = null;
var playersLayer = null;
var optionsLayer = null;
var currentLevel = 0;
var selectedOne = false;
var imageResources = {};

window.onload = function() {		
	loadImages(function(images) {		
		imageResources = images;
		init(currentLevel);
	});	
	$('.next').click(function(e){
		e.preventDefault();		
		if(levels[currentLevel + 1]) {
			$("#board").html('');
			init(currentLevel + 1);
			checkLevels();
		}	
		else {
			return;
		}
	});
	$('.prev').click(function(e){
		e.preventDefault();
		if(levels[currentLevel - 1]) {
			$("#board").html('');
			init(currentLevel - 1);
			checkLevels();
		}	
		else {
			return;
		}
	});
	$('.restart').click(function(e){
		e.preventDefault();
		$("#board").html('');
		init(currentLevel);
		checkLevels();
	});
	$('.player').live('click', function(e){
		e.preventDefault();
		var player = document.getElementById('mainTheme');
		if(!$(this).hasClass('muted')) {
			player.pause();
			$(this).addClass('muted').html('<span></span>Play');
		}
		else {
			player.play();
			$(this).removeClass('muted').html('<span></span>Mute');
		}
	});
	$('nav a').click(function(e){
		var target = $(this).attr('href');
		$('body > section').removeClass('show');
		$(target).addClass('show');
		e.preventDefault();
	});
	$('.close').click(function(e){
		$('body > section').removeClass('show');
		e.preventDefault();
	});
	
	if(localStorage.getItem('firstTime') == null) {
		$('nav a[href="#howToPlay"]').trigger('click');
		localStorage.setItem('firstTime', false);
	}
	
	$('body').css('background', 'url(images/bg.jpg) no-repeat center');
};

function checkLevels() {
	if(levels[currentLevel + 1]) {
		$('.next').removeClass('disabled');
	}
	else {
		$('.next').addClass('disabled');
	}
	if(levels[currentLevel - 1]) {
		$('.prev').removeClass('disabled');
	}
	else {
		$('.prev').addClass('disabled');
	}
	// Update the level status text
	$('#levelStatus strong').text(currentLevel + 1);
	// Zero the steps info
	$('#steps strong').text('0');
}

function loadImages(callback) {
	var images = {};
	var loadedImages = 0;
	var numItems = 0;	
	for(var name in characters) {		
		numItems++;	  		
	}
	for(var name in characters) {
		images[name] = new Image();
		images[name].onload = function() {
			if(++loadedImages >= numItems) {
				callback(images);
			}
		};
		if(characters[name].image) {
			images[name].src = characters[name].image;
		}
		else {
			numItems--;
		}
	}
}

function init(level) {
	gameMapping = [];
	
	if(stage != null) {
		stage.clear();
	}
	
	$('#levelStatus span').text(levels.length).show();
	
	stage = new Kinetic.Stage({
		container: "board",
		width: 350,
		height: 350
	});
	
	var board = new Kinetic.Layer();
	var group = new Kinetic.Group();        
	
	singleCubeWidth = stage.getWidth() / numberOfSquares;
	singleCubeHeight = stage.getHeight() / numberOfSquares;
	
	var left = 0;
	var top = 0;
	
	for(i = 0; i < numberOfSquares; i++) {
		gameMapping[i] = [];
		for(x = 0; x < numberOfSquares; x++) {
			gameMapping[i][x] = false;
			var fill;
			if(i == Math.floor(numberOfSquares / 2) && x == Math.floor(numberOfSquares / 2)) {
				fill = {image: imageResources.centerCube, offset: [-9,-8]};
			}
			else {
				fill = '#cccccc';
			}
			var box = new Kinetic.Rect({
			  x: left,
			  y: top,
			  width: singleCubeWidth,
			  height: singleCubeHeight,
			  name: 'square' + [i],
			  fill: fill,
			  stroke: "#999999",
			  strokeWidth: 3,
			  shadow: {
					color: '#fff',
					blur: 0,
					offset: [-3, -3],
					alpha: 0.8
				}
			});

			group.add(box);
			left += singleCubeWidth;
		}
		left = 0;
		top += singleCubeHeight;
	}

	board.add(group);
	stage.add(board);
	
	createLevel(level);
}

function createLevel(level) {
	// Set the current level
	currentLevel = level;
	
	// Clear previus canvas levels
	if(playersLayer != null)
		playersLayer.clear();
		
	playersLayer = new Kinetic.Layer();
	var playersGroup = new Kinetic.Group();
	var levelData = levels[level];	
	
	for(i = 0; i < levelData.characters.length; i++) {		
		var cahracter = levelData.characters[i];
		var player = new Kinetic.Image({
			x: ((cahracter.position[0]) * singleCubeWidth) + ((singleCubeWidth - 46) / 2),
			y: ((cahracter.position[1]) * singleCubeHeight) + ((singleCubeHeight - 46) / 2),
			stroke: levelData.characters[i].name == 'main' ? '#971919' : '#000',
			strokeWidth: 4,
			width: 46,
			height: 46,
			image: imageResources[cahracter.name],
			shadow: characters[cahracter.name].shadow,
			name: cahracter.name,
			position: [cahracter.position[0], cahracter.position[1]]
        });		
		playersGroup.add(player);
		gameMapping[cahracter.position[0]][cahracter.position[1]] = true;
	}
	
	playersGroup.on('click tap', function(evt) {				
		// get the shape that was clicked on
		var shape = evt.shape;
		
		if(selectedOne != false && selectedOne.getName() != shape.getName()) {
			selectedOne.setShadow(characters[selectedOne.getName()].shadow);
		};
		
		if(shape.getShadow().alpha != characters[shape.getName()].shadow.alpha) {
			shape.setShadow(characters[shape.getName()].shadow);
			selectedOne = false;
			clearOptions();
		}
		else {
			shape.setShadow(characters.selected.shadow.center);
			selectedOne = shape;
			getOptions(level, selectedOne);
		}		
		playersLayer.draw();
	});
	
	// add cursor styling
	playersGroup.on("mouseover", function(e) {
	  document.body.style.cursor = "pointer";
	});
	playersGroup.on("mouseout", function(e) {
	  document.body.style.cursor = "default";
	});
	
	playersLayer.add(playersGroup);
	stage.add(playersLayer);
}

function getOptions(level, selected) {
	var whereToMove = [];
	var selectedPosX = selected.attrs.position[0];
	var selectedPosY = selected.attrs.position[1];
	
	// Check where can it move	
	for(var x = 0; x < gameMapping.length; x++) {
		for(var y = 0; y < gameMapping[x].length; y++){
			if(gameMapping[x][y] === true && y === selectedPosY && x !== selectedPosX) {				
				if(x < selectedPosX) {					
					if(whereToMove['left'] == null || selectedPosX - x < selectedPosX - whereToMove['left'][0]) {
						if(selectedPosX - x > 1) {
							whereToMove['left'] = [x,y];
						}
						else {
							whereToMove['left'] = false;
						}
					}
				}
				else if(x > selectedPosX) {
					if(whereToMove['right'] == null) {
						if(x - selectedPosX > 1) {
							whereToMove['right'] = [x,y];
						}
						else {
							whereToMove['right'] = false;
						}
					}
				}
			}
			if(gameMapping[x][y] === true && x === selectedPosX && y !== selectedPosY) {
				if(y < selectedPosY) {
					if(whereToMove['top'] == null || (selectedPosY - y < selectedPosY - whereToMove['top'][1])) {
						if(selectedPosY - y > 1) {
							whereToMove['top'] = [x,y];
						}
						else {
							whereToMove['top'] = false;
						}
					}
				}
				else if(y > selectedPosY) {
					if(whereToMove['bottom'] == null) {
						if(y - selectedPosY > 1) {
							whereToMove['bottom'] = [x,y];
						}
						else {
							whereToMove['bottom'] = false;
						}
					}
				}
			}
		}		
	}
	showOptions(whereToMove);
}

function showOptions(options) {
	if(optionsLayer != null) {
		clearOptions();
	}
	else {
		optionsLayer = new Kinetic.Layer();
	}
	var optionsGroup = new Kinetic.Group();
	for(var dir in options) {
		var optionPosition = options[dir];
		if(optionPosition) {
			var option = new Kinetic.Rect({
			  x: ((getRightXpos(dir, optionPosition[0])) * singleCubeWidth) + ((singleCubeWidth - 46) / 2),
			  y: ((getRightYpos(dir, optionPosition[1])) * singleCubeHeight) + ((singleCubeHeight - 46) / 2),		  
			  width: singleCubeHeight - 23,
			  height: singleCubeHeight - 23,
			  fill: characters.option.color,
			  name: dir,
			  position: [getRightXpos(dir, optionPosition[0]), getRightYpos(dir, optionPosition[1])]
			});		
			optionsGroup.add(option);
		}
	}
	
	optionsLayer.add(optionsGroup);
	stage.add(optionsLayer);
	
	optionsLayer.off('click');
	optionsLayer.on('click tap', function(evt) {				
		// Get the shape that was clicked on
		var shape = evt.shape;
		
		if(selectedOne != false) {
			// Play the "move" sound
			var movePlayerSound = document.getElementById('move');
			movePlayerSound.src = $.browser.mozilla ? sounds.move.ogg : sounds.move.mp3;
			movePlayerSound.play();
			// Set the shadow and make the transition
			selectedOne.setShadow(characters.selected.shadow[shape.getName()]);
			selectedOne.transitionTo({
				x: shape.getX(),
				y: shape.getY(),				
				duration: 0.5,
				callback: function() {
					checkWinning(selectedOne);
					selectedOne.setShadow(characters[selectedOne.getName()].shadow);
				}
			});			
			gameMapping[selectedOne.attrs.position[0]][selectedOne.attrs.position[1]] = false;
			gameMapping[shape.attrs.position[0]][shape.attrs.position[1]] = true;
			// Set the selected one new attributes
			selectedOne.attrs.position = [shape.attrs.position[0], shape.attrs.position[1]];

			// Update the steps status
			$('#steps strong').text(parseInt($('#steps strong').text()) + 1);
		};				
		
		playersLayer.draw();
		clearOptions();
	});
	
	// Add cursor styling
	optionsLayer.on("mouseover", function(e) {
	  document.body.style.cursor = "pointer";
	});
	optionsLayer.on("mouseout", function(e) {
	  document.body.style.cursor = "default";
	});		
}

function checkWinning(selectedOne) {
	// Check for victory
	if(	
		selectedOne.getName() == 'main' && 
		selectedOne.attrs.position[0] === Math.floor(gameMapping.length / 2) && 
		selectedOne.attrs.position[1] === Math.floor(gameMapping.length / 2)) 
	{				
		var hooraySound = document.getElementById('hooray');		
		hooraySound.src = $.browser.mozilla ? sounds.hooray.ogg : sounds.hooray.mp3;
		hooraySound.play();
		window.setTimeout(function(){
			$('#levelInfo strong.level').text(currentLevel + 1);
			$('#levelInfo strong.step').text($('#steps strong').text());
			$('#levelInfo').fadeIn('fast');
		}, 2000);
		// Check if this is the last level
		if(levels[currentLevel + 1]) {
			window.setTimeout(function(){		
				$('.next').trigger('click');
				$('#levelInfo').fadeOut('fast');
				hooraySound.pause();
			}, 5500);
		}
		else {
			$('#levelInfo h2').text('Praise the Queen!');
			$('#levelInfo h3').hide();
			$('<h3 id="finish">You have finished the Game of Throne! <br />Hooray!!!</h3>').appendTo('#levelInfo');
			$('.prev').unbind('click').addClass('disabled');
			$('.restart').unbind('click');
		}
	}
}

function getRightXpos(dir, position) {
	if(dir == 'left') {
		return position + 1;
	}
	else if(dir == 'right') {
		return position - 1;
	}
	else {
		return position;
	}
}

function getRightYpos(dir, position) {
	if(dir == 'top') {
		return position + 1;
	}
	else if(dir == 'bottom') {
		return position - 1;
	}
	else {
		return position;
	}
}

function clearOptions() {
	optionsLayer.off('click');
	optionsLayer.clear();
	optionsLayer.removeChildren();
}