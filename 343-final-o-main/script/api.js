// get a random quote from the advice api
// This uses the free Advice Slip API to get random quotes
fetch("https://api.adviceslip.com/advice")
  .then(function(response) {
    // convert response to json
    return response.json();
  })
  .then(function(data) {
    // get the quote text from the data
    var advice = data.slip.advice;
    // show the quote on the page
    document.getElementById("quote").textContent = '"' + advice + '"';
  })
  .catch(function(error) {
    // if it fails, show error message
    document.getElementById("quote").textContent = "Could not load quote.";
    console.error(error);  // log the error for debugging
  }); 