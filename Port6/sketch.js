// sketch.js

let worldMap;
let selectedCountries = [];
let countryShapes = [];
let state = 'login'; // States: 'login', 'mainMenu', 'selection', 'vibesInput', 'sliders', 'result', 'account', 'favorites', 'userInfo'
let nextButton;
let peopleSlider, timeSlider, difficultySlider, ingredientsSlider;
let proteinSlider, carbSlider, fatSlider;
let budgetSlider, healthSlider;
let peopleLabel, timeLabel, difficultyLabel, ingredientsLabel;
let proteinLabel, carbLabel, fatLabel;
let budgetLabel, healthLabel;
let generateButton;
let recipeDiv;
let dietaryRestrictions = [];
let dietaryButtons = [];
let ingredientsInput;
let ingredientsInputLabel;
let loadingDiv;
let vibesInput;
let vibesInputLabel;
let resetButton;
let lastPrompt = ''; // To store the last used prompt
let lastRecipe = ''; // To store the last generated recipe

// Variables for main menu buttons
let startMapButton, startPromptButton, accountButton, favoritesButton, userInfoButton;

// Variables for account customization
let accountSettings = {
  variables: {
    people: true,
    time: true,
    difficulty: true,
    ingredientsAmount: true,
    protein: true,
    carb: true,
    fat: true,
    budget: true,
    generalHealth: true,
    dietaryRestrictions: true,
    ingredientsAtHome: true
  },
  dietaryRestrictions: [],
  availableTools: ['Oven', 'BBQ', 'Microwave', 'Blender', 'Stove'],
};

// Favorites list and their summaries
let favorites = [];
let favoriteSummaries = [];

// User tools
let userTools = ['Oven', 'BBQ', 'Microwave', 'Blender', 'Stove'];

// Tooltip for country names
let tooltip;

// Login variables
let users = {}; // For demonstration purposes, using an object to store users
let currentUser = null;

function preload() {
  // Load the GeoJSON world map data
  worldMap = loadJSON('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json');
}

function setup() {
  // Create a canvas (hidden by default)
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('canvas-container');
  select('#canvas-container').hide();

  parseWorldMap();

  // Setup main menu buttons
  startMapButton = select('#start-map-button');
  startPromptButton = select('#start-prompt-button');
  accountButton = select('#account-button');
  favoritesButton = select('#favorites-button');
  userInfoButton = select('#user-info-button');

  startMapButton.mousePressed(startWithMap);
  startPromptButton.mousePressed(startWithPrompt);
  accountButton.mousePressed(goToAccount);
  favoritesButton.mousePressed(showFavorites);
  userInfoButton.mousePressed(showUserInfo);

  // Make the logo clickable to go back to home
  let homeButton = select('#home-button');
  homeButton.mousePressed(() => {
    // Hide all other containers
    hideAllContainers();
    // Show main menu
    select('#main-menu-container').show();
    state = 'mainMenu';
  });

  // Ensure navigation buttons work from any state
  accountButton.mousePressed(() => {
    hideAllContainers();
    goToAccount();
  });
  favoritesButton.mousePressed(() => {
    hideAllContainers();
    showFavorites();
  });
  userInfoButton.mousePressed(() => {
    hideAllContainers();
    showUserInfo();
  });

  // Tooltip for country names
  tooltip = createDiv('');
  tooltip.addClass('country-name-tooltip');
  tooltip.hide();

  // Setup login screen
  setupLoginScreen();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  if (state === 'selection') {
    background(220);
    drawCountries();
  }
}

function hideAllContainers() {
  select('#login-container').hide();
  select('#main-menu-container').hide();
  select('#canvas-container').hide();
  select('#interface-container').hide();
  select('#recipe-container').hide();
  select('#favorites-container').hide();
  select('#user-info-container').hide();
  select('header').hide();
}

function parseWorldMap() {
  // Parse the GeoJSON data and project coordinates
  for (let i = 0; i < worldMap.features.length; i++) {
    let country = worldMap.features[i];
    let countryName = country.properties.name;
    let geometry = country.geometry;
    let coordinates = [];

    if (geometry.type === 'Polygon') {
      coordinates = geometry.coordinates;
    } else if (geometry.type === 'MultiPolygon') {
      coordinates = geometry.coordinates.flat();
    }

    let countryPolygons = [];
    for (let j = 0; j < coordinates.length; j++) {
      let coords = coordinates[j];
      let vertices = [];
      for (let k = 0; k < coords.length; k++) {
        let lon = coords[k][0];
        let lat = coords[k][1];
        let x = map(lon, -180, 180, 0, width);
        let y = map(lat, 90, -90, 0, height);
        vertices.push(createVector(x, y));
      }
      countryPolygons.push(vertices);
    }
    countryShapes.push({
      name: countryName,
      polygons: countryPolygons
    });
  }
}

function drawCountries() {
  let isAnyCountryHovered = false;
  // Draw each country on the map
  translate(width / 2 - width / 2, height / 2 - height / 2); // Center the map
  for (let i = 0; i < countryShapes.length; i++) {
    let country = countryShapes[i];
    let isSelected = selectedCountries.includes(country.name);
    let isHovered = false;

    // Check if mouse is over the country
    for (let j = 0; j < country.polygons.length; j++) {
      let vertices = country.polygons[j];
      if (collidePointPoly(mouseX, mouseY, vertices)) {
        isHovered = true;
        isAnyCountryHovered = true;
      }
    }

    // Draw the country polygons
    for (let j = 0; j < country.polygons.length; j++) {
      let vertices = country.polygons[j];
      if (isSelected) {
        fill('#A3C858'); // Fresh Green for selected countries
      } else {
        fill('#E0E0E0'); // Light gray for unselected countries
      }
      stroke(0);
      if (isHovered) {
        strokeWeight(2); // Thicker outline when hovered
      } else {
        strokeWeight(1);
      }
      beginShape();
      for (let k = 0; k < vertices.length; k++) {
        vertex(vertices[k].x, vertices[k].y);
      }
      endShape(CLOSE);
    }

    // Display country name when hovered
    if (isHovered) {
      tooltip.html(`<span style="color:black;">${country.name}</span>`);
      tooltip.style('left', mouseX + 'px');
      tooltip.style('top', (mouseY - 40) + 'px');
      tooltip.show();
    }
  }

  if (!isAnyCountryHovered) {
    tooltip.hide();
  }
}

function mouseClicked() {
  if (state === 'selection') {
    // Handle country selection
    for (let i = 0; i < countryShapes.length; i++) {
      let country = countryShapes[i];
      for (let j = 0; j < country.polygons.length; j++) {
        let vertices = country.polygons[j];
        if (collidePointPoly(mouseX, mouseY, vertices)) {
          let index = selectedCountries.indexOf(country.name);
          if (index === -1) {
            selectedCountries.push(country.name);
          } else {
            selectedCountries.splice(index, 1);
          }
          return;
        }
      }
    }
  }
}

function startWithMap() {
  state = 'selection';
  hideAllContainers();
  select('header').show();
  select('#canvas-container').show();

  // Reset selected countries
  selectedCountries = [];

  // Create 'Next' button
  nextButton = createButton('Next');
  nextButton.parent('canvas-container');
  nextButton.addClass('action-button');
  nextButton.id('next-button');
  nextButton.mousePressed(goToSliders);
}

function startWithPrompt() {
  state = 'vibesInput';
  hideAllContainers();
  select('header').show();
  setupVibesInput();
}

function setupVibesInput() {
  let interfaceContainer = select('#interface-container');
  interfaceContainer.show();
  interfaceContainer.html(''); // Clear any existing content

  vibesInputLabel = createDiv('Describe what kind of food you want right now:');
  vibesInputLabel.parent(interfaceContainer);
  vibesInputLabel.style('font-weight', '600');

  vibesInput = createInput('');
  vibesInput.parent(interfaceContainer);
  vibesInput.style('width', '100%');

  // Next button
  nextButton = createButton('Next');
  nextButton.parent(interfaceContainer);
  nextButton.addClass('action-button');
  nextButton.mousePressed(goToSlidersFromVibes);
}

function goToAccount() {
  state = 'account';
  hideAllContainers();
  select('header').show();

  let interfaceContainer = select('#interface-container');
  interfaceContainer.show();
  interfaceContainer.html(''); // Clear any existing content

  let title = createDiv('User Settings');
  title.parent(interfaceContainer);
  title.style('font-size', '24px');
  title.style('font-weight', 'bold');

  // Create topics and variables
  let topics = {
    'Preferences': ['people', 'time', 'difficulty', 'ingredientsAmount', 'budget', 'generalHealth', 'dietaryRestrictions', 'ingredientsAtHome'],
    'Nutritional Goals': ['protein', 'carb', 'fat']
  };

  let variableNames = {
    'people': 'Number of People Slider',
    'time': 'Cooking Time Slider',
    'difficulty': 'Difficulty Slider',
    'ingredientsAmount': 'Ingredients Amount Slider',
    'protein': 'Protein Slider',
    'carb': 'Carbohydrates Slider',
    'fat': 'Fat Slider',
    'budget': 'Budget Slider',
    'generalHealth': 'General Health Slider',
    'dietaryRestrictions': 'Dietary Restrictions',
    'ingredientsAtHome': 'Ingredients at Home'
  };

  for (let topic in topics) {
    let topicDiv = createDiv(topic);
    topicDiv.parent(interfaceContainer);
    topicDiv.style('font-size', '20px');
    topicDiv.style('font-weight', 'bold');
    topicDiv.style('margin-top', '20px');

    let variables = topics[topic];

    for (let i = 0; i < variables.length; i++) {
      let varKey = variables[i];
      let varName = variableNames[varKey];

      let varContainer = createDiv();
      varContainer.parent(interfaceContainer);
      varContainer.addClass('variable-container');

      let varLabel = createSpan(varName);
      varLabel.parent(varContainer);
      varLabel.addClass('variable-name');
      if (accountSettings.variables[varKey]) {
        varLabel.addClass('included');
      } else {
        varLabel.addClass('excluded');
      }

      let toggleButton = createButton(accountSettings.variables[varKey] ? 'Exclude' : 'Include');
      toggleButton.parent(varContainer);
      toggleButton.addClass('toggle-button');

      toggleButton.mousePressed(() => {
        accountSettings.variables[varKey] = !accountSettings.variables[varKey];
        if (accountSettings.variables[varKey]) {
          varLabel.removeClass('excluded');
          varLabel.addClass('included');
          toggleButton.html('Exclude');
        } else {
          varLabel.removeClass('included');
          varLabel.addClass('excluded');
          toggleButton.html('Include');
        }
        saveUserData();
      });
    }
  }
}

function goToSliders() {
  if (selectedCountries.length === 0) {
    alert('Please select at least one country.');
    return;
  }
  state = 'sliders';
  select('#canvas-container').hide();
  nextButton.hide();
  setupSliders();
}

function goToSlidersFromVibes() {
  if (vibesInput.value().trim() === '') {
    alert('Please enter a description.');
    return;
  }
  state = 'sliders';
  select('#interface-container').hide();
  setupSliders();
}

function setupSliders() {
  // Hide the map and clear canvas
  clear();
  background(255);

  // Create a container for the interface elements
  let interfaceContainer = select('#interface-container');
  interfaceContainer.show();
  interfaceContainer.html(''); // Clear any existing content

  // Centered container
  let slidersContainer = createDiv();
  slidersContainer.parent(interfaceContainer);
  slidersContainer.style('max-width', '600px');
  slidersContainer.style('margin', '0 auto');

  if (accountSettings.variables.people) {
    let peopleContainer = createDiv();
    peopleContainer.parent(slidersContainer);
    peopleContainer.addClass('input-container');

    peopleLabel = createSpan('Number of people eating: 4');
    peopleLabel.parent(peopleContainer);
    peopleLabel.style('font-weight', '600');

    peopleSlider = createSlider(1, 20, 4, 1);
    peopleSlider.parent(peopleContainer);
    peopleSlider.style('width', '100%');
    peopleSlider.input(updateLabels);
  }

  if (accountSettings.variables.time) {
    let timeContainer = createDiv();
    timeContainer.parent(slidersContainer);
    timeContainer.addClass('input-container');

    timeLabel = createSpan('Cooking time (minutes): 60');
    timeLabel.parent(timeContainer);
    timeLabel.style('font-weight', '600');

    timeSlider = createSlider(10, 240, 60, 10);
    timeSlider.parent(timeContainer);
    timeSlider.style('width', '100%');
    timeSlider.input(updateLabels);
  }

  if (accountSettings.variables.difficulty) {
    let difficultyContainer = createDiv();
    difficultyContainer.parent(slidersContainer);
    difficultyContainer.addClass('input-container');

    difficultyLabel = createSpan('Difficulty level: Medium');
    difficultyLabel.parent(difficultyContainer);
    difficultyLabel.style('font-weight', '600');

    difficultySlider = createSlider(1, 5, 3, 1);
    difficultySlider.parent(difficultyContainer);
    difficultySlider.style('width', '100%');
    difficultySlider.input(updateLabels);
  }

  if (accountSettings.variables.ingredientsAmount) {
    let ingredientsContainer = createDiv();
    ingredientsContainer.parent(slidersContainer);
    ingredientsContainer.addClass('input-container');

    ingredientsLabel = createSpan('Ingredients amount: Medium');
    ingredientsLabel.parent(ingredientsContainer);
    ingredientsLabel.style('font-weight', '600');

    ingredientsSlider = createSlider(1, 5, 3, 1);
    ingredientsSlider.parent(ingredientsContainer);
    ingredientsSlider.style('width', '100%');
    ingredientsSlider.input(updateLabels);
  }

  if (accountSettings.variables.protein) {
    let proteinContainer = createDiv();
    proteinContainer.parent(slidersContainer);
    proteinContainer.addClass('input-container');

    proteinLabel = createSpan('Protein Content: Medium');
    proteinLabel.parent(proteinContainer);
    proteinLabel.style('font-weight', '600');

    proteinSlider = createSlider(1, 5, 3, 1);
    proteinSlider.parent(proteinContainer);
    proteinSlider.style('width', '100%');
    proteinSlider.input(updateLabels);
  }

  if (accountSettings.variables.carb) {
    let carbContainer = createDiv();
    carbContainer.parent(slidersContainer);
    carbContainer.addClass('input-container');

    carbLabel = createSpan('Carbohydrates Content: Medium');
    carbLabel.parent(carbContainer);
    carbLabel.style('font-weight', '600');

    carbSlider = createSlider(1, 5, 3, 1);
    carbSlider.parent(carbContainer);
    carbSlider.style('width', '100%');
    carbSlider.input(updateLabels);
  }

  if (accountSettings.variables.fat) {
    let fatContainer = createDiv();
    fatContainer.parent(slidersContainer);
    fatContainer.addClass('input-container');

    fatLabel = createSpan('Fat Content: Medium');
    fatLabel.parent(fatContainer);
    fatLabel.style('font-weight', '600');

    fatSlider = createSlider(1, 5, 3, 1);
    fatSlider.parent(fatContainer);
    fatSlider.style('width', '100%');
    fatSlider.input(updateLabels);
  }

  if (accountSettings.variables.budget) {
    let budgetContainer = createDiv();
    budgetContainer.parent(slidersContainer);
    budgetContainer.addClass('input-container');

    budgetLabel = createSpan('Budget: Medium');
    budgetLabel.parent(budgetContainer);
    budgetLabel.style('font-weight', '600');

    budgetSlider = createSlider(1, 5, 3, 1);
    budgetSlider.parent(budgetContainer);
    budgetSlider.style('width', '100%');
    budgetSlider.input(updateLabels);
  }

  if (accountSettings.variables.generalHealth) {
    let healthContainer = createDiv();
    healthContainer.parent(slidersContainer);
    healthContainer.addClass('input-container');

    healthLabel = createSpan('General Health: Moderate');
    healthLabel.parent(healthContainer);
    healthLabel.style('font-weight', '600');

    healthSlider = createSlider(1, 5, 3, 1);
    healthSlider.parent(healthContainer);
    healthSlider.style('width', '100%');
    healthSlider.input(updateLabels);
  }

  if (accountSettings.variables.dietaryRestrictions) {
    // Dietary Restrictions
    let dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Halal', 'Kosher'];
    let dietaryLabel = createDiv('Select dietary restrictions:');
    dietaryLabel.parent(slidersContainer);
    dietaryLabel.style('font-weight', '600');

    let dietaryButtonContainer = createDiv();
    dietaryButtonContainer.parent(slidersContainer);
    dietaryButtonContainer.addClass('dietary-buttons');
    dietaryButtonContainer.style('text-align', 'center');

    for (let i = 0; i < dietaryOptions.length; i++) {
      let btn = createButton(dietaryOptions[i]);
      btn.addClass('diet-button');
      btn.parent(dietaryButtonContainer);
      if (accountSettings.dietaryRestrictions.includes(dietaryOptions[i])) {
        btn.addClass('active');
      }
      btn.mousePressed(() => toggleDietaryRestriction(dietaryOptions[i], btn));
      dietaryButtons.push(btn);
    }
  }

  if (accountSettings.variables.ingredientsAtHome) {
    // Ingredients Input
    ingredientsInputLabel = createDiv('Ingredients you have at home (separated by commas):');
    ingredientsInputLabel.parent(slidersContainer);
    ingredientsInputLabel.style('font-weight', '600');

    ingredientsInput = createInput('');
    ingredientsInput.parent(slidersContainer);
    ingredientsInput.style('width', '100%');
  }

  // Get Inspired by Favorites
  if (favorites.length > 0) {
    let favoritesLabel = createDiv('Get Inspired by Favorites:');
    favoritesLabel.parent(slidersContainer);
    favoritesLabel.style('font-weight', '600');

    let inspireButton = createButton('Inspire Me');
    inspireButton.parent(slidersContainer);
    inspireButton.addClass('diet-button');
    if (accountSettings.inspiredByFavorites) {
      inspireButton.addClass('active');
    }
    inspireButton.mousePressed(() => {
      accountSettings.inspiredByFavorites = !accountSettings.inspiredByFavorites;
      if (accountSettings.inspiredByFavorites) {
        inspireButton.addClass('active');
      } else {
        inspireButton.removeClass('active');
      }
      saveUserData();
    });
  }

  // Generate Recipe Button
  generateButton = createButton('Generate Recipe');
  generateButton.parent(interfaceContainer);
  generateButton.addClass('action-button');
  generateButton.mousePressed(() => generateRecipe());
}

function updateLabels() {
  // Update labels based on slider values
  let levels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
  let difficultyLevels = ['Really Easy', 'Easy', 'Medium', 'Hard', 'Really Hard'];
  let ingredientsLevels = ['Very Few', 'Few', 'Medium', 'Many', 'A Lot'];
  let healthLevels = ['Very Unhealthy', 'Unhealthy', 'Moderate', 'Healthy', 'Very Healthy'];

  if (accountSettings.variables.people && peopleSlider) {
    peopleLabel.html('Number of people eating: ' + peopleSlider.value());
  }
  if (accountSettings.variables.time && timeSlider) {
    timeLabel.html('Cooking time (minutes): ' + timeSlider.value() + ' minutes');
  }
  if (accountSettings.variables.difficulty && difficultySlider) {
    let difficultyIndex = difficultySlider.value() - 1;
    difficultyLabel.html('Difficulty level: ' + difficultyLevels[difficultyIndex]);
  }
  if (accountSettings.variables.ingredientsAmount && ingredientsSlider) {
    let ingredientsIndex = ingredientsSlider.value() - 1;
    ingredientsLabel.html('Ingredients amount: ' + ingredientsLevels[ingredientsIndex]);
  }
  if (accountSettings.variables.protein && proteinSlider) {
    let proteinIndex = proteinSlider.value() - 1;
    proteinLabel.html('Protein Content: ' + levels[proteinIndex]);
  }
  if (accountSettings.variables.carb && carbSlider) {
    let carbIndex = carbSlider.value() - 1;
    carbLabel.html('Carbohydrates Content: ' + levels[carbIndex]);
  }
  if (accountSettings.variables.fat && fatSlider) {
    let fatIndex = fatSlider.value() - 1;
    fatLabel.html('Fat Content: ' + levels[fatIndex]);
  }
  if (accountSettings.variables.budget && budgetSlider) {
    let budgetIndex = budgetSlider.value() - 1;
    budgetLabel.html('Budget: ' + levels[budgetIndex]);
  }
  if (accountSettings.variables.generalHealth && healthSlider) {
    let healthIndex = healthSlider.value() - 1;
    healthLabel.html('General Health: ' + healthLevels[healthIndex]);
  }
}

function toggleDietaryRestriction(option, button) {
  let index = accountSettings.dietaryRestrictions.indexOf(option);
  if (index === -1) {
    accountSettings.dietaryRestrictions.push(option);
    button.addClass('active');
  } else {
    accountSettings.dietaryRestrictions.splice(index, 1);
    button.removeClass('active');
  }
  saveUserData();
}

function generateRecipe() {
  // Collect data and create the prompt
  let prompt = '';

  if (state === 'sliders' && selectedCountries.length > 0) {
    let selectedCountriesList = selectedCountries.join(', ');
    prompt = `Generate a recipe for dinner that creates a local dish from the selected country or when multiple countries are selected creates a combination of local dishes; ${selectedCountriesList}.`;
  } else if (state === 'sliders' && vibesInput) {
    let vibesDescription = vibesInput.value();
    prompt = `Generate a recipe that matches the following description: "${vibesDescription}".`;
  }

  // Include variables based on account settings

  // If inspired by favorites, include the summaries
  if (accountSettings.inspiredByFavorites && favoriteSummaries.length > 0) {
    let summaries = favoriteSummaries.join(' ');
    prompt += ` The recipe should be inspired by the following: ${summaries}.`;
  }

  // Difficulty
  if (accountSettings.variables.difficulty && difficultySlider) {
    let difficultyLevels = ['Really Easy', 'Easy', 'Medium', 'Hard', 'Really Hard'];
    let difficulty = difficultyLevels[difficultySlider.value() - 1];
    prompt += ` The recipe should have a ${difficulty} difficulty to make.`;
  }

  // Number of people
  if (accountSettings.variables.people && peopleSlider) {
    let people = peopleSlider.value();
    prompt += ` It should be suitable for ${people} people.`;
  }

  // Cooking time
  if (accountSettings.variables.time && timeSlider) {
    let time = timeSlider.value();
    prompt += ` It should take around ${time} minutes to prepare and cook.`;
  }

  // Ingredients amount
  if (accountSettings.variables.ingredientsAmount && ingredientsSlider) {
    let ingredientsLevels = ['Very Few', 'Few', 'Medium', 'Many', 'A Lot'];
    let ingredientsAmount = ingredientsLevels[ingredientsSlider.value() - 1];
    prompt += ` It should use ${ingredientsAmount} different ingredients.`;
  }

  // Protein content
  if (accountSettings.variables.protein && proteinSlider) {
    let levels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
    let proteinContent = levels[proteinSlider.value() - 1];
    prompt += ` The recipe should be ${proteinContent} in protein.`;
  }

  // Carbohydrates content
  if (accountSettings.variables.carb && carbSlider) {
    let levels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
    let carbContent = levels[carbSlider.value() - 1];
    prompt += ` The recipe should be ${carbContent} in carbohydrates.`;
  }

  // Fat content
  if (accountSettings.variables.fat && fatSlider) {
    let levels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
    let fatContent = levels[fatSlider.value() - 1];
    prompt += ` The recipe should be ${fatContent} in fat.`;
  }

  // Budget
  if (accountSettings.variables.budget && budgetSlider) {
    let budgetLevels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
    let budget = budgetLevels[budgetSlider.value() - 1];
    prompt += ` The recipe should have a ${budget} budget.`;
  }

  // General Health
  if (accountSettings.variables.generalHealth && healthSlider) {
    let healthLevels = ['Very Unhealthy', 'Unhealthy', 'Moderate', 'Healthy', 'Very Healthy'];
    let health = healthLevels[healthSlider.value() - 1];
    prompt += ` The recipe should be ${health} healthy.`;
  }

  if (accountSettings.variables.dietaryRestrictions) {
    let dietaryList = accountSettings.dietaryRestrictions.join(', ') || 'No restrictions';
    prompt += ` It should adhere to the following dietary restrictions: ${dietaryList}.`;
  }

  if (accountSettings.variables.ingredientsAtHome && ingredientsInput) {
    let ingredients = ingredientsInput.value() || 'Any ingredients';
    prompt += ` Please incorporate the following ingredients that I have at home. If there is nothing filled in after this sentence, ignore this part of the task: ${ingredients}.`;
  }

  // Include user tools information
  let missingTools = userTools.filter(tool => !accountSettings.availableTools.includes(tool));
  if (missingTools.length > 0) {
    prompt += ` The user does not have the following tools: ${missingTools.join(', ')}. Adjust the recipe accordingly.`;
  }

  // Add metric measurements
  prompt += ` Use European metric units (grams, liters) for measurements. Do not use imperial units.`;

  // Save the prompt for display
  lastPrompt = prompt;

  // Show loading indicator
  showLoadingIndicator();

  // Send the prompt to the AI model
  getRecipeFromAI(prompt);
}

function showLoadingIndicator() {
  loadingDiv = createDiv('Generating your recipe, please wait...');
  loadingDiv.parent('interface-container');
  loadingDiv.id('loading-indicator');
}

function hideLoadingIndicator() {
  if (loadingDiv) {
    loadingDiv.remove();
  }
}

function getRecipeFromAI(prompt) {
  let api_key = ""; // Replace with your actual API key
  let model_name = "hermes-2-pro-llama-3-8b";
  let api_url = "https://data.id.tue.nl/v1/chat/completions";

  fetch(api_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + api_key
    },
    body: JSON.stringify({
      "model": model_name,
      "messages": [{
        "role": "user",
        "content": prompt
      }],
      "temperature": 0.7,
      "max_tokens": 500
    }),
  })
  .then((response) => response.json())
  .then((json) => {
    hideLoadingIndicator();
    let recipe = json.choices[0].message.content.trim();
    // Ensure the new recipe is different if re-trying
    if (recipe === lastRecipe) {
      generateRecipe(); // Re-generate if same
    } else {
      lastRecipe = recipe;
      displayRecipe(recipe);
    }
  })
  .catch((error) => {
    hideLoadingIndicator();
    console.error('Error:', error);
    alert('An error occurred while generating the recipe.');
  });
}

function displayRecipe(recipe) {
  state = 'result';

  // Hide interface elements
  select('#interface-container').hide();

  // Display the recipe in the recipe container
  let recipeContainer = select('#recipe-container');
  recipeContainer.show();
  recipeContainer.html(''); // Clear any existing content

  // Recipe content
  let recipeContent = createDiv();
  recipeContent.parent(recipeContainer);
  recipeContent.id('recipe-content');

  // Create buttons container
  let buttonsContainer = createDiv();
  buttonsContainer.parent(recipeContent);
  buttonsContainer.addClass('buttons-container');

  // Create a reset button
  resetButton = createButton('Back to Home');
  resetButton.parent(buttonsContainer);
  resetButton.addClass('action-button');
  resetButton.mousePressed(() => {
    recipeContainer.hide();
    select('#main-menu-container').show();
    state = 'mainMenu';
    // Reset variables
    selectedCountries = [];
    dietaryRestrictions = [];
    vibesInput = null;
  });

  // Create Re-try button
  let retryButton = createButton('Re-try');
  retryButton.parent(buttonsContainer);
  retryButton.addClass('action-button');
  retryButton.mousePressed(() => {
    showLoadingIndicator();
    generateRecipe();
  });

  // Create Save and Print buttons
  let saveButton = createButton('Save Recipe');
  saveButton.parent(buttonsContainer);
  saveButton.addClass('action-button');
  saveButton.mousePressed(() => {
    saveRecipe(recipe);
  });

  let printButton = createButton('Print Recipe');
  printButton.parent(buttonsContainer);
  printButton.addClass('action-button');
  printButton.mousePressed(() => {
    printRecipe(recipe);
  });

  // Create Favorite button
  let favoriteButton = createButton('Add to Favorites');
  favoriteButton.parent(buttonsContainer);
  favoriteButton.addClass('action-button');
  favoriteButton.mousePressed(() => {
    askFavoriteReason(recipe);
  });

  // Create Modify Recipe button
  let modifyButton = createButton('Modify Recipe');
  modifyButton.parent(buttonsContainer);
  modifyButton.addClass('action-button');
  modifyButton.mousePressed(() => {
    modifyRecipe(recipe);
  });

  // Display the recipe
  recipeDiv = createDiv(recipe);
  recipeDiv.parent(recipeContent);
  recipeDiv.style('width', '100%');
  recipeDiv.style('margin', '20px auto');
  recipeDiv.style('font-size', '18px');
  recipeDiv.style('white-space', 'pre-wrap');

  // Always display the prompt used
  let promptDiv = createDiv('Prompt used:');
  promptDiv.parent(recipeContent);
  promptDiv.style('margin-top', '20px');
  promptDiv.style('font-weight', 'bold');

  let promptContent = createDiv(lastPrompt);
  promptContent.parent(recipeContent);
  promptContent.style('white-space', 'pre-wrap');
  promptContent.style('background-color', '#f0f0f0');
  promptContent.style('padding', '10px');
  promptContent.style('border-radius', '5px');
}

function modifyRecipe(recipe) {
  let modifications = prompt('Enter the ingredients you want to remove or substitute (e.g., "I don\'t have chicken, replace it with tofu").');
  if (modifications) {
    // Create a new prompt to adjust the recipe
    let prompt = `Modify the following recipe to accommodate these changes: ${modifications}. Here is the original recipe: ${recipe}`;
    lastPrompt = prompt; // Save for display
    showLoadingIndicator();
    getRecipeFromAI(prompt);
  }
}

function saveRecipe(recipe) {
  let blob = new Blob([recipe], { type: 'text/plain' });
  let url = URL.createObjectURL(blob);
  let a = createA(url, 'recipe.txt');
  a.attribute('download', 'recipe.txt');
  a.style('display', 'none');
  document.body.appendChild(a.elt);
  a.elt.click();
  document.body.removeChild(a.elt);
  URL.revokeObjectURL(url);
}

function printRecipe(recipe) {
  let printWindow = window.open('', '', 'height=600,width=800');
  printWindow.document.write('<html><head><title>Print Recipe</title>');
  printWindow.document.write('</head><body >');
  printWindow.document.write('<pre>' + recipe + '</pre>');
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();
}

function askFavoriteReason(recipe) {
  let reason = prompt('What did you like about this recipe?');
  if (reason) {
    addToFavorites(recipe, reason);
    alert('Recipe added to favorites!');
  } else {
    alert('Recipe not added to favorites.');
  }
}

function addToFavorites(recipe, reason) {
  if (favorites.length >= 10) {
    alert('You have reached the maximum number of favorites.');
    return;
  }

  favorites.push(recipe);

  // Generate a summary
  let prompt = `Summarize the most important aspects of this recipe in a few sentences: ${recipe}. The user liked it because: ${reason}`;
  getSummaryFromAI(prompt);
}

function getSummaryFromAI(prompt) {
  let api_key = "df-VVBiWkZYMEdoQWNaMTRBdzMyRUtvYVNabldJMlFscVpKbmlMbjhwTTVuOD0="; // Replace with your actual API key
  let model_name = "hermes-2-pro-llama-3-8b";
  let api_url = "https://data.id.tue.nl/v1/chat/completions";

  fetch(api_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + api_key
    },
    body: JSON.stringify({
      "model": model_name,
      "messages": [{
        "role": "user",
        "content": prompt
      }],
      "temperature": 0.7,
      "max_tokens": 100
    }),
  })
  .then((response) => response.json())
  .then((json) => {
    let summary = json.choices[0].message.content.trim();
    favoriteSummaries.push(summary);
  })
  .catch((error) => {
    console.error('Error:', error);
    alert('An error occurred while generating the summary.');
  });
}

function showFavorites() {
  state = 'favorites';
  hideAllContainers();
  select('header').show();

  let favoritesContainer = select('#favorites-container');
  favoritesContainer.show();
  favoritesContainer.html(''); // Clear previous content

  let title = createDiv('Your Favorite Recipes');
  title.parent(favoritesContainer);
  title.style('font-size', '24px');
  title.style('font-weight', 'bold');
  title.style('text-align', 'center');

  if (favorites.length === 0) {
    let message = createDiv('You have no favorite recipes yet.');
    message.parent(favoritesContainer);
  } else {
    for (let i = 0; i < favorites.length; i++) {
      let recipeDiv = createDiv();
      recipeDiv.parent(favoritesContainer);
      recipeDiv.addClass('favorite-recipe');

      let recipeTitle = createElement('h3', 'Recipe ' + (i + 1));
      recipeTitle.parent(recipeDiv);

      let recipeContent = createDiv(favorites[i]);
      recipeContent.parent(recipeDiv);
      recipeContent.style('white-space', 'pre-wrap');

      let removeButton = createButton('Remove from Favorites');
      removeButton.parent(recipeDiv);
      removeButton.addClass('action-button');
      removeButton.mousePressed(() => {
        favorites.splice(i, 1);
        favoriteSummaries.splice(i, 1);
        saveUserData();
        showFavorites(); // Refresh the favorites list
      });
    }
  }
}

function showUserInfo() {
  state = 'userInfo';
  hideAllContainers();
  select('header').show();

  let userInfoContainer = select('#user-info-container');
  userInfoContainer.show();
  userInfoContainer.html(''); // Clear previous content

  let title = createDiv('User Information');
  title.parent(userInfoContainer);
  title.style('font-size', '24px');
  title.style('font-weight', 'bold');
  title.style('text-align', 'center');

  // User Favorites Information Button
  let favoritesInfoButton = createButton('Favorites Information');
  favoritesInfoButton.parent(userInfoContainer);
  favoritesInfoButton.addClass('action-button');
  favoritesInfoButton.style('margin', '20px auto');
  favoritesInfoButton.mousePressed(showFavoritesInformation);

  // User Tools Button
  let userToolsButton = createButton('User Tools');
  userToolsButton.parent(userInfoContainer);
  userToolsButton.addClass('action-button');
  userToolsButton.style('margin', '20px auto');
  userToolsButton.mousePressed(showUserTools);
}

function showFavoritesInformation() {
  let userInfoContainer = select('#user-info-container');
  userInfoContainer.html(''); // Clear previous content

  let title = createDiv('Favorites Information');
  title.parent(userInfoContainer);
  title.style('font-size', '24px');
  title.style('font-weight', 'bold');
  title.style('text-align', 'center');

  if (favoriteSummaries.length === 0) {
    let message = createDiv('You have no favorite summaries yet.');
    message.parent(userInfoContainer);
  } else {
    for (let i = 0; i < favoriteSummaries.length; i++) {
      let summaryDiv = createDiv();
      summaryDiv.parent(userInfoContainer);
      summaryDiv.addClass('favorite-recipe');

      let summaryTitle = createElement('h3', 'Summary ' + (i + 1));
      summaryTitle.parent(summaryDiv);

      let summaryContent = createDiv(favoriteSummaries[i]);
      summaryContent.parent(summaryDiv);
      summaryContent.style('white-space', 'pre-wrap');
    }
  }

  // Back button
  let backButton = createButton('Back');
  backButton.parent(userInfoContainer);
  backButton.addClass('action-button');
  backButton.mousePressed(showUserInfo);
}

function showUserTools() {
  let userInfoContainer = select('#user-info-container');
  userInfoContainer.html(''); // Clear previous content

  let title = createDiv('User Tools');
  title.parent(userInfoContainer);
  title.style('font-size', '24px');
  title.style('font-weight', 'bold');
  title.style('text-align', 'center');

  let toolsContainer = createDiv();
  toolsContainer.parent(userInfoContainer);
  toolsContainer.style('text-align', 'center');

  for (let i = 0; i < userTools.length; i++) {
    let tool = userTools[i];
    let btn = createButton(tool);
    btn.parent(toolsContainer);
    btn.addClass('diet-button');
    if (accountSettings.availableTools.includes(tool)) {
      btn.addClass('active');
    }
    btn.mousePressed(() => {
      if (accountSettings.availableTools.includes(tool)) {
        accountSettings.availableTools.splice(accountSettings.availableTools.indexOf(tool), 1);
        btn.removeClass('active');
      } else {
        accountSettings.availableTools.push(tool);
        btn.addClass('active');
      }
      saveUserData();
    });
  }

  // Back button
  let backButton = createButton('Back');
  backButton.parent(userInfoContainer);
  backButton.addClass('action-button');
  backButton.mousePressed(showUserInfo);
}

function setupLoginScreen() {
  hideAllContainers();
  select('#login-container').show();

  let loginButton = select('#login-button');
  let createAccountButton = select('#create-account-button');
  let usernameInput = select('#username-input');
  let passwordInput = select('#password-input');

  loginButton.mousePressed(() => {
    let username = usernameInput.value();
    let password = passwordInput.value();
    if (users[username] && users[username].password === password) {
      currentUser = username;
      loadUserData();
      goToMainMenu();
    } else {
      alert('Incorrect username or password.');
    }
  });

  createAccountButton.mousePressed(() => {
    let username = usernameInput.value();
    let password = passwordInput.value();
    if (!username || !password) {
      alert('Please enter a username and password.');
      return;
    }
    if (users[username]) {
      alert('Username already exists.');
    } else {
      users[username] = {
        password: password,
        settings: JSON.parse(JSON.stringify(accountSettings)),
        favorites: [],
        favoriteSummaries: []
      };
      currentUser = username;
      saveUserData();
      goToMainMenu();
    }
  });
}

function goToMainMenu() {
  state = 'mainMenu';
  hideAllContainers();
  select('header').show();
  select('#main-menu-container').show();
}

function saveUserData() {
  if (currentUser && users[currentUser]) {
    users[currentUser].settings = accountSettings;
    users[currentUser].favorites = favorites;
    users[currentUser].favoriteSummaries = favoriteSummaries;
  }
}

function loadUserData() {
  if (currentUser && users[currentUser]) {
    accountSettings = users[currentUser].settings;
    favorites = users[currentUser].favorites;
    favoriteSummaries = users[currentUser].favoriteSummaries;
  }
}
