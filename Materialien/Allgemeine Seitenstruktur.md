# Allgemeine Seitenstruktur für Rosa-KI

Folge dieser HTML-Formatvorlage, wenn du neue Seiten erstellst:<br/>

´´´html
<!DOCTYPE html>
<html>
<head>
    <title>Rosa-KI</title>
    <meta charset="utf-8" />
    <meta name="author" content="IN_GK_5" />
    <meta name="keywords" content="KI Rosa RLG Rosa-Luxemburg-Gymnasium Leander Kafemann" />

    <link rel="stylesheet" href="https://leanderkafemann.github.io/Rosa-KI/styling/main.css" />
    <link rel="stylesheet" href="styling/menu.css" />
    <link rel="icon" href="images/favicon.png" />
</head>
<body>
    <header>
        <div class="menu-toggle">☰ Menu</div>
        <ul class="menu">
            <li class="menu-item"><a href="#home">Start</a></li>
            <li class="menu-item has-submenu">
                Spiele
                <ul class="submenu">
                    <li class="menu-item"><a href="https://leanderkafemann.github.io/Rosa-KI/TTT/">TicTacToe</a></li>
                    <li class="menu-item"><a href="https://leanderkafemann.github.io/Rosa-KI/js/rotateBlock">RotateBlock</a></li>
                </ul>
            </li>
            <li class="menu-item"><a href="#about">Über uns</a></li>
            <li class="menu-item"><a href="#kontakt">Kontakt</a></li>
        </ul>
    </header>

    <script type="text/javascript" src="js/menu.js"></script>
</body>
</html>
´´´