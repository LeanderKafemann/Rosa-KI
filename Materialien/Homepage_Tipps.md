# Homepage - Tipps
## für Menüs

Importiere zunächst in der <code><head></code>-Sektion die nötigen Resourcen wiefolgt:
```html
<link rel="stylesheet" href="https://leanderkafemann.github.io/Rosa-KI/styling/menu.css"/>
<script type="text/javascript" src="https://leanderkafemann.github.io/Rosa-KI/js/menu.js"></script>
```
<br/>
Sodann kannst du mit der folgenden Struktur Menüs aufbauen:
```html
<header>
  <div class="menu-toggle">☰ Menu</div>
  <ul class="menu">

    <li class="menu-item"><a href="#home">Start</a></li>

    <li class="menu-item has-submenu">
      Services
      <ul class="submenu">
        <li class="menu-item"><a href="#svc1">Service 1</a></li>
        <li class="menu-item"><a href="#svc2">Service 2</a></li>
      </ul>
    </li>

    <li class="menu-item"><a href="#about">Über uns</a></li>
    <li class="menu-item"><a href="#kontakt">Kontakt</a></li>

  </ul>
</header>
```
