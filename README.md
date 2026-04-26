# 🖥️ P23-UT2-Gestio-avan-ada-LDAP

## Gestió avançada d’usuaris amb LDAP i monitoratge del sistema

---

## 📌 Contextualització

> 🏢 **Escenari**
>
> L’empresa *DataCore360* està desplegant un sistema LDAP i necessita ampliar-lo amb funcionalitats avançades: gestió d’usuaris, equips, perfils mòbils i monitoratge.

---

## 🎯 Objectius

* Gestionar equips i usuaris LDAP
* Simular perfils mòbils
* Monitorar el servei slapd
* Automatitzar comprovacions
* Aplicar polítiques de seguretat

---

# 🧩 ACTIVITATS

---

## 🧪 Activitat 1 — Comptes d’equip en LDAP

### 🎯 Objectiu

Crear equips dins LDAP com a objectes del tipus `device`.

---

Per començar, cal crear manualment un fitxer en format **LDIF**, que defineixi l’entrada LDAP de l’equip. Aquest fitxer descriu l’objecte amb el seu `dn`, classes i atributs:

```ldif
dn: cn=pc-aula1,ou=equips,dc=lafita,dc=local
objectClass: device
objectClass: top
cn: pc-aula1
description: Ordinador de l’aula 1
```

Un cop creat el fitxer, s’ha d’importar al servidor LDAP utilitzant la comanda `ldapadd`, autenticant-se com a administrador:

```bash
ldapadd -x -D "cn=admin,dc=lafita,dc=local" -W -f equip1.ldif
```

Després de la inserció, és important comprovar que l’equip s’ha registrat correctament. Això es pot fer mitjançant una cerca específica:

```bash
ldapsearch -x cn=pc-aula1
```

Finalment, per consolidar el procediment, es repeteix tot el procés amb un segon equip (per exemple, `pc-biblioteca`), assegurant que es domina la creació d’entrades.

> 💡 **Clau:** LDAP pot representar dispositius com a recursos dins de l’arbre, no només usuaris.

---

## 👥 Activitat 2 — Usuaris i grups especials

### 🎯 Objectiu

Identificar els comptes interns i estructures bàsiques d’un servidor LDAP.

---

El primer pas consisteix a fer una consulta global de l’arbre LDAP per veure totes les entrades disponibles:

```bash
ldapsearch -x -b "dc=lafita,dc=local"
```

A partir d’aquesta informació, s’han de localitzar manualment alguns comptes especials habituals com:

* `cn=admin`
* `cn=users`
* `cn=groups`

Un cop identificats, és necessari investigar el significat de cadascun, especialment el compte administrador (`cn=admin`), que controla l’accés i la configuració del directori.

Per consolidar aquesta anàlisi, es construeix una taula resum que reculli la funció de cada element i si pot ser modificat dins del sistema.

> 💡 **Clau:** LDAP està organitzat jeràrquicament, com un arbre de directoris.

---

## 🌐 Activitat 3 — Perfils mòbils

### 🎯 Objectiu

Simular perfils d’usuari accessibles des de qualsevol màquina.

---

Abans de configurar res, cal entendre què és un **perfil mòbil**: un entorn d’usuari emmagatzemat en un servidor remot que permet mantenir la configuració independentment del dispositiu.

Amb aquest concepte clar, es crea un nou usuari LDAP amb un atribut clau: `homeDirectory`, que apunta a una ruta remota:

```ldif
dn: uid=alumne3,ou=alumnat,dc=lafita,dc=local
objectClass: inetOrgPerson
uid: alumne3
cn: Anna
sn: Martí
userPassword: alumne3
homeDirectory: /home/remot/alumne3
loginShell: /bin/bash
```

Aquest usuari s’afegeix al directori amb `ldapadd` i es verifica la seva creació amb `ldapsearch`.

Un cop validat, cal reflexionar sobre el funcionament real del sistema: aquest directori `/home/remot` hauria d’estar allotjat en un servidor (per exemple, via NFS o Samba), permetent que l’usuari accedeixi sempre al mateix entorn.

> 💡 **Clau:** els perfils mòbils aporten **mobilitat, centralització i coherència**.

---

## 📊 Activitat 4 — Monitoratge del servei slapd

### 🎯 Objectiu

Supervisar l’estat i comportament del servei LDAP.

---

El monitoratge comença comprovant si el servei està actiu:

```bash
systemctl status slapd
```

A continuació, es revisen les connexions de xarxa associades al servei per confirmar que escolta en els ports correctes:

```bash
netstat -tulnp | grep slapd
```

Per observar el consum de recursos i l’activitat en temps real, es pot utilitzar una eina interactiva com:

```bash
htop
```

Finalment, és fonamental consultar els logs del sistema per detectar possibles errors o anomalies:

```bash
journalctl -u slapd
```

Aquest conjunt d’eines permet tenir una visió completa de l’estat del servei.

> 💡 **Clau:** monitorar no és només mirar, sinó **interpretar el comportament del sistema**.

---

## ⚠️ Activitat 5 — Proves de fallades i resolució

### 🎯 Objectiu

Aprendre a detectar i interpretar errors habituals.

---

Per començar, es simula una fallada crítica aturant el servei LDAP:

```bash
sudo systemctl stop slapd
```

Amb el servei aturat, qualsevol consulta com `ldapsearch` fallarà, evidenciant un problema de connexió. Aquest error es resol simplement tornant a activar el servei:

```bash
sudo systemctl start slapd
```

En una segona prova, es modifica un fitxer `.ldif` eliminant un atribut obligatori com `uid`. En intentar afegir aquest usuari, el sistema retornarà un error d’esquema, indicant que la definició és incorrecta.

Aquest exercici ajuda a entendre dues categories d’errors:

* Problemes de servei (no actiu)
* Problemes d’estructura (LDIF incorrecte)

> 💡 **Clau:** saber interpretar errors és essencial per administrar sistemes.

---

## 🤖 Activitat 6 — Automatització bàsica

### 🎯 Objectiu

Automatitzar la comprovació del funcionament de LDAP.

---

Per evitar comprovacions manuals repetitives, es crea un script en bash que verifiqui tant l’estat del servei com la resposta del directori:

```bash
#!/bin/bash

echo "Comprovant servei slapd..."
systemctl is-active slapd

echo "Comprovant LDAP..."
ldapsearch -x -LLL -b "dc=lafita,dc=local" uid=alumne1 | grep uid:
```

Després de crear-lo, cal donar-li permisos d’execució (`chmod +x`) i executar-lo per validar-ne el funcionament.

La interpretació del resultat és clau: el servei ha d’estar actiu i la cerca LDAP ha de retornar dades.

> 💡 **Clau:** automatitzar redueix errors i millora l’eficiència.

---

## 🔐 Activitat 7 — Restricció horària amb PAM

### 🎯 Objectiu

Aplicar una política de control d’accés basada en horaris.

---

Primer, es crea un usuari LDAP de prova (per exemple `usuari_limited`). A continuació, es defineix una restricció editant el fitxer:

```bash
/etc/security/time.conf
```

Afegint una línia com:

```text
login;*;usuari_limited;W0800-1000
```

Aquesta configuració permet l’accés només els dimecres entre les 08:00 i les 10:00.

Perquè aquesta política sigui efectiva, cal activar el mòdul corresponent en PAM editant:

```bash
/etc/pam.d/sshd
```

I afegint:

```text
account required pam_time.so
```

Un cop configurat, es realitza una prova intentant accedir fora de l’horari permès. Si es vol simular el comportament, es pot modificar temporalment l’hora del sistema.

Finalment, cal documentar el procés i reflexionar sobre l’ús real d’aquest tipus de control (entorns educatius, empreses, seguretat).

> 💡 **Clau:** PAM permet aplicar polítiques de seguretat **sense modificar LDAP directament**.

---

# 🧠 Conclusió

El flux real de totes les activitats segueix aquest patró:

```text
Configurar → Executar → Verificar → Analitzar → Automatitzar
```

---

