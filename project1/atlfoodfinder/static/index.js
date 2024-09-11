const CENTER = { lat: 33.7488, lng: -84.3877 };

let map;

async function initMap() {
    // Request needed libraries.
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    map = new Map(document.getElementById("map"), {
        center: CENTER,
        zoom: 14,
        mapId: "4504f8b37365c3d0",
    });
}

let markers = [];
async function findPlaces() {
    const { Place } = await google.maps.importLibrary("places");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    // remove all markers
    markers.forEach((marker) => marker.setMap(null));

    const request = {
        textQuery: document.getElementById("search-input").value,
        fields: ["displayName", "location", "businessStatus"],
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
        places.forEach((place) => {
            place = place.toJSON();
            markers.push(
                new AdvancedMarkerElement({
                    map,
                    position: place.location,
                    title: place.displayName,
                })
            );

            bounds.extend(place.location);
        });
        map.fitBounds(bounds);
    } else {
        console.log("No results");
    }
}

initMap();

// listen for enter button on the search box then search
window.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("search-input").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            findPlaces();
        }
    });
});
