async function initMap() {
    // Request needed libraries.
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    const map = new Map(document.getElementById("map"), {
        center: { lat: 33.7488, lng: -84.3877 },
        zoom: 14,
        mapId: "4504f8b37365c3d0",
    });
    const marker = new AdvancedMarkerElement({
        map,
        position: { lat: 33.7488, lng: -84.3877 },
    });
}

initMap();
