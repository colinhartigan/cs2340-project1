const CENTER = { lat: 33.7488, lng: -84.3877 };
const BOUNDS = {};

let map;

async function initMap() {
    // Request needed libraries.
    const { Map } = await google.maps.importLibrary("maps");
    map = new Map(document.getElementById("map"), {
        center: CENTER,
        zoom: 14,
        mapId: "4504f8b37365c3d0",
    });
}

let markers = [];
async function findPlaces(query) {
    const { Place } = await google.maps.importLibrary("places");
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

    // remove all markers
    markers.forEach((marker) => marker.setMap(null));

    // clear restaurant list except for the template
    const restaurantList = document.getElementById("restaurant-list");
    while (restaurantList.children.length > 1) {
        restaurantList.removeChild(restaurantList.lastChild);
    }

    const request = {
        textQuery: query,
        fields: [
            "displayName",
            "location",
            "rating",
            "primaryTypeDisplayName",
            "editorialSummary",
            "regularOpeningHours",
        ],
        includedType: "restaurant",
        locationBias: CENTER,
        isOpenNow: false,
        language: "en-US",
        maxResultCount: 30,
        minRating: 3.2,
        region: "us",
        useStrictTypeFiltering: false,
    };

    const { places } = await Place.searchByText(request);

    if (places.length) {
        const { LatLngBounds } = await google.maps.importLibrary("core");
        const bounds = new LatLngBounds();

        // Loop through and get all the results.
        places.forEach((place, index) => {
            place = place.toJSON();

            // add marker
            const pin = new PinElement({
                glyph: `${index + 1}`,
                glyphColor: "white",
            });
            const marker = new AdvancedMarkerElement({
                map,
                position: place.location,
                title: place.id,
                content: pin.element,
            });
            markers.push(marker);

            // add to restaurant list
            const restaurantList = document.getElementById("restaurant-list");

            // duplicate the template and set the fields
            const template = document.getElementById("restaurant-template");

            // set clone's id to the place id
            const clone = template.content.cloneNode(true);
            clone.getElementById("restaurant-root").id = place.id;
            clone.getElementById("restaurant-name").textContent = `${index + 1} - ${place.displayName}`;
            clone.getElementById("restaurant-rating").textContent = `${place.rating}/5`;
            clone.getElementById("restaurant-cuisine").textContent =
                place.editorialSummary || place.primaryTypeDisplayName;

            // get today's day of the week index where 0 is monday
            const today = new Date().getDay();

            // get the opening hours for today
            let hours = place.regularOpeningHours?.weekdayDescriptions[today];
            // remove stuff before the first colon
            if (hours) {
                hours = hours.substring(hours.indexOf(":") + 1);
                clone.getElementById("restaurant-hours").textContent = hours;
            } else {
                clone.getElementById("restaurant-hours").textContent = "";
            }

            clone.addEventListener("mouseover", () => {
                highlightPlace(place.id, index);
            });

            marker.addEventListener("mouseenter", () => {
                highlightPlace(place.id, index);
            });
            marker.addEventListener("mouseleave", () => {
                unHighlightPlace(place.id, index);
            });

            restaurantList.appendChild(clone);

            bounds.extend(place.location);
        });
        map.fitBounds(bounds);
    } else {
        console.log("No results");
    }
}

async function highlightPlace(placeId, index) {
    const { PinElement } = await google.maps.importLibrary("marker");
    const restaurant = document.getElementById(placeId);
    restaurant.classList.add("active");

    // also highlight the marker
    const marker = markers.find((marker) => marker.title === placeId);
    marker.content = new PinElement({
        glyph: `${index + 1}`,
        glyphColor: "white",
        scale: 1.5,
    }).element;
}

async function unHighlightPlace(placeId, index) {
    const { PinElement } = await google.maps.importLibrary("marker");

    const restaurant = document.getElementById(placeId);
    restaurant.classList.remove("active");

    // also unhighlight the marker
    const marker = markers.find((marker) => marker.title === placeId);
    marker.content = new PinElement({
        glyph: `${index + 1}`,
        glyphColor: "white",
        scale: 1,
    }).element;
}

initMap();

// listen for enter button on the search box then search
window.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("search-input").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            findPlaces(document.getElementById("search-input").value);
        }
    });
});

findPlaces("food");
