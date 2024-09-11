let results;
let input;
let token;
// Add an initial request body.
let request = {
    input: "",
    locationRestriction: {
        west: -84.3984011117756,
        north: 33.886442267301035,
        east: -84.40338489162572,
        south: 33.64837063341949,
    },
    origin: { lat: 33.7488, lng: 84.3877 },
    includedPrimaryTypes: ["restaurant"],
    language: "en-US",
    region: "us",
};

async function init() {
    const { Place } = await google.maps.importLibrary("places");
    token = new google.maps.places.AutocompleteSessionToken();
    results = document.getElementById("search-results");
    input = document.getElementById("search-input");
    input.addEventListener("input", makeAcRequest);
    request = refreshToken(request);
}

async function makeAcRequest(input) {
    console.log(input);
    // Reset elements and exit if an empty string is received.
    if (input.target.value == "") {
        results.replaceChildren();
        return;
    }

    // Add the latest char sequence to the request.
    request.input = input.target.value;

    // Fetch autocomplete suggestions and show them in a list.
    // @ts-ignore
    const { suggestions } = await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

    // Clear the list first.
    results.replaceChildren();

    for (const suggestion of suggestions) {
        const placePrediction = suggestion.placePrediction;
        console.log(placePrediction);
        // Create a link for the place, add an event handler to fetch the place.
        const a = document.createElement("a");

        a.addEventListener("click", () => {
            onPlaceSelected(placePrediction.toPlace());
        });
        a.innerText = placePrediction.text.toString();

        // Create a new list element.
        const li = document.createElement("li");
        li.setAttribute("class", "list-group-item list-group-item-action");

        li.appendChild(a);
        results.appendChild(li);
    }
}

// Event handler for clicking on a suggested place.
async function onPlaceSelected(place) {
    await place.fetchFields({
        fields: ["displayName", "formattedAddress"],
    });

    let placeText = document.createTextNode(place.displayName);

    results.replaceChildren(placeText);
    input.value = "";
    refreshToken(request);
}

// Helper function to refresh the session token.
async function refreshToken(request) {
    // Create a new session token and add it to the request.
    token = new google.maps.places.AutocompleteSessionToken();
    request.sessionToken = token;
    return request;
}

init();
