document.addEventListener("DOMContentLoaded", () => {

  // mobile toggle
  const toggleBtn = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".menu");

  if (toggleBtn && menu) {
    toggleBtn.addEventListener("click", () => {
      menu.classList.toggle("active");
    });
  }

  // dropdown menus
  const menuItems = document.querySelectorAll(".menu-item.has-submenu");

  menuItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.stopPropagation();
      item.classList.toggle("open");
    });

    // close gesture for WebKit-based devices
    document.addEventListener("click", () => {
      item.classList.remove("open");
    });
  });

});
