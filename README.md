# Quadern digital LDAP · v9.4

Versió amb control d'integritat i traçabilitat del dossier.

## Canvis v9.4

* Identitat doble: alumne original i alumne actual.
* Empremta del dossier basada en projecte, identitat original i data de creació.
* Detecció de discrepància d'autoria amb el missatge: **Autoria no coincident amb l'original**.
* Quadre de control d'integritat a la pàgina de visió general.
* Peu d'impressió amb estat verificat o original/actual si hi ha discrepància.
* Importació JSON preservant sempre la identitat original del dossier.

## Ús

Obre `index.html` en un navegador modern. No cal servidor ni dependències externes.

## v9.5 - política d'evidències visuals

* Les imatges/captures no s'inclouen a l'exportació JSON.
* Les imatges/captures presents en un JSON importat s'eliminen automàticament.
* Les evidències visuals han de romandre al dispositiu original de l'alumne.
* Es manté el control d'integritat i autoria de la v9.4.

## v9.7

Millora quirúrgica de la impressió de galeries d'imatges: separació de 5 mm entre captures, imatges més grans i paginació flexible dels passos sense retallar evidències.

## v9.8

* Ajust quirúrgic d'impressió: evidències visuals en columna única.
* Cada imatge ocupa aproximadament 68 mm d'alçada, prop del 25% de l'espai útil A4.
* Separació entre imatges de 5 mm.
* Els passos poden ocupar més d'una pàgina, però les imatges no es tallen.

