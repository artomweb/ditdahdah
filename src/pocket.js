let allCharacters = [
  { char: "Q", type: "letter", error: 255, inSessions: true },
  { char: "7", type: "number", error: 255, inSessions: true },
  { char: "Z", type: "letter", error: 255, inSessions: true },
  { char: "G", type: "letter", error: 255, inSessions: true },
  { char: "0", type: "number", error: 255, inSessions: false },
  { char: "9", type: "number", error: 255, inSessions: false },
  { char: "8", type: "number", error: 255, inSessions: false },
  { char: "O", type: "letter", error: 255, inSessions: false },
  { char: "1", type: "number", error: 255, inSessions: false },
  { char: "J", type: "letter", error: 255, inSessions: false },
  { char: "P", type: "letter", error: 255, inSessions: false },
  { char: "W", type: "letter", error: 255, inSessions: false },
  { char: ".", type: "symbol", error: 255, inSessions: false },
  { char: "L", type: "letter", error: 255, inSessions: false },
  { char: "R", type: "letter", error: 255, inSessions: false },
  { char: "A", type: "letter", error: 255, inSessions: false },
  { char: "M", type: "letter", error: 255, inSessions: false },
  { char: "6", type: "number", error: 255, inSessions: false },
  { char: "B", type: "letter", error: 255, inSessions: false },
  { char: "/", type: "symbol", error: 255, inSessions: false },
  { char: "X", type: "letter", error: 255, inSessions: false },
  { char: "D", type: "letter", error: 255, inSessions: false },
  { char: "=", type: "symbol", error: 255, inSessions: false },
  { char: "Y", type: "letter", error: 255, inSessions: false },
  { char: "C", type: "letter", error: 255, inSessions: false },
  { char: "K", type: "letter", error: 255, inSessions: false },
  { char: "N", type: "letter", error: 255, inSessions: false },
  { char: "2", type: "number", error: 255, inSessions: false },
  { char: "3", type: "number", error: 255, inSessions: false },
  { char: "?", type: "symbol", error: 255, inSessions: false },
  { char: "F", type: "letter", error: 255, inSessions: false },
  { char: "U", type: "letter", error: 255, inSessions: false },
  { char: "4", type: "number", error: 255, inSessions: false },
  { char: "5", type: "number", error: 255, inSessions: false },
  { char: "V", type: "letter", error: 255, inSessions: false },
  { char: "H", type: "letter", error: 255, inSessions: false },
  { char: "S", type: "letter", error: 255, inSessions: false },
  { char: "I", type: "letter", error: 255, inSessions: false },
  { char: "T", type: "letter", error: 255, inSessions: false },
  { char: "E", type: "letter", error: 255, inSessions: false },
];

let stateComponent;

document.addEventListener("alpine:init", () => {
  stateComponent = Alpine.data("state", () => ({
    client: null,

    showLogin: false,

    // login / signup
    username: null,
    email: null,
    password: null,
    passwordConfirm: null,
    loginMessage: null,
    signupMessage: null,
    onSignInPage: true,
    showSMessage: false,
    showEMessage: false,
    SMessage: "",
    EMessage: "",
    isChecked: { numbers: true, symbols: false },
    currentSessionCharacters: [],

    //x-data="{ currentPage: window.location.hash ? window.location.hash.substring(1) : 'Learn', showLogin: false }"

    currentPage: null,

    async init() {
      console.log("INIT");

      this.updateCharacterList();
      this.updateChart();

      this.currentPage = window.location.hash ? window.location.hash.substring(1) : "Learn";

      // initialize pocketbase
      this.client = new PocketBase(" http://127.0.0.1:8090");
      console.log(this.client);

      // capture invalid token
      this.client.afterSend = function (response, data) {
        if (response.status === 401) {
          this.showLogin = true;
        }

        return data;
      };

      // if user is not logged in, show login / signup page
      if (!window.localStorage.getItem("pocketbase_auth")) {
        this.showLogin = true;
        return;
      }

      // resume session
      const auth = JSON.parse(window.localStorage.getItem("pocketbase_auth"));
      this.client.authStore.save(auth.token, auth.model);
    },

    // login
    async login() {
      try {
        const user = await this.client.collection("users").authWithPassword(this.email, this.password);
        this.showLogin = false;
        this.email = "";
        this.password = "";
        // this.showToast("Login successful", "success", 2000);
        // if (!user.verified) {
        //   this.showToast("You will not be able to save your results until your account is verified.", "error", 5000);
        // }
      } catch (err) {
        console.log(err);
        // this.loginMessage = err.data.message;
        this.showToast(err.data.message, "error", 2000);
      }
    },

    async signup() {
      console.log(this.username, this.email, this.password, this.passwordConfirm);
      try {
        const user = await this.client.collection("users").create({
          username: this.username,
          email: this.email,
          password: this.password,
          passwordConfirm: this.passwordConfirm,
        });

        console.log(user);

        if (!user.verified) {
          const res = await this.client.collection("users").requestVerification(this.email);
          this.showToast("Check your email to verify your account", "success", 2000);
        } else {
          this.showToast("Success! Please, login.", "success", 2000);
        }

        this.email = "";
        this.password = "";
        this.passwordConfirm = "";
      } catch (err) {
        console.log(err);
        let errMsg = "";
        // this.loginMessage = err.data.message;
        if (err.data.data.email) errMsg += ` Email: ${err.data.data.email.message}`;
        if (err.data.data.password) errMsg += ` Password: ${err.data.data.password.message}`;
        if (err.data.data.passwordConfirm) errMsg += ` Password Confirm: ${err.data.data.passwordConfirm.message}`;
        this.showToast(errMsg, "error", 5000);
      }
    },

    showToast(message, type, delay) {
      if (type == "success") {
        this.showSMessage = true;
        this.SMessage = message;

        setTimeout(() => {
          this.showSMessage = false;
        }, delay);
      } else if (type == "error") {
        this.showEMessage = true;
        this.EMessage = message;

        setTimeout(() => {
          this.showEMessage = false;
        }, delay);
      }
    },

    async logout() {
      this.client.authStore.clear();
      this.showLogin = true;
    },

    updateCharacterList() {
      this.currentSessionCharacters = allCharacters.filter((e) => {
        return e.type == "letter" || (this.isChecked.numbers && e.type == "number") || (this.isChecked.symbols && e.type == "symbol");
      });
      console.log(this.currentSessionCharacters);
      this.updateChart();
    },

    updateChart() {
      characterChart.data.labels = this.currentSessionCharacters.map((e) => e.char);
      characterChart.data.datasets[0].data = this.currentSessionCharacters.map((e) => e.error);
      characterChart.data.datasets[0].backgroundColor = this.currentSessionCharacters.map((e) => (e.inSessions ? "LightSkyBlue" : "WhiteSmoke"));
      console.log(characterChart.data.datasets[0].backgroundColor);
      characterChart.update();
    },
  }));
});
