// Initialize the map when the page loads
function initMap() {
    const placeId = getPlaceIdFromURL();  // Get the place ID dynamically from the URL (or hardcoded)

    // Create a new map instance, centered on central Atlanta by default
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 33.7490, lng: -84.3880 }, // Central Atlanta coordinates
        zoom: 14,
    });

    const service = new google.maps.places.PlacesService(map);

    // Fetch place details 
    service.getDetails(
        {
            placeId: placeId,  
            fields: ["name", "formatted_address", "geometry"],  // Fetch required fields
        },
        (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                // Update the HTML with restaurant details
                document.getElementById("restaurant-name").textContent = place.name;
                document.getElementById("restaurant-address").textContent = place.formatted_address;

                // Center the map on the restaurant's location
                map.setCenter(place.geometry.location);

                // Add a marker for the restaurant's location
                new google.maps.Marker({
                    map: map,
                    position: place.geometry.location,
                    title: place.name,
                });
            } else {
                console.error('Error fetching place details:', status);
            }
        }
    );
}

// Get the place ID from the URL
function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('placeId') || 'ChIJN5Nz71W3j4ARhx5bwpTQEGg';  // Default Place ID if none is provided
}
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('favorite-form');
    form.addEventListener('submit', function (event) {
        event.preventDefault(); 

        // Placeholder for the backend request
        alert('Restaurant added to favorites!'); 

    });
});
