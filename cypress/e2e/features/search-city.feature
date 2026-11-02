# language: fr
# Brouillon dérivé du code (SearchComponent.jsx, useApi.js) : scénarios à valider par un humain.
# TODO(testid): aucun attribut data-* de test dans SearchComponent, sélecteurs de repli (role, type, id react-select).
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
  # selector: form label
  # [NOMINAL]
  Scénario: Le formulaire de recherche est affiché
    Alors je vois le libellé "Rechercher un restaurant"
    Et je vois le champ de recherche de ville
    Et je vois le bouton de recherche

  # composant: SearchComponent
  # étape: search-city
  # champ: search_city_input
  # selector: form input[role=combobox]
  # intercept-required: GET search (featureType=city)
  # [CONDITIONNEL]
  # render: handlePossibilities, c.length > 2 sinon menu fermé
  Scénario: Moins de 3 caractères ne déclenche aucune recherche
    Quand je saisis "Ly" dans le champ de recherche de ville
    Alors aucune suggestion de ville n'est affichée
    Et aucun appel de recherche de ville n'a été émis

  # composant: SearchComponent
  # étape: search-city
  # champ: search_city_input
  # selector: form input[role=combobox]
  # intercept-required: GET search (featureType=city)
  # [CONDITIONNEL]
  # render: handlePossibilities, c.length > 2 déclenche mutateCity
  Scénario: 3 caractères déclenchent la recherche de ville
    Quand je saisis "Lyo" dans le champ de recherche de ville
    Alors un appel de recherche de ville est émis
    Et 2 suggestions de villes sont affichées

  # composant: SearchComponent
  # étape: search-city
  # champ: search_city_option
  # selector: [id^="react-select-"][id*="-option-"]
  # intercept-required: GET search (featureType=city)
  # [LISTE]
  # render: possibleCities = data.map(r => label: r.display_name)
  Scénario: Les suggestions reprennent le nom complet des villes retournées
    Quand je saisis "Lyon" dans le champ de recherche de ville
    Alors la suggestion numéro 1 contient "Lyon, Métropole de Lyon"
    Et la suggestion numéro 2 contient "Lyon, Rhône"

  # composant: SearchComponent
  # étape: search-city
  # champ: search_city_input
  # selector: form input[role=combobox]
  # intercept-required: GET search (featureType=city)
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
  # selector: form input[role=combobox]
  # intercept-required: GET search (featureType=city) en erreur 500
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
  # selector: form button[type=submit]
  # intercept-required: GET search (featureType=city), GET search (amenity=McDonald)
  # [NOMINAL]
  Scénario: Valider une ville lance la recherche de restaurants
    Quand je saisis "Lyon" dans le champ de recherche de ville
    Et je choisis la première suggestion de ville
    Et je valide la recherche
    Alors un appel de recherche de restaurants est émis
    Et 2 marqueurs sont affichés

  # composant: SearchComponent
  # étape: search-city
  # champ: search_city_submit
  # selector: form button[type=submit]
  # [CONDITIONNEL]
  # render: handleSubmit, city.value undefined, exception attrapée par le try
  Scénario: Valider sans ville choisie ne lance aucune recherche
    Quand je valide la recherche
    Alors aucun appel de recherche de restaurants n'a été émis
    Et aucun marqueur n'est affiché
