class VisitPassTermsPolicies {
  static show(title, type = "terms") {
    const Type = type === "terms";

    const backdrop = document.getElementById(
      Type ? "modal-terms" : "modal-policy",
    );

    const box = document.getElementById(Type ? "terms-box" : "policy-box");

    const titleEl = backdrop.querySelector(".modal-title");
    const messageEl = backdrop.querySelector(".modal-message");

    titleEl.textContent = title;

    backdrop.classList.remove("opacity-0", "pointer-events-none");
    backdrop.classList.add("opacity-100");
    box.classList.remove("scale-90");
    box.classList.add("scale-100", "modal-show");
  }

  static hide(type = "terms") {
    const Type = type === "terms";
    const backdrop = document.getElementById(
      Type ? "modal-terms" : "modal-policy",
    );
    const box = document.getElementById(Type ? "terms-box" : "policy-box");

    backdrop.classList.add("opacity-0", "pointer-events-none");
    backdrop.classList.remove("opacity-100");
    box.classList.add("scale-90");
    box.classList.remove("scale-100", "modal-show");
  }
}
