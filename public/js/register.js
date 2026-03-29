function showError(id, msg) {
    document.getElementById(id).innerText = msg;
}
function clearError(id) {
    document.getElementById(id).innerText = "";
}

// RULE UI
function setRule(id, passed) {
    let el = document.getElementById(id);
    if (passed) {
        el.classList.add("rule-pass");
        el.classList.remove("rule-fail");
        el.innerText = "✓ " + el.innerText.slice(2);
    } else {
        el.classList.add("rule-fail");
        el.classList.remove("rule-pass");
        el.innerText = "✗ " + el.innerText.slice(2);
    }
}

// ================= USERNAME =================
let unameInput = document.getElementById("username");
let unameRules = document.getElementById("uname-rules");

unameInput.addEventListener("focus", () => { unameRules.style.display = "block"; });
unameInput.addEventListener("blur",  () => { if (unameInput.value.trim() === "") unameRules.style.display = "none"; });

unameInput.addEventListener("input", function () {
    let v = this.value;
    setRule("rule-ulen",   v.trim().length > 3);
    setRule("rule-umax",   v.trim().length <= 30);
    setRule("rule-ucase",  /[A-Z]/.test(v));
    setRule("rule-uspace", !/\s/.test(v));

    if (v.trim() === "")        showError("err-uname", "Username is required");
    else if (/\s/.test(v))      showError("err-uname", "No spaces allowed");
    else if (v.trim().length <= 3)  showError("err-uname", "Must be > 3 chars");
    else if (v.trim().length > 30)  showError("err-uname", "Max 30 chars");
    else if (!/[A-Z]/.test(v)) showError("err-uname", "Need uppercase");
    else                        clearError("err-uname");
});

// ================= PASSWORD =================
let passInput = document.getElementById("pass");
let passRules = document.getElementById("pass-rules");

passInput.addEventListener("focus", () => { passRules.style.display = "block"; });
passInput.addEventListener("blur",  () => { if (passInput.value === "") passRules.style.display = "none"; });

passInput.addEventListener("input", function () {
    let v = this.value;
    setRule("rule-plen",     v.length >= 5);
    setRule("rule-pupper",   /[A-Z]/.test(v));
    setRule("rule-plower",   /[a-z]/.test(v));
    setRule("rule-pnum",     /[0-9]/.test(v));
    setRule("rule-pspecial", /[!@#$%^&*]/.test(v));

    if (v === "") showError("err-pass", "Password required");
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*]).{5,}$/.test(v))
        showError("err-pass", "Invalid password");
    else clearError("err-pass");

    let cpass = document.getElementById("cpass").value;
    if (cpass && cpass !== v) showError("err-cpass", "Passwords do not match");
    else if (cpass)           clearError("err-cpass");
});

// ================= CONFIRM PASSWORD =================
document.getElementById("cpass").addEventListener("input", function () {
    let pass = document.getElementById("pass").value;
    if (this.value !== pass) showError("err-cpass", "Passwords do not match");
    else                     clearError("err-cpass");
});

// ================= EMAIL =================
document.getElementById("email").addEventListener("input", function () {
    let v = this.value.trim();
    if (!v)                                          showError("err-email", "Email required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) showError("err-email", "Invalid email");
    else                                             clearError("err-email");
});

// ================= FIRST NAME =================
document.getElementById("fname").addEventListener("input", function () {
    if (!this.value.trim()) showError("err-fname", "First name required");
    else                    clearError("err-fname");
});

// ================= DOB =================
document.getElementById("dob").addEventListener("change", function () {
    let age = new Date().getFullYear() - new Date(this.value).getFullYear();
    if (age < 21) showError("err-dob", "Must be 21+");
    else          clearError("err-dob");
});

// ================= CONSENT =================
document.getElementById("consent").addEventListener("change", function () {
    if (!this.checked) showError("err-consent", "Accept terms");
    else               clearError("err-consent");
});

// ================= ROLE =================
document.getElementById("role").addEventListener("change", function () {
    if (!this.value) showError("err-role", "Select role");
    else             clearError("err-role");
});

// ================= SUBMIT =================
document.getElementById("bt").addEventListener("click", function (e) {
    e.preventDefault();

    let fname   = document.getElementById("fname").value.trim();
    let mname   = document.getElementById("mname").value.trim(); // optional
    let lname   = document.getElementById("lname").value.trim();
    let email   = document.getElementById("email").value.trim();
    let uname   = document.getElementById("username").value.trim();
    let pass    = document.getElementById("pass").value;
    let cpass   = document.getElementById("cpass").value;
    let dob     = document.getElementById("dob").value;
    let role    = document.getElementById("role").value;
    let consent = document.getElementById("consent").checked;

    // Only first name is mandatory now
    if (!fname)   showError("err-fname",   "First name required");
    if (!email)   showError("err-email",   "Email required");
    if (!uname)   showError("err-uname",   "Username required");
    if (!pass)    showError("err-pass",    "Password required");
    if (!cpass)   showError("err-cpass",   "Retype password");
    if (!dob)     showError("err-dob",     "DOB required");
    if (!role)    showError("err-role",    "Select role");
    if (!consent) showError("err-consent", "Accept terms");

    let hasErrors = false;
    document.querySelectorAll(".err").forEach(el => {
        if (el.innerText.trim()) hasErrors = true;
    });
    if (hasErrors) return;

    async function register() {
        let res = await fetch("/register", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ fname, mname, lname, email, uname, pass, dob, role })
        });

        let data = await res.json();

        if (res.status === 201) {
            document.getElementById("form-success").innerText = "✓ Registration successful!";
            setTimeout(() => window.location.href = "login.html", 1500);
        } else if (res.status === 409) {
            if (data.message.toLowerCase().includes("username"))
                showError("err-uname", data.message);
            else if (data.message.toLowerCase().includes("email"))
                showError("err-email", data.message);
        } else {
            document.getElementById("form-success").innerText = data.message || "Something went wrong";
        }
    }

    register();
});