# language: fr
# Brouillon dérivé du code (SearchComponent.jsx, useApi.js, searchCity) : scénarios à valider par un humain.
Fonctionnalité: Recherche de ville
  Pour centrer la carte sur une ville de France
  En tant qu'utilisateur
  Je recherche une ville à partir de 3 caractères puis je valide

  Contexte:
    Soit les API externes sont simulées
    Et j'ouvre la page d'accueil

  # composant: SearchComponent
  # étape: search-city
  # champ: search_city_label
  # selector: [data-testid=search-label]
  # [NOMINAL]
  Scénario: Le formulaire de recherche est affiché
    Alors je vois le libellé "Rechercher un restaurant"
    Et je vois le champ de recherche de ville
    Et je vois le bouton de recherche

  # composant: SearchComponent
  # étape: search-city
  # champ: search_city_input
  # selector: [data-testid=search-city-select] input[role=combobox]
  # intercept-required: GET communes (nom)
  # [CONDITIONNEL]
  # render: handlePossibilities, c.length > 2 sinon menu fermé
  Scénario: Moins de 3 caractères ne déclenche aucune recherche
    Quand je saisis "Ly" dans le champ de recherche de ville
    Alors aucune suggestion de ville n'est affichée
    Et aucun appel de recherche de ville n'a été émis

  # composant: SearchComponent
  # étape: search-city
  # champ: search_city_input
  # selector: [data-testid=search-city-select] input[role=combobox]
  # intercept-required: GET communes (nom)
  # [CONDITIONNEL]
  # render: handlePossibilities, c.length > 2 déclenche mutateCity
  Scénario: 3 caractères déclenchent la recherche de ville
    Quand je saisis "Lyo" dans le champ de recherche de ville
    Alors un appel de recherche de ville est émis
    Et la recherche de ville porte sur "Lyo"
    Et 2 suggestions de villes sont affichées

  # composant: SearchComponent
  # étape: search-city
  # champ: search_city_option
  # selector: [data-testid=search-city-select] [role=option]
  # intercept-required: GET communes (nom)
  # [LISTE]
  # render: possibleCities = data.map(r => label: r.display_name), libellé commune, département
  Scénario: Les suggestions affichent la commune et son département
    Quand je saisis "Lyon" dans le champ de recherche de ville
    Alors la suggestion numéro 1 contient "Lyon, Rhône"
    Et la suggestion numéro 2 contient "Lyons-la-Forêt, Eure"

  # composant: SearchComponent
  # étape: search-city
  # champ: search_city_input
  # selector: [data-testid=search-city-select] input[role=combobox]
  # intercept-required: GET communes (nom)
  # [CONDITIONNEL]
  # render: menuIsOpen=isMenuOpen, repassé à false sous 3 caractères
  Scénario: Repasser sous 3 caractères ferme les suggestions
    Quand je saisis "Lyo" dans le champ de recherche de ville
    Et un appel de recherche de ville est émis
    Et 2 suggestions de villes sont affichées
    Et je supprime 1 caractères du champ de recherche de ville
    Alors aucune suggestion de ville n'est affichée

  # composant: SearchComponent
  # étape: search-city
  # champ: search_city_input
  # selector: [data-testid=search-city-select] input[role=combobox]
  # intercept-required: GET communes (nom) en erreur 500
  # [CONDITIONNEL]
  # render: onError de mutateCity, le menu n'est pas ouvert
  Scénario: Une erreur de l'API n'affiche aucune suggestion
    Soit l'API de recherche de ville répond une erreur
    Quand je saisis "Lyon" dans le champ de recherche de ville
    Alors un appel de recherche de ville est émis
    Et aucune suggestion de ville n'est affichée

  # composant: SearchComponent
  # étape: search-city
  # champ: search_city_submit
  # selector: [data-testid=search-submit]
  # intercept-required: GET communes (nom), GET search (amenity=McDonald)
  # [NOMINAL]
  Scénario: Valider une ville lance la recherche de restaurants
    Quand je saisis "Lyon" dans le champ de recherche de ville
    Et je choisis la première suggestion de ville
    Et je valide la recherche
    Alors un appel de recherche de restaurants est émis
    Et 2 marqueurs sont affichés

  # composant: SearchComponent, MapView
  # étape: search-city
  # champ: search_city_submit
  # selector: [data-testid=search-submit]
  # intercept-required: GET communes (nom), GET search (amenity=McDonald) avec viewbox
  # [NOMINAL]
  # render: SearchRestaurants lit la zone visible après le recentrage de la carte sur la ville
  Scénario: La recherche de restaurants porte sur la zone de la ville choisie
    Quand je saisis "Lyon" dans le champ de recherche de ville
    Et je choisis la première suggestion de ville
    Et je valide la recherche
    Alors une seule recherche de restaurants a été émise
    Et la zone recherchée contient la latitude 45.7578 et la longitude 4.832

  # composant: SearchComponent
  # étape: search-city
  # champ: search_city_submit
  # selector: [data-testid=search-submit]
  # [CONDITIONNEL]
  # render: handleSubmit, city.value undefined, exception attrapée par le try
  Scénario: Valider sans ville choisie ne lance aucune recherche
    Quand je valide la recherche
    Alors aucun appel de recherche de restaurants n'a été émis
    Et aucun marqueur n'est affiché
