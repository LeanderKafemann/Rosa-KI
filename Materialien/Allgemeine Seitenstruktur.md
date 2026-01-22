# Allgemeine Seitenstruktur für Rosa-KI

Folge dieser HTML-Formatvorlage, wenn du neue Seiten erstellst:<br/>

```html
<!DOCTYPE html>
<html>
<head>
    <title>Rosa-KI</title>
    <meta charset="utf-8" />
    <meta name="author" content="IN_GK_5" />
    <meta name="keywords" content="KI Rosa RLG Rosa-Luxemburg-Gymnasium Leander Kafemann" />

    <link rel="stylesheet" href="https://leanderkafemann.github.io/Rosa-KI/static/styling/main.css" />
    <link rel="stylesheet" href="https://leanderkafemann.github.io/Rosa-KI/static/styling/menu.css" />
    <link rel="stylesheet" href="https://leanderkafemann.github.io/Rosa-KI/static/styling/iFrame.css" />
    <link rel="icon" href="https://leanderkafemann.github.io/Rosa-KI/static/images/favicon.png" />
    <link rel="manifest" href="https://leanderkafemann.github.io/Rosa-KI/static/others/manifest.json" />
</head>
<body>
    <header>
        <div class="menu-toggle">☰ Menu</div>
        <ul class="menu">
            <li class="menu-item"><a href="https://leanderkafemann.github.io/Rosa-KI/">Start</a></li>
            <li class="menu-item has-submenu">
                Spiele
                <ul class="submenu">
                    <li class="menu-item"><a href="https://leanderkafemann.github.io/Rosa-KI/apps/TTT/">TicTacToe</a></li>
                    <li class="menu-item"><a href="https://leanderkafemann.github.io/Rosa-KI/apps/rotateBlock">RotateBlock</a></li>
                </ul>
            </li>
            <li class="menu-item"><a href="#about">Über uns</a></li>
            <li class="menu-item"><a href="#kontakt">Kontakt</a></li>
        </ul>
    </header>

    <script type="text/javascript" src="js/menu.js"></script>
</body>
</html>
```

Wenn du deine Seite mit einem <code>iFrame</code> in diese Struktur einbinden willst, nutze:<br/>

```html
<iframe src="http://URL_HERE.html" onload='javascript:(function(o){o.style.height=o.contentWindow.document.body.scrollHeight+"px";}(this));' style="height:200px;width:100%;border:none;overflow:hidden;"></iframe>
```
sowie die oben bereits eingebundene <code>iFrame.css</code> Datei.<br/>

Bei deinen Seiten selbst ist darauf zu achten, dass der Hintergrund transparent bleibt, damit die Seiten korrekt eingebunden werden können.<br/>

ˋˋˋcss
body {
    background: transparent;
}
ˋˋˋ
