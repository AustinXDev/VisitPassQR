document.addEventListener("DOMContentLoaded", () => {
  const fnameInput = document.getElementById("fname");
  const lnameInput = document.getElementById("lname");
  const emailInput = document.getElementById("email");
  const unameInput = document.getElementById("uname");
  const passwordInput = document.getElementById("pw");
  const confirmPasswordInput = document.getElementById("cpw");
  const agree = document.getElementById("agree");

  const togglePwBtn = document.getElementById("tpw1");
  togglePwBtn?.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    togglePwBtn.textContent = isPassword ? "hide" : "show";
  });

  const togglePw2Btn = document.getElementById("tpw2");
  togglePw2Btn?.addEventListener("click", () => {
    const isPassword = confirmPasswordInput.type === "password";
    confirmPasswordInput.type = isPassword ? "text" : "password";
    togglePw2Btn.textContent = isPassword ? "hide" : "show";
  });

  const termsBtn = document.getElementById("terms-btn");
  termsBtn.addEventListener("click", () => {
    VisitPassTermsPolicies.show("Terms of Services", "terms");
  });

  const policyBtn = document.getElementById("policy-btn");
  policyBtn.addEventListener("click", () => {
    VisitPassTermsPolicies.show("Privacy Policy", "policy");
  });

  const container = document.getElementById("sbar");
  // Target the internal span elements instead of the container
  const bars = container.querySelectorAll("span");
  const slabel = document.getElementById("slabel");

  function getStrengthScore(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }

  passwordInput.addEventListener("input", (event) => {
    const currentValue = event.target.value;

    if (currentValue) {
      container.classList.remove("hidden");
      container.classList.add("flex", "gap-2");
    } else {
      container.classList.remove("flex", "gap-2");
      container.classList.add("hidden");
      slabel.textContent = "";
      slabel.classList.add("hidden");
      return;
    }

    const score = getStrengthScore(currentValue);

    const strengthConfig = [
      { text: "Weak", colorClass: "bg-red-500", textColor: "text-red-500" },
      {
        text: "Fair",
        colorClass: "bg-orange-500",
        textColor: "text-orange-500",
      },
      { text: "Good", colorClass: "bg-amber-500", textColor: "text-amber-500" },
      {
        text: "Strong",
        colorClass: "bg-green-500",
        textColor: "text-green-500",
      },
    ];
    const currentConfig = strengthConfig[score - 1] || {
      text: "",
      colorClass: "bg-gray-200",
      textColor: "text-gray-400",
    };

    slabel.textContent = currentConfig.text;
    slabel.className = `text-sm font-medium ${currentConfig.textColor}`;

    bars.forEach((bar, index) => {
      bar.classList.remove(
        "bg-red-500",
        "bg-orange-500",
        "bg-amber-500",
        "bg-green-500",
        "bg-gray-200",
      );

      if (index < score) {
        bar.classList.add(currentConfig.colorClass);
      } else {
        bar.classList.add("bg-gray-200");
      }
    });
  });

  const regBtn = document.getElementById("reg-btn");
  regBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const fname = fnameInput.value;
    const lname = lnameInput.value;
    const email = emailInput.value;
    const uname = unameInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const isAgree = agree.checked;

    if (!fname || !lname || !email || !uname || !password || !confirmPassword) {
      VisitPassAlert.show(
        "Missing Fields",
        "Please fill out all fields.",
        "error",
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      VisitPassAlert.show(
        "Invalid Format",
        "Email format is invalid.",
        "error",
      );
      return;
    }

    if (!isAgree) {
      VisitPassAlert.show(
        "Terms and Agreement Required",
        "Please accept the terms and agreement before continuing.",
        "error",
      );
      return;
    }

    if (password !== confirmPassword) {
      VisitPassAlert.show("Password not match", "Please try again.", "error");
      return;
    }

    try {
      const response = await fetch(
        "/VisitPassQR/backend/index.php/api/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fname: fname,
            lname: lname,
            email: email,
            username: uname,
            password: password,
          }),
        },
      );

      const data = await response.json();
      console.log(data);

      if (data.success) {
        VisitPassAlert.show(
          "Success!",
          `${data.message} Redirecting to login...`,
          "success",
        );

        setTimeout(() => {
          window.location.href = "/VisitPassQR/Login";
        }, 2500);
      } else {
        // Trigger your custom animated failure cross modal with the error from PHP
        VisitPassAlert.show(
          "Registration Error",
          data.error || "Failed to create account.",
          "error",
        );
      }
    } catch (err) {
      console.error("Fetch failure:", err);
      VisitPassAlert.show(
        "Network Error",
        "Unable to establish contact with the registration service.",
        "error",
      );
    }
  });
});
