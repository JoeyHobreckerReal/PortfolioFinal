/********************************************************
*  AI Debate Game
*  Updated to include character sliders and improve debate logic
*********************************************************/

let api_key = "; // Replace with your API key
let model_name = "hermes-2-pro-llama-3-8b";
let api_url = "https://data.id.tue.nl/v1/chat/completions"; // Replace with your API URL

let topicInput, startButton;
let debater1Output, debater2Output;
let voteDebater1Button, voteDebater2Button, resultDiv;
let debaters, messages;
let turn = 0;
let maxTurns = 12; // Each debater speaks six times

// Sliders for character traits
let aliceAggressivenessSlider, alicePolitenessSlider;
let bobAggressivenessSlider, bobPolitenessSlider;

function setup() {
  // No need for canvas
  noCanvas();

  // Select DOM elements
  topicInput = select('#topicInput');
  startButton = select('#startButton');
  debater1Output = select('#debater1Output');
  debater2Output = select('#debater2Output');
  voteDebater1Button = select('#voteDebater1');
  voteDebater2Button = select('#voteDebater2');
  resultDiv = select('#result');

  // Character sliders
  aliceAggressivenessSlider = select('#aliceAggressiveness');
  alicePolitenessSlider = select('#alicePoliteness');
  bobAggressivenessSlider = select('#bobAggressiveness');
  bobPolitenessSlider = select('#bobPoliteness');

  // Update slider values display
  aliceAggressivenessSlider.input(() => {
    select('#aliceAggressivenessValue').html(aliceAggressivenessSlider.value());
  });
  alicePolitenessSlider.input(() => {
    select('#alicePolitenessValue').html(alicePolitenessSlider.value());
  });
  bobAggressivenessSlider.input(() => {
    select('#bobAggressivenessValue').html(bobAggressivenessSlider.value());
  });
  bobPolitenessSlider.input(() => {
    select('#bobPolitenessValue').html(bobPolitenessSlider.value());
  });

  // Attach event listeners
  startButton.mousePressed(startDebate);
  voteDebater1Button.mousePressed(() => voteWinner('Alice'));
  voteDebater2Button.mousePressed(() => voteWinner('Bob'));

  // Initialize debaters
  debaters = [
    {
      name: 'Alice',
      position: 'for',
      systemPrompt: '', // Will be set later based on sliders
      outputDiv: debater1Output,
      votes: 0
    },
    {
      name: 'Bob',
      position: 'against',
      systemPrompt: '', // Will be set later based on sliders
      outputDiv: debater2Output,
      votes: 0
    }
  ];
}

function startDebate() {
  let topic = topicInput.value();
  if (topic.trim() === '') {
    alert('Please enter a debate topic.');
    return;
  }

  // Hide winner section during debate
  select('#winnerSection').style('display', 'none');
  resultDiv.html('');

  // Reset the conversation and output
  messages = [];
  debaters.forEach(debater => {
    debater.outputDiv.html('');
  });

  // Update system prompts based on sliders
  debaters[0].systemPrompt = generateSystemPrompt(
    debaters[0].name,
    debaters[0].position,
    aliceAggressivenessSlider.value(),
    alicePolitenessSlider.value()
  );
  debaters[1].systemPrompt = generateSystemPrompt(
    debaters[1].name,
    debaters[1].position,
    bobAggressivenessSlider.value(),
    bobPolitenessSlider.value()
  );

  // Add initial message from the user with the topic to the conversation
  let initialMessage = {
    role: 'user',
    content: 'The debate topic is: ' + topic
  };

  messages.push(initialMessage);

  debaters.forEach(debater => {
    debater.outputDiv.html('<b>Debate Topic:</b> ' + topic + '<br><br>');
  });

  // Start the debate
  turn = 0;
  debateTurn();
}

function generateSystemPrompt(name, position, aggressiveness, politeness) {
  // Map sliders to descriptions
  let aggressivenessLevel = map(aggressiveness, 1, 10, 0, 1);
  let politenessLevel = map(politeness, 1, 10, 0, 1);

  let aggressivenessDesc = '';
  if (aggressivenessLevel > 0.7) {
    aggressivenessDesc = 'You are very assertive and passionate in your arguments.';
  } else if (aggressivenessLevel > 0.3) {
    aggressivenessDesc = 'You present your arguments confidently.';
  } else {
    aggressivenessDesc = 'You present your arguments calmly.';
  }

  let politenessDesc = '';
  if (politenessLevel > 0.7) {
    politenessDesc = 'You are very polite and respectful.';
  } else if (politenessLevel > 0.3) {
    politenessDesc = 'You are moderately polite.';
  } else {
    politenessDesc = 'You are blunt and direct.';
  }

  let positionDesc = position === 'for' ? 'support' : 'oppose';

  return `You are ${name}, who ${positionDesc} the topic. ${aggressivenessDesc} ${politenessDesc} Always argue in favor of your position. Respond directly to your opponent's last point, and introduce new arguments. Keep responses concise and focused on one point at a time. Do not include your name or any greetings in your response.`;
}

function debateTurn() {
  if (turn >= maxTurns) {
    debaters.forEach(debater => {
      debater.outputDiv.html(debater.outputDiv.html() + '<br><b>Debate concluded.</b>');
    });
    // Show winner selection section
    select('#winnerSection').style('display', 'block');
    return;
  }

  // Determine which debater is speaking
  let debaterIndex = turn % debaters.length;
  let debater = debaters[debaterIndex];

  // Prepare the messages for the API call
  let messagesForAPI = [];

  // Add the system prompt for this debater
  messagesForAPI.push({
    role: 'system',
    content: debater.systemPrompt
  });

  // Include the conversation history
  messagesForAPI = messagesForAPI.concat(messages);

  // Call the API
  callChatAPIDF(messagesForAPI, debater)
    .then((response) => {
      // Add the debater's response to the conversation
      let assistantMessage = {
        role: 'assistant',
        name: debater.name,
        content: response
      };
      messages.push(assistantMessage);

      // Display the debater's response
      debater.outputDiv.html(debater.outputDiv.html() + '<b>' + debater.name + ':</b> ' + response + '<br><br>');

      // Proceed to the next turn
      turn++;

      // Ensure sequential response generation
      debateTurn();
    })
    .catch((error) => {
      console.error('Error during API call:', error);
      debater.outputDiv.html(debater.outputDiv.html() + '<br><b>Error occurred during the debate.</b>');
    });
}

function callChatAPIDF(messagesForAPI, debater) {
  // Use the API key and make an API call for this debater
  return fetch(api_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + api_key
    },
    body: JSON.stringify({
      "model": model_name,
      "messages": messagesForAPI,
      // Remove max_tokens limit or set it higher to prevent response splitting
      "max_tokens": 250
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((json) => {
      // Check content of response
      console.log(json);

      // Get the generated chat response from JSON data
      let chatResponse;
      if (json && json.choices && json.choices.length > 0) {
        chatResponse = json.choices[0].message.content.trim();
      } else if (json && json.text) {
        // Adjust this part based on your API's response format
        chatResponse = json.text.trim();
      } else {
        throw new Error('Unexpected API response format');
      }

      // Remove any leading debater name or extra characters
      chatResponse = chatResponse.replace(/^Alice:\s*/i, '').replace(/^Bob:\s*/i, '');

      return chatResponse;
    });
}

function voteWinner(debaterName) {
  resultDiv.html('You voted for ' + debaterName + ' as the winner!');
}
