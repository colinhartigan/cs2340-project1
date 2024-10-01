// Initialize the map when the page loads
function initMap() {
    const placeId = getPlaceIdFromURL();  
    console.log('Place ID:', placeId);

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
            fields: ["name", "formatted_address", "geometry", "reviews"],  // Fetch required fields
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

                displayGoogleReviews(place.reviews);
            } else {
                console.error('Error fetching place details:', status);
            }
        }
    );
}

// Get the place ID from the URL
function getPlaceIdFromURL() {
    const path = window.location.pathname;  // Get the current URL path
    const segments = path.split('/');  // Split the path by '/'
    return segments[segments.length - 2];  // Return the second-to-last segment as the placeId
}

function displayGoogleReviews(reviews) {
    const reviewsSection = document.getElementById('reviews-section');  // Get the reviews section container
    reviewsSection.innerHTML = '';  // Clear any existing content

    if (reviews && reviews.length > 0) {
        reviews.forEach((review) => {
            // Create a new div for each review
            const reviewElement = document.createElement('div');
            reviewElement.classList.add('review', 'border', 'p-3', 'mb-3');  // Add necessary classes for styling
            reviewElement.innerHTML = `
                <p><strong>${review.author_name}</strong> rated it ${review.rating}/5</p>
                <p>${review.text}</p>
                <small>Reviewed on ${new Date(review.time * 1000).toLocaleDateString()}</small>
            `;  // Populate the review details (author, rating, comment, date)
            reviewsSection.appendChild(reviewElement);  // Append the review to the reviews section
        });
    } else {
        reviewsSection.innerHTML = '<p>No reviews found.</p>';  // Display message if no reviews are available
    }
}

