window.QUADERN_DADES = {
  projectId: 'ldap-gestio-avancada-v6',
  title: 'Gestió avançada d’usuaris amb LDAP',
  subtitle: 'Quadern digital interactiu',
  activities: [
    { title:'Comptes d’equip en LDAP', objective:'Crear equips dins LDAP com a objectes del tipus device.', steps:[
      {id:'1.1', title:'Preparació de la unitat organitzativa', evidence:'text', prompt:'Comprova que existeix la unitat organitzativa on s’ubicaran els equips i descriu breument on s’inseriran dins l’arbre LDAP.', tasks:['Identifica el DN base del directori.','Localitza o crea l’OU d’equips si cal.','Anota el criteri de nomenclatura dels equips.'], note:'La coherència del DN és clau per evitar errors d’importació.'},
      {id:'1.2', title:'Creació i importació del fitxer LDIF', evidence:'both', prompt:'Crea un fitxer LDIF per a un equip i importa’l amb ldapadd. Afegeix una captura del resultat o de la verificació.', codeLang:'ldif', code:'dn: cn=pc-aula1,ou=equips,dc=lafita,dc=local\nobjectClass: device\nobjectClass: top\ncn: pc-aula1\ndescription: Ordinador de l’aula 1\n\nldapadd -x -D "cn=admin,dc=lafita,dc=local" -W -f equip1.ldif', tasks:['Desa el LDIF amb el nom adequat.','Importa l’entrada al servidor LDAP.','Verifica que no hi ha errors.']},
      {id:'1.3', allowMultipleImages:true, title:'Verificació i repetició amb un segon equip', evidence:'both', prompt:'Verifica el primer equip amb ldapsearch i repeteix el procés amb un segon equip, per exemple pc-biblioteca.', codeLang:'bash', code:'ldapsearch -x cn=pc-aula1', tasks:['Executa la cerca LDAP.','Crea un segon dispositiu.','Compara els resultats obtinguts.']}
    ]},
    { title:'Usuaris i grups especials', objective:'Identificar comptes interns i estructures bàsiques del servidor LDAP.', steps:[
      {id:'2.1', title:'Consulta global de l’arbre LDAP', evidence:'both', prompt:'Fes una consulta global de l’arbre LDAP i identifica les entrades principals.', codeLang:'bash', code:'ldapsearch -x -b "dc=lafita,dc=local"', tasks:['Executa la consulta.','Localitza cn=admin, cn=users i cn=groups.','Afegeix captura si és útil.']},
      {id:'2.2', title:'Taula resum d’elements especials', evidence:'text', prompt:'Construeix una taula o llista resum amb la funció de cada element i si es pot modificar.', tasks:['Explica cn=admin.','Explica cn=users.','Explica cn=groups.','Indica riscos o precaucions.']}
    ]},
    { title:'Perfils mòbils', objective:'Simular perfils d’usuari accessibles des de qualsevol màquina.', steps:[
      {id:'3.1', title:'Creació d’un usuari amb homeDirectory remot', evidence:'both', prompt:'Crea un usuari LDAP amb un homeDirectory remot i documenta el procés.', codeLang:'ldif', code:'dn: uid=alumne3,ou=alumnat,dc=lafita,dc=local\nobjectClass: inetOrgPerson\nuid: alumne3\ncn: Anna\nsn: Martí\nuserPassword: alumne3\nhomeDirectory: /home/remot/alumne3\nloginShell: /bin/bash', tasks:['Crea el fitxer LDIF.','Importa l’usuari.','Verifica la seva existència.']},
      {id:'3.2', title:'Reflexió sobre NFS o Samba', evidence:'text', prompt:'Explica per què el directori remot hauria d’estar allotjat en un servidor i com ajudarien NFS o Samba.', note:'Els perfils mòbils aporten mobilitat, centralització i coherència.'}
    ]},
    { title:'Monitoratge del servei slapd', objective:'Supervisar l’estat i comportament del servei LDAP.', steps:[
      {id:'4.1', allowMultipleImages:true, title:'Estat del servei i ports', evidence:'both', prompt:'Comprova l’estat de slapd i els ports en què escolta. Afegeix una captura si cal.', codeLang:'bash', code:'systemctl status slapd\nnetstat -tulnp | grep slapd', tasks:['Comprova si el servei està actiu.','Identifica els ports LDAP.','Interpreta el resultat.']},
      {id:'4.2', allowMultipleImages:true, title:'Recursos i logs del sistema', evidence:'both', prompt:'Consulta recursos i logs per detectar anomalies o confirmar funcionament correcte.', codeLang:'bash', code:'htop\njournalctl -u slapd', tasks:['Observa consum de recursos.','Consulta logs.','Resumeix incidències o absència d’errors.']}
    ]},
    { title:'Proves de fallades i resolució', objective:'Detectar i interpretar errors habituals.', steps:[
      {id:'5.1', allowMultipleImages:true, title:'Servei aturat i recuperació', evidence:'both', prompt:'Atura el servei slapd, prova una consulta i torna’l a iniciar. Documenta l’error i la resolució.', codeLang:'bash', code:'sudo systemctl stop slapd\nldapsearch -x cn=pc-aula1\nsudo systemctl start slapd', tasks:['Simula la fallada.','Registra l’error.','Aplica la solució.']},
      {id:'5.2', title:'Error d’esquema LDIF', evidence:'text', prompt:'Descriu què passa quan s’elimina un atribut obligatori com uid i interpreta l’error retornat pel sistema.', tasks:['Identifica el tipus d’error.','Diferencia errors de servei i errors d’estructura.']}
    ]},
    { title:'Automatització bàsica', objective:'Automatitzar la comprovació del funcionament de LDAP.', steps:[
      {id:'6.1', title:'Script de comprovació', evidence:'both', prompt:'Crea i executa un script que comprovi el servei slapd i una cerca LDAP.', codeLang:'bash', code:'#!/bin/bash\n\necho "Comprovant servei slapd..."\nsystemctl is-active slapd\n\necho "Comprovant LDAP..."\nldapsearch -x -LLL -b "dc=lafita,dc=local" uid=alumne1 | grep uid:', tasks:['Crea el fitxer.','Dona permisos amb chmod +x.','Executa i interpreta el resultat.']}
    ]},
    { title:'Restricció horària amb PAM', objective:'Aplicar una política de control d’accés basada en horaris.', steps:[
      {id:'7.1', allowMultipleImages:true, title:'Configuració de time.conf i PAM', evidence:'both', prompt:'Configura una restricció horària per a un usuari LDAP de prova i activa pam_time.so.', codeLang:'text', code:'/etc/security/time.conf\nlogin;*;usuari_limited;W0800-1000\n\n/etc/pam.d/sshd\naccount required pam_time.so', tasks:['Crea l’usuari de prova.','Edita time.conf.','Activa el mòdul PAM.']},
      {id:'7.2', title:'Prova i reflexió de seguretat', evidence:'text', prompt:'Explica el resultat de provar l’accés fora de l’horari i reflexiona sobre usos reals en entorns educatius o empresarials.', note:'PAM permet aplicar polítiques de seguretat sense modificar LDAP directament.'}
    ]}
  ]
};
