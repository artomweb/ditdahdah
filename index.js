document.addEventListener("alpine:init", () => {
  Alpine.data("lists", () => ({
    // pocketbase client
    client: null,

    // login / signup
    showLogin: false,
    email: null,
    password: null,
    passwordConfirm: null,
    loginMessage: null,
    signupMessage: null,

    // lists data
    lists: [],
    newListName: "",
    selectedList: null,

    // items data
    items: null,
    newItem: null,

    async init() {
      // initialize pocketbase
      this.client = new PocketBase("http://127.0.0.1:8090");

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

      // fetch todo lists
      this.getLists();

      // suscribe to live update events
      this.subscribeToLists();
    },

    // login
    async login() {
      try {
        const user = await this.client.users.authViaEmail(this.email, this.password);
        this.getLists();
        this.subscribeToLists();
        this.showLogin = false;
        this.email = "";
        this.password = "";
      } catch (err) {
        this.loginMessage = err.data.message;
      }
    },

    // signup
    async signup() {
      try {
        const user = await this.client.users.create({
          email: this.email,
          password: this.password,
          passwordConfirm: this.passwordConfirm,
        });
        this.email = "";
        this.password = "";
        this.passwordConfirm = "";
        this.signupMessage = "Success! Please, login.";
      } catch (err) {
        this.signupMessage = err.data.message;
        if (err.data.data.email) this.signupMessage += ` Email: ${err.data.data.email.message}`;
        if (err.data.data.password) this.signupMessage += ` Password: ${err.data.data.password.message}`;
        if (err.data.data.passwordConfirm) this.signupMessage += ` Password Confirm: ${err.data.data.passwordConfirm.message}`;
      }
    },

    // logout
    async logout() {
      this.client.authStore.clear();
      this.showLogin = true;
    },

    // lists functions
    async subscribeToLists() {
      this.client.realtime.subscribe("list", (e) => {
        if (e.action === "create") this.lists.push(e.record);
        else if (e.action === "delete") {
          this.lists = this.lists.filter((l) => l.id !== e.record.id);
        }
      });
    },

    async getLists() {
      const { items } = await this.client.records.getList("list");
      this.lists = items;
    },

    async createList() {
      try {
        const record = await this.client.records.create("list", {
          name: this.newListName,
          userID: this.client.authStore.baseModel.id,
        });
        this.newListName = "";
      } catch (err) {
        console.log("ERR", err);
      }
    },

    async deleteList(list) {
      try {
        await this.client.records.delete("list", list.id);
      } catch (err) {
        console.log("ERR", err);
      }
    },

    async selectList(list) {
      try {
        this.items = await this.client.records.getFullList("item", null, { filter: `list = '${list.id}'` });
        this.selectedList = list;

        // suscribe to live update events
        this.client.realtime.subscribe("item", (e) => {
          if (e.record.list !== list.id) return;
          if (e.action === "create") this.items.push(e.record);
          if (e.action === "update") this.items = this.items.map((i) => (i.id === e.record.id ? e.record : i));
          else if (e.action === "delete") this.items = this.items.filter((i) => i.id !== e.record.id);
        });
      } catch (err) {
        console.log("ERR", err);
      }
    },

    // items functions
    async createItem() {
      try {
        await this.client.records.create("item", { text: this.newItem, list: this.selectedList.id });
        this.newItem = "";
      } catch (err) {
        console.log("ERR", err);
      }
    },

    async deleteItem(item) {
      try {
        await this.client.records.delete("item", item.id);
      } catch (err) {
        console.log("ERR", err);
      }
    },

    async toggleDone(item, toggle) {
      try {
        await this.client.records.update("item", item.id, { done: toggle });
      } catch (err) {
        console.log("ERR", err);
      }
    },
  }));
});
