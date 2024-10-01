// Initialize the map when the page loads
async function initMap() {
    const placeId = getPlaceIdFromURL();
    console.log("Place ID:", placeId);

    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
    const { Place, SearchNearbyRankPreference } = await google.maps.importLibrary("places");
    const { Map } = await google.maps.importLibrary("maps");

    // Create a new map instance, centered on central Atlanta by default
    const map = new Map(document.getElementById("map"), {
        center: { lat: 33.749, lng: -84.388 }, // Central Atlanta coordinates
        zoom: 14,
        mapId: "d2f899a8ee72c782",
    });

    // Fetch place details
    let place = new Place({
        id: placeId,
    });

    await place.fetchFields({
        fields: [
            "displayName",
            "location",
            "rating",
            "primaryTypeDisplayName",
            "editorialSummary",
            "regularOpeningHours",
            "reviews",
            "formattedAddress",
        ],
    });

    place = place.toJSON();

    console.log(place);

    // Update the HTML with restaurant details
    document.getElementById("restaurant-name").textContent = place.displayName;
    document.getElementById("restaurant-address").textContent = place.formattedAddress;

    // Center the map on the restaurant's location
    map.setCenter(place.location);

    // Add a marker for the restaurant's location
    new AdvancedMarkerElement({
        map: map,
        position: place.location,
        title: place.displayName,
    });

    displayGoogleReviews(place.reviews);
}

// Get the place ID from the URL
function getPlaceIdFromURL() {
    const path = window.location.pathname; // Get the current URL path
    const segments = path.split("/"); // Split the path by '/'
    return segments[segments.length - 2]; // Return the second-to-last segment as the placeId
}

function displayGoogleReviews(reviews) {
    const reviewsSection = document.getElementById("reviews-section"); // Get the reviews section container
    // reviewsSection.innerHTML = ""; // Clear any existing content

    if (reviews && reviews.length > 0) {
        reviews.forEach((review) => {
            // Create a new div for each review
            const reviewElement = document.createElement("div");
            reviewElement.classList.add("review", "border", "p-3", "mb-3"); // Add necessary classes for styling
            reviewElement.innerHTML = `
                <p><strong>${review.authorAttribution.displayName} (via Google)</strong> rated it ${review.rating}/5</p>
                <p>${review.text}</p>
                <small>Reviewed on ${new Date(review.publishTime).toLocaleDateString()}</small>
            `; // Populate the review details (author, rating, comment, date)
            reviewsSection.appendChild(reviewElement); // Append the review to the reviews section
        });
    } else {
        // reviewsSection.innerHTML = "<p>No reviews found.</p>"; // Display message if no reviews are available
    }
}

window.addEventListener("DOMContentLoaded", (event) => {
    // starting stuff
    initMap();
});
