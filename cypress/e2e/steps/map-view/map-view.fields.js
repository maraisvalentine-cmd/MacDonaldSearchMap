// Leaflet n'accepte pas d'attribut data-* sur la carte ni sur les marqueurs : on les cible
// sous le conteneur data-testid=map.
export const FIELDS = {
    'Carte': '[data-testid=map] .leaflet-container',
    'Marqueur de restaurant': '[data-testid=map] .leaflet-marker-icon',
    'Nom du restaurant dans la popup': '[data-testid=popup-name]',
    'Bouton Choisir': '[data-testid=popup-choose]',
};
