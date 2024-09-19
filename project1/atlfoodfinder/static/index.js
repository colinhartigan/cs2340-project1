const CENTER_ATL = { lat: 33.7488, lng: -84.3877 };
const CENTER_GT = { lat: 33.77619115100492, lng: -84.39603041769053 };
const FIELDS = [
    "displayName",
    "location",
    "rating",
    "primaryTypeDisplayName",
    "editorialSummary",
    "regularOpeningHours",
];

let map;

async function initMap() {
    const { Place, SearchNearbyRankPreference } = await google.maps.importLibrary("places");
    const { Map } = await google.maps.importLibrary("maps");

    map = new Map(document.getElementById("map"), {
        center: CENTER_GT,
        zoom: 14,
        mapId: "d2f899a8ee72c782",
    });

    const request = {
        // required parameters
        fields: FIELDS,
        locationRestriction: {
            center: CENTER_GT,
            radius: 1000,
        },
        // optional parameters
        includedPrimaryTypes: ["restaurant"],
        rankPreference: SearchNearbyRankPreference.DISTANCE, // or POPULARITY
        language: "en-US",
        region: "us",
    };
    //@ts-ignore
    const { places } = await Place.searchNearby(request);

    if (places.length) {
        processPlaces(places);
    }
}

let markers = [];
async function findPlaces(payload) {
    // import google maps api libraries
    const { Place, SearchNearbyRankPreference } = await google.maps.importLibrary("places");

    const currentCenter = map.getCenter();

    // remove all old markers
    markers.forEach((marker) => marker.setMap(null));

    // clear restaurant list except for the template
    const restaurantList = document.getElementById("restaurant-list");
    while (restaurantList.children.length > 1) {
        restaurantList.removeChild(restaurantList.lastChild);
    }

    // build the request:
    //  - only get certain fields
    //  - only get restaurants
    //  - don't restrict to only open places
    const request = {
        textQuery: payload.query,
        fields: FIELDS,
        includedType: "restaurant",
        locationBias: {
            center: currentCenter,
            radius: payload.maxDistance,
        },
        rankPreference: SearchNearbyRankPreference.RELEVANCE,
        isOpenNow: false,
        language: "en-US",
        minRating: parseFloat(payload.minRating),
        region: "us",
        useStrictTypeFiltering: false,
    };

    const { places } = await Place.searchByText(request);

    if (places.length) {
        processPlaces(places);
    } else {
        console.log("No results");
    }
}

async function processPlaces(places) {
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
    const { LatLngBounds } = await google.maps.importLibrary("core");
    const bounds = new LatLngBounds();

    // for each place, create a marker and a list entry
    places.forEach((place, index) => {
        place = place.toJSON();

        // add marker with corresponding number
        const pin = new PinElement({
            glyph: `${index + 1}`,
            glyphColor: "white",
        });
        const marker = new AdvancedMarkerElement({
            map,
            position: place.location,
            title: `${place.id}:${index}`,
            content: pin.element,
        });
        markers.push(marker);

        // add restaurant entry to restaurant list
        const restaurantList = document.getElementById("restaurant-list");

        // duplicate the template and set the fields
        const template = document.getElementById("restaurant-template");

        // set clone's fields to the place's data
        const clone = template.content.cloneNode(true);
        clone.getElementById("restaurant-root").id = place.id;
        clone.getElementById("restaurant-name").textContent = `${index + 1} - ${place.displayName}`;
        clone.getElementById("restaurant-rating").textContent = `${place.rating}/5`;
        clone.getElementById("restaurant-cuisine").textContent = place.editorialSummary || place.primaryTypeDisplayName;

        // get today's day of the week index where 0 is monday
        const today = new Date().getDay();

        // get the opening hours for today
        let hours = place.regularOpeningHours?.weekdayDescriptions[today];
        // remove stuff before the first colon
        if (hours) {
            hours = hours.substring(hours.indexOf(":") + 1);
            clone.getElementById("restaurant-hours").textContent = hours;
        } else {
            clone.getElementById("restaurant-hours").textContent = "Hours unknown";
        }

        // add event listeners to markers to highlight the corresponding list entry
        // clone.addEventListener("mouseover", () => {
        //     highlightPlace(place.id, index);
        // });

        clone.firstElementChild.addEventListener("mouseenter", () => {
            markers.forEach((marker) => unHighlightPlace(marker));
            highlightPlace(marker, false);
        });

        marker.addEventListener("mouseenter", () => {
            markers.forEach((marker) => unHighlightPlace(marker));
            highlightPlace(marker, true);
        });
        marker.addEventListener("mouseleave", () => {
            markers.forEach((marker) => unHighlightPlace(marker));
        });

        // add the clone to the restaurant list
        restaurantList.appendChild(clone);

        // extend the bounds to include the place
        bounds.extend(place.location);
    });

    // zoom to fit all the restaurants
    map.fitBounds(bounds);
}

async function highlightPlace(marker, autoScroll) {
    const { PinElement } = await google.maps.importLibrary("marker");

    const restaurant = document.getElementById(marker.title.split(":")[0]);
    const index = parseInt(marker.title.split(":")[1]);
    restaurant.classList.add("active");

    marker.content = new PinElement({
        glyph: `${index + 1}`,
        glyphColor: "white",
        scale: 1.5,
    }).element;

    // also scroll to the restaurant in the list
    if (autoScroll) restaurant.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function unHighlightPlace(marker) {
    const { PinElement } = await google.maps.importLibrary("marker");

    const restaurant = document.getElementById(marker.title.split(":")[0]);
    const index = parseInt(marker.title.split(":")[1]);
    try {
        restaurant.classList.remove("active");
    } catch (e) {}

    // also unhighlight the marker
    marker.content = new PinElement({
        glyph: `${index + 1}`,
        glyphColor: "white",
        scale: 1,
    }).element;
}

// starting stuff
initMap();

function initSearch() {
    let dist = document.getElementById("dist-input").value;
    let rating = document.getElementById("rating-input").value;
    let query = document.getElementById("search-input").value;

    if (query == "") {
        query = "food";
    }
    if (dist == 0) {
        dist = 1;
    }
    if (dist > 31) {
        dist = 31;
    }

    const payload = {
        query: query,
        // convert dist from miles to meters
        maxDistance: dist * 1609.34,
        minRating: rating,
    };
    findPlaces(payload);
}

// listen for enter button on the search box then search
window.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("search-input").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            initSearch();
        }
    });
});

// findPlaces("food");
