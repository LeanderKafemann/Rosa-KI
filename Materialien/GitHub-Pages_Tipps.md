# Tipps zum Umgang mit GitHub Pages
## Generelles
Nach jedem Commit, also jeder Änderung, die ein beliebiger, bearbeitungsberechtigter Nutzer durchführt, wird ein Deployment über GitHub ausgelöst.<br/>
Dies kann einige Minuten dauern, danach ist die über GitHub gehostete Seite aktuell.<br/>
Die Hauptseite findet ihr unter [Haputseite](https://leanderkafemann.github.io/Rosa-KI/)

Neue Seiten fügt ihr hinzu, indem ihr einen neuen Ordner erstellt,<br/>
was bei GitHub geht, indem man beim Erstellen einer neuen Datei im Pfad mit <code>/</code> einen neuen Ordner integriert,<br/>
und in diesem Ordner <code>html</code>-Dateien anlegt.<br/>
Wenn die Datei dabei <code>index.html</code> heißt, wird von GitHub automatisch auf sie verwiesen, wenn in der URL euer Ordner aufgerufen wird, <br/>
index.html ist dann nicht mehr für die URL notwendig.

Beispiel:
Du willst eine neue Unterseite .../Rosa-KI/Abc/ erstellen.<br/>
Dafür erstellst du zunächst die Datei <code>Abc/index.html</code>, in die du den Inhalt der gewünschten Seite schreibst.<br/>
Tipp: In einer anderen MD-Datei habe ich erläutert, wie man Menüstrukturen umsetzen kann und bereits CSS und JS dafür entwickelt.<br/>
Sobald du Commit changes anklickst, wird die auf GitHub gehostete Seite aktualisiert und nach einigen Minuten solltest du deine Änderungen sehen.

Tipp:<br/>
Änderst du <code>CSS</code> oder ähnliche eingebundene Resourcen, kann es sein, dass dein Browser diese cachet, also zwischenspeichert, sodass deine Änderungen nicht sofort angezeigt werden.<br/>
In diesem Fall genügt es, den Cache zu löschen.