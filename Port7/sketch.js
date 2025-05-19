/* =======================================================
 * Image-to-Text en Text-to-Text AI met p5.js
 * Beschrijving: Deze code detecteert beweging in de video, neemt een screenshot, stuurt het naar een image-to-text model om een beschrijving te krijgen. Deze beschrijving wordt vervolgens gefilterd op eetbare items met behulp van een text-to-text AI-model. Uiteindelijk wordt een recept gegenereerd met alle eetbare items voor het opgegeven aantal personen.
 * Invoer: Live video van de webcam
 * Uitvoer: Recept gegenereerd door het AI-model
 * Gemaakt door [Je Naam]
 * Datum: [Datum]
========================================================= */

let video;
let previousFrame;
let captureInterval = 5000; // Buffer van 1,5 seconde
let lastCaptureTime = 0;
let capturedImages = [];
let ingredients = [];
let descriptions = [];
let edibleItems = [];
let processing = false;
let backlogCounter;
let loadingIndicator;
let descriptionDiv;
let movementCanvas;
let movementThreshold = 25; // Aanpasbaar voor gevoeligheid
let movementPercentThreshold = 0.5; // Aanpasbaar voor gevoeligheid
let generateButton;
let descriptionListDiv;
let peopleSlider;
let peopleCount = 1;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // Canvas voor bewegingsvisualisatie
  movementCanvas = createGraphics(width, height);

  // Ingredient list display
  let ingredientListDiv = createDiv();
  ingredientListDiv.id('ingredientList');
  ingredientListDiv.parent('controlPanel');

  // Beschrijvingen lijst display
  let descriptionTitle = createElement('h3', 'Beschrijving Geschiedenis:');
  descriptionTitle.parent('controlPanel');

  descriptionListDiv = createElement('ul');
  descriptionListDiv.id('descriptionList');
  descriptionListDiv.parent('controlPanel');

  // Backlog counter
  backlogCounter = createDiv('Backlog: 0');
  backlogCounter.id('backlogCounter');
  backlogCounter.parent('controlPanel');

  // Loading indicator
  loadingIndicator = createDiv('Status: Idle');
  loadingIndicator.id('loadingIndicator');
  loadingIndicator.parent('controlPanel');

  // Description display
  descriptionDiv = createDiv('Laatste Beschrijving: N.v.t.');
  descriptionDiv.id('descriptionDiv');
  descriptionDiv.parent('controlPanel');

  // Slider voor aantal personen
  let sliderDiv = createDiv();
  sliderDiv.parent('controlPanel');
  let sliderLabel = createSpan('Aantal Personen: ');
  sliderLabel.parent(sliderDiv);
  peopleSlider = createSlider(1, 10, 1, 1);
  peopleSlider.parent(sliderDiv);
  peopleSlider.input(() => {
    peopleCount = peopleSlider.value();
    sliderLabel.html('Aantal Personen: ' + peopleCount);
  });

  // Generate Recipe Button
  generateButton = createButton('Genereer Recept');
  generateButton.id('generateButton');
  generateButton.parent('controlPanel');
  generateButton.mousePressed(generateFinalRecipe);

  // Debug informatie
  let debugDiv = createDiv('Debug Info:');
  debugDiv.id('debugDiv');
  debugDiv.parent('controlPanel');
}

function draw() {
  image(video, 0, 0);

  // Toon bewegingsvisualisatie
  image(movementCanvas, 0, 0);

  let currentTime = millis();
  if (currentTime - lastCaptureTime > captureInterval) {
    if (detectMotion()) {
      lastCaptureTime = currentTime;
      let capturedImage = video.get();
      capturedImages.push(capturedImage);
      backlogCounter.html('Backlog: ' + capturedImages.length);
      console.log('Afbeelding toegevoegd aan backlog. Huidige backloggrootte: ' + capturedImages.length);
      // Start met het verwerken van de afbeelding
      if (!processing) {
        processNextImage();
      }
    }
  }
}

function detectMotion() {
  video.loadPixels();
  if (previousFrame) {
    let w = video.width;
    let h = video.height;
    let totalPixels = w * h;
    let movement = 0;

    previousFrame.loadPixels();
    movementCanvas.loadPixels();

    for (let i = 0; i < totalPixels * 4; i += 4) {
      let r1 = video.pixels[i];
      let g1 = video.pixels[i + 1];
      let b1 = video.pixels[i + 2];

      let r2 = previousFrame.pixels[i];
      let g2 = previousFrame.pixels[i + 1];
      let b2 = previousFrame.pixels[i + 2];

      let diff = dist(r1, g1, b1, r2, g2, b2);

      if (diff > movementThreshold) {
        movement++;
        // Markeer bewegende pixels op movementCanvas
        movementCanvas.pixels[i] = 255;     // R
        movementCanvas.pixels[i + 1] = 0;   // G
        movementCanvas.pixels[i + 2] = 0;   // B
        movementCanvas.pixels[i + 3] = 100; // A (transparant)
      } else {
        // Transparant maken
        movementCanvas.pixels[i + 3] = 0;
      }
    }

    movementCanvas.updatePixels();

    let movementPercent = (movement / totalPixels) * 100;
    document.getElementById('debugDiv').innerHTML = 'Debug Info:<br>Movement Percent: ' + movementPercent.toFixed(2) + '%';

    if (movementPercent > movementPercentThreshold) {
      previousFrame = video.get();
      console.log('Beweging gedetecteerd. Movement Percent: ' + movementPercent.toFixed(2) + '%');
      return true;
    } else {
      return false;
    }
  } else {
    previousFrame = video.get();
    return false;
  }
}

function processNextImage() {
  if (capturedImages.length > 0) {
    processing = true;
    loadingIndicator.html('Status: Bezig met verwerken...');
    let img = capturedImages.shift();
    backlogCounter.html('Backlog: ' + capturedImages.length);
    sendImageToApi(img, function(description) {
      // Beschrijving toevoegen aan lijst
      descriptions.push(description);
      updateDescriptionList();

      // Toon de laatste beschrijving
      descriptionDiv.html('Laatste Beschrijving: ' + description);

      // Start filtering via het eerste text-to-text model
      filterEdibleItems(description, function(filteredText) {
        if (filteredText) {
          // Voeg eetbare items toe aan lijst
          edibleItems.push(filteredText);
          updateIngredientList();
        }
        // Volgende afbeelding verwerken
        processNextImage();
      });
    });
  } else {
    processing = false;
    loadingIndicator.html('Status: Idle');
  }
}

// Functie om afbeelding naar de image-to-text API te sturen
function sendImageToApi(img, callback) {
  img.loadPixels();
  let base64Image = img.canvas.toDataURL('image/jpeg');

  const apiUrl = 'https://data.id.tue.nl/v1/chat/completions';
  const apiKey = ''; // Vul hier je eigen API-sleutel in

  const requestBody = {
    model: "llava-llama-3-8b-v1_1",
    messages: [
      {  
        role: "user", 
        content: [
          {type: "text", text: ""},
          {type: "image_url", image_url: {url: base64Image}}
        ] 
      }
    ],
    max_tokens: 500,
    temperature: 0.9
  };

  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })
  .then(response => response.json())
  .then(data => {
    console.log('Image-to-Text API Response:', data);
    let description = data.choices[0].message.content || 'Unknown';
    callback(description);
  })
  .catch(error => {
    console.error('Error:', error);
    callback('Unknown');
  });
}

// Eerste Text-to-Text AI-model om eetbare items te filteren
function filterEdibleItems(text, callback) {
  const apiUrl = 'https://data.id.tue.nl/v1/chat/completions';
  const apiKey = 'df-VVBiWkZYMEdoQWNaMTRBdzMyRUtvYVNabldJMlFscVpKbmlMbjhwTTVuOD0='; // Vul hier je eigen API-sleutel in

  const prompt = `Analyseer de volgende tekst en haal alle eetbare items eruit: "${text}". Geef alleen de eetbare items als output, gescheiden door komma's.`;

  const requestBody = {
    model: "hermes-2-pro-llama-3-8b",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 150,
    temperature: 0.7
  };

  loadingIndicator.html('Status: Eetbare items filteren...');
  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })
  .then(response => response.json())
  .then(data => {
    console.log('Filter Edible Items API Response:', data);
    let filteredText = data.choices[0].message.content || '';
    callback(filteredText.trim());
    loadingIndicator.html('Status: Bezig met verwerken...');
  })
  .catch(error => {
    console.error('Error:', error);
    callback('');
    loadingIndicator.html('Status: Bezig met verwerken...');
  });
}

// Functie om een recept te genereren op basis van alle eetbare items
function generateFinalRecipe() {
  const apiUrl = 'https://data.id.tue.nl/v1/chat/completions';
  const apiKey = 'df-VVBiWkZYMEdoQWNaMTRBdzMyRUtvYVNabldJMlFscVpKbmlMbjhwTTVuOD0='; // Vul hier je eigen API-sleutel in

  const combinedEdibleItems = edibleItems.join(', ');

  const prompt = `Maak een recept met de volgende ingrediënten: ${combinedEdibleItems}. Het recept moet geschikt zijn voor ${peopleCount} personen.`;

  const requestBody = {
    model: "hermes-2-pro-llama-3-8b",
    messages: [
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 500,
    temperature: 0.7
  };

  loadingIndicator.html('Status: Finale recept aan het genereren...');
  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })
  .then(response => response.json())
  .then(data => {
    console.log('Final Recipe API Response:', data);
    let recipe = data.choices[0].message.content || 'Geen recept gevonden.';
    displayRecipe(recipe);
    loadingIndicator.html('Status: Idle');
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Fout bij het genereren van het recept.');
    loadingIndicator.html('Status: Idle');
  });
}

function updateIngredientList() {
  let ingredientList = document.getElementById('ingredientList');
  ingredientList.innerHTML = '<h3>Eetbare Items:</h3>' + edibleItems.join('<br>');
}

function updateDescriptionList() {
  let descriptionList = document.getElementById('descriptionList');
  descriptionList.innerHTML = '';
  descriptions.forEach(desc => {
    let listItem = createElement('li', desc);
    listItem.parent(descriptionList);
  });
}

function displayRecipe(recipe) {
  alert('Gegenereerd Recept:\n' + recipe);
}
