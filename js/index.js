let ctx, chart;

document.addEventListener("alpine:init", () => {
  Alpine.data("state", () => ({
    state: {
      currentPage: "Learn",
      open: false,
      loggedIn: false,
      Numbers: false,
      Symbols: false,
      currentCharSet: [
        { type: "Letter", value: "Q", error: 255, active: true },
        { type: "Number", value: "7", error: 255, active: true },
        { type: "Letter", value: "Z", error: 255, active: true },
        { type: "Letter", value: "G", error: 255, active: true },
        { type: "Number", value: "0", error: 255, active: false },
        { type: "Number", value: "9", error: 255, active: false },
        { type: "Number", value: "8", error: 255, active: false },
        { type: "Letter", value: "O", error: 255, active: false },
        { type: "Number", value: "1", error: 255, active: false },
        { type: "Letter", value: "J", error: 255, active: false },
        { type: "Letter", value: "P", error: 255, active: false },
        { type: "Letter", value: "W", error: 255, active: false },
        { type: "Symbol", value: ".", error: 255, active: false },
        { type: "Letter", value: "L", error: 255, active: false },
        { type: "Letter", value: "R", error: 255, active: false },
        { type: "Letter", value: "A", error: 255, active: false },
        { type: "Letter", value: "M", error: 255, active: false },
        { type: "Number", value: "6", error: 255, active: false },
        { type: "Letter", value: "B", error: 255, active: false },
        { type: "Symbol", value: "/", error: 255, active: false },
        { type: "Letter", value: "X", error: 255, active: false },
        { type: "Letter", value: "D", error: 255, active: false },
        { type: "Symbol", value: "=", error: 255, active: false },
        { type: "Letter", value: "Y", error: 255, active: false },
        { type: "Letter", value: "C", error: 255, active: false },
        { type: "Letter", value: "K", error: 255, active: false },
        { type: "Letter", value: "N", error: 255, active: false },
        { type: "Number", value: "2", error: 255, active: false },
        { type: "Number", value: "3", error: 255, active: false },
        { type: "Symbol", value: "?", error: 255, active: false },
        { type: "Letter", value: "F", error: 255, active: false },
        { type: "Letter", value: "U", error: 255, active: false },
        { type: "Number", value: "4", error: 255, active: false },
        { type: "Number", value: "5", error: 255, active: false },
        { type: "Letter", value: "V", error: 255, active: false },
        { type: "Letter", value: "H", error: 255, active: false },
        { type: "Letter", value: "S", error: 255, active: false },
        { type: "Letter", value: "I", error: 255, active: false },
        { type: "Letter", value: "T", error: 255, active: false },
        { type: "Letter", value: "E", error: 255, active: false },
      ],
    },
    pb: null,
    morse: null,

    async init() {
      this.morse = new jscw({ wpm: 25 });

      ctx = document.getElementById("LearnChart");
      chart = new Chart(ctx, {
        type: "bar",
        data: {
          datasets: [
            {
              label: "Active",
              backgroundColor: "#9BD0F5",
              data: [],
              borderWidth: 1,
            },
            {
              label: "Innactive",
              backgroundColor: "#d9eefc",
              data: [],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            y: {
              display: false,
              // beginAtZero: true,
              border: {
                display: false,
              },
            },
            x: {
              ticks: {
                autoSkip: false,
                maxRotation: 0,
                minRotation: 0,
              },
            },
          },
          plugins: {
            legend: {
              display: false,
            },
          },
        },
      });

      this.pb = new PocketBase("http://127.0.0.1:8090");
      console.log(this.pb);
      if (this.pb.authStore.isValid) {
        this.state.loggedIn = true;
        console.log(this.pb.authStore);
        this.pb.collection("users").authRefresh();
        this.updateSettings();
        try {
          const record = await this.pb
            .collection("progress")
            .getFirstListItem(`user="${this.pb.authStore.model.id}"`);

          console.log(record);

          this.state.currentCharSet = record.characterSet;
        } catch (e) {
          console.error(e);

          const data = {
            user: this.pb.authStore.model.id,
            characterSet: this.state.currentCharSet,
          };
          const record = await this.pb.collection("progress").create(data);
        }
      }

      this.updateChart();
    },
    updateSettings() {
      if (this.state.loggedIn) {
        this.state.Numbers = this.pb.authStore.model.Numbers;
        this.state.Symbols = this.pb.authStore.model.Symbols;
      }
    },
    updateChart() {
      const filteredData = this.state.currentCharSet.filter((item) => {
        if (this.state.Numbers && item.type === "Number") {
          return true;
        }
        if (this.state.Symbols && item.type === "Symbol") {
          return true;
        }
        return item.type === "Letter";
      });
      const active = filteredData.filter((item) => item.active);
      const innactive = filteredData.filter((item) => !item.active);

      const activeDataset = active.map((item) => ({
        x: item.value,
        y: item.error,
      }));
      const innactiveDataset = innactive.map((item) => ({
        x: item.value,
        y: item.error,
      }));

      chart.data.datasets[0].data = activeDataset;
      chart.data.datasets[1].data = innactiveDataset;

      chart.update();
    },
    async loginGoogle() {
      console.log("this.pb", this.pb);
      const authData = await this.pb
        .collection("users")
        .authWithOAuth2({ provider: "google" });

      if (this.pb.authStore.isValid) {
        this.state.loggedIn = true;
        this.state.currentPage = "Learn";
        this.updateSettings();
      }

      console.log(this.pb.authStore.isValid);
      console.log(this.pb.authStore.token);
      console.log(this.pb.authStore.model.id);
    },
    logout() {
      this.pb.authStore.clear();
      this.state.loggedIn = false;
      createToast("info", "Signed out");
    },
    async settingsChanged() {
      const data = { Numbers: this.state.Numbers, Symbols: this.state.Symbols };
      const record = await this.pb
        .collection("users")
        .update(this.pb.authStore.model.id, data);

      console.log("Updated");
      this.updateChart();
    },
  }));
});
