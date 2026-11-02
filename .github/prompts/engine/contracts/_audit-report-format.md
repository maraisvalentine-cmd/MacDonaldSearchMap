# Format du rapport d'audit `pipeline/audit-report.md`

## Rôle

Le rapport d'audit est généré par l'agent `audit-coverage`. Il croise :
1. Les YAML Spring Cloud Config (source des champs)
2. Les `config.ts` (callbacks dynamiques)
3. Les fichiers `.feature` générés par les 2 agents Gherkin

Et émet une matrice champ × type de scénario × prompt source pour détecter :
- **GAPS** : champ ou comportement non couvert
- **DUPLICATES** : couvert par plusieurs prompts (risque de divergence)
- **OK** : couverture validée

---

## Structure du rapport

```markdown
# Rapport d'audit de couverture — [Produit]

**Date** : 2026-05-01 14:32
**Produit** : todo-app
**Pipeline run** : 2026-05-01_143200
**Commit** : 80fc3e7521c

---

## Synthèse

| Catégorie | Nombre | Status |
|---|---:|:---:|
| Champs YAML totaux | 124 | — |
| Champs couverts | 118 | ✅ |
| Champs non couverts | 6 | ⚠️ |
| Doublons inter-prompts | 0 | ✅ |
| customComponent référencés | 5 | — |
| customComponent couverts (custom prompt) | 4 | ⚠️ |
| Callbacks config.ts détectés | 8 | — |
| Callbacks couverts | 6 | ⚠️ |
| Scénarios `[INTERACTION & API CONTRACT]` | 12 | ✅ (≥ 1 par étape) |
| dataTypes utilisés | 9 | — |
| dataTypes avec scénario [INTERACTION — SAVE] | 7 | ⚠️ (manque DATE, IBAN) |

**Score global** : 87/100 (3 gaps bloquants, 6 warnings)

---

## Matrice de couverture par champ

| Champ (technicalName) | dataType | Étape | YAML feature | Custom feature | Render | Fixture | Status |
|---|---|---|---|---|---|---|---|
| task_amount | NUMBER | task-form | ✅ form-conditions | — | input[type=number] | preprod-1 | ✅ |
| task_title | TEXT | task-form | ✅ form-conditions | — | input[type=text] | preprod-1 | ✅ |
| task_due_date | DROPDOWN | task-form | ✅ form-conditions | — | app-date-picker | — | ✅ |
| task_priority | MULTIPLE_CHOICES | offre | ✅ form-conditions | — | app-select | — | ✅ |
| incorrect_info_btn | CUSTOM | info-entreprise | ✅ form-conditions (visibilité) | ✅ company-information (logique modale) | IncorrectInfoButton | — | ✅ HYBRIDE |
| add_remove_contacts | CUSTOM | bénéficiaires | ✅ form-conditions (visibilité) | ❌ MANQUANT | AddOrRemoveContacts | — | ⚠️ GAP |
| task_start_date | DATE | task-form | ✅ form-conditions | — | input[type=date] | preprod-1 | ⚠️ pas de [INTERACTION — SAVE] |

---

## GAPS détectés

### GAP 1 — customComponent non couvert par le prompt custom

- **Champ** : `add_remove_contacts`
- **Type** : `dataType: CUSTOM` + `customComponent: AddOrRemoveContactsComponent`
- **Couverture YAML** : ✅ visibilité + sauvegarde
- **Couverture custom** : ❌ aucun `.feature` ne mentionne `AddOrRemoveContactsComponent`
- **Action recommandée** : générer un `.feature` couvrant la logique interne (ajout/suppression de contact, validation des doublons, état vide)
- **Prompt à relancer** : `generate_gherkin_custom_components`

### GAP 2 — Callback `externalValueCallback` sans scénario WIRING

- **Callback** : `isNeoBank` dans `config.ts` ligne 142
- **Champ source** : `iban_PROJECT_HOLDER`
- **Couverture** : aucun scénario `[INTERACTION — EXTERNAL_VALUE WIRING]` détecté
- **Action recommandée** : générer le scénario manquant
- **Prompt à relancer** : `l'adapter source (extract)` (Groupe 7)

### GAP 3 — dataType DATE sans scénario `[INTERACTION — SAVE]`

- **dataType** : `DATE`
- **Champs concernés** : `task_start_date`, `task_created_at`
- **Couverture** : visibilité OK, sauvegarde absente (pas de scénario qui vérifie le PUT après saisie d'une date)
- **Risque** : conversion jj/mm/aaaa → aaaa-mm-jj non testée → régression silencieuse possible
- **Action recommandée** : ajouter scénario `[INTERACTION — SAVE]` pour DATE
- **Prompt à relancer** : `l'adapter source (extract)` (Groupe 7.1)

---

## WARNINGS (non bloquants)

### WARNING 1 — META_DATA non audité

3 règles `consequenceType: META_DATA` détectées dans `bel-products.yaml` mais aucun scénario `[META_DATA — CONTENU]` généré. Vérifier si elles modifient un contenu visible.

### WARNING 2 — Fixture preprod manquante

Le scénario `features/save-fields.feature:42` référence `cypress/fixtures/projectEnvCustom.json` mais le fichier n'existe pas. Une fixture synthétique a été utilisée à la place.

---

## DUPLICATES (à vérifier)

Aucun doublon détecté.

> Format si doublon présent :
> ### DUPLICATE 1 — `incorrect_info_btn` couvert dans 2 prompts
> - YAML feature : `form-conditions-todo-app.feature:142` (visibilité)
> - Custom feature : `shared/company-information.feature:88` (modale)
> - **Statut** : ✅ HYBRIDE LÉGITIME (visibilité côté YAML, logique modale côté custom — démarcation respectée)
> - **Action** : aucune (cas hybride attendu)

---

## Couverture par groupe de scénarios `[XXX]`

| Groupe | Nombre attendu | Nombre généré | Status |
|---|---:|---:|:---:|
| `[NOMINAL]` | 124 (1 par champ avec règle) | 124 | ✅ |
| `[NOMINAL — CONTENU]` | 18 (tooltips conditionnels) | 18 | ✅ |
| `[META_DATA — CONTENU]` | 3 | 0 | ⚠️ |
| `[CONSTRAINTS]` | 0 | 0 | ✅ |
| `[RÉVERSIBILITÉ]` | 124 | 124 | ✅ |
| `[CONDITION AND]` | 12 (groupId partagés) | 12 | ✅ |
| `[CONDITION OR]` | 8 (règles distinctes) | 8 | ✅ |
| `[CASCADE]` | 4 chaînes | 4 | ✅ |
| `[NAVIGATION]` | 8 patterns standards | 8 | ✅ |
| `[NAVIGATION — ÉTAPE MASQUÉE]` | 2 (callbacks `hidden`) | 2 | ✅ |
| `[INTERACTION — SAVE]` | 9 (1 par dataType) | 7 | ⚠️ |
| `[INTERACTION — VALIDATION CUSTOM]` | 2 (customValidationServices) | 2 | ✅ |
| `[INTERACTION — SUBMIT]` | 7 (étapes) | 7 | ✅ |
| `[INTERACTION — UPLOAD]` | 0 (pas de FILE) | 0 | ✅ |
| `[INTERACTION — SAVE ERROR]` | 7 (étapes) | 7 | ✅ |
| `[INTERACTION — EXTERNAL_VALUE WIRING]` | 1 (externalValueCallback) | 0 | ⚠️ |

---

## Diff vs run précédent (depuis `pipeline/coverage-history.json`)

| Métrique | Run précédent (2026-04-25) | Run actuel | Delta |
|---|---:|---:|:---:|
| Champs couverts | 115 | 118 | +3 |
| Score global | 81/100 | 87/100 | +6 |
| GAPS | 6 | 3 | -3 |

**Régression détectée ?** Non.

---

## Prochaines actions recommandées (par priorité)

1. **[P0]** Générer le `.feature` manquant pour `AddOrRemoveContactsComponent` (custom prompt)
2. **[P0]** Ajouter le scénario `[INTERACTION — EXTERNAL_VALUE WIRING]` pour `isNeoBank`
3. **[P1]** Ajouter scénario `[INTERACTION — SAVE]` pour dataType DATE et IBAN
4. **[P2]** Vérifier les 3 règles META_DATA et générer les scénarios `[META_DATA — CONTENU]` correspondants
5. **[P2]** Demander la fixture preprod manquante : `projectEnvCustom.json`
```

---

## Format historique `pipeline/coverage-history.json`

```json
{
  "history": [
    {
      "timestamp": "2026-04-25T10:23:00Z",
      "commit": "ca8d03bbc71",
      "produit": "todo-app",
      "metrics": {
        "fields_total": 124,
        "fields_covered": 115,
        "score": 81,
        "gaps_count": 6,
        "duplicates_count": 0
      }
    },
    {
      "timestamp": "2026-05-01T14:32:00Z",
      "commit": "80fc3e7521c",
      "produit": "todo-app",
      "metrics": {
        "fields_total": 124,
        "fields_covered": 118,
        "score": 87,
        "gaps_count": 3,
        "duplicates_count": 0
      }
    }
  ]
}
```

---

## Codes status (colonne `Status`)

| Code | Sens |
|---|---|
| ✅ | Couverture complète, aucune action requise |
| ⚠️ | Warning : couverture partielle ou métadonnée manquante |
| ❌ | Gap bloquant : action requise |
| ✅ HYBRIDE | Couvert par 2 prompts de manière légitime (cas `customComponent`) |
| ⚠️ DUPLICATE | Couvert par 2 prompts mais hors cas hybride (à investiguer) |
| ⏭ | Hors périmètre (ex: feature flag désactivé) |
