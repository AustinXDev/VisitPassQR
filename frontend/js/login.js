document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  const identifierInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  const togglePwBtn = document.getElementById("toggle-pw");
  togglePwBtn?.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    togglePwBtn.textContent = isPassword ? "hide" : "show";
  });

  loginBtn?.addEventListener("click", async (e) => {
    e.preventDefault();

    const identifier = identifierInput.value.trim();
    const password = passwordInput.value;

    if (!identifier || !password) {
      VisitPassAlert.show(
        "Missing Fields",
        "Please enter both your username and password.",
        "error",
      );
      return;
    }

    try {
      const response = await fetch("/VisitPassQR/backend/index.php/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        VisitPassAlert.show(
          "Welcome Back!",
          "Login Successful. Redirecting...",
          "success",
        );
        setTimeout(() => {
          window.location.href = "/VisitPassQR/Visitordash";
        }, 2000);
      } else {
        VisitPassAlert.show(
          "Login Failed",
          data.error || "Invalid credentials.",
          "error",
        );
      }
    } catch (err) {
      console.error("Login request network error:", err);
      VisitPassAlert.show(
        "Network Error",
        "Unable to reach login service.",
        "error",
      );
    }
  });
});
