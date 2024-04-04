function state() {
  return {
    state: {
      currentPage: "Login",
      open: false,
    },
    pb: null,
    init() {
      this.pb = new PocketBase("http://127.0.0.1:8090");
      console.log(this.pb);
    },
    async loginGoogle(e) {
      e.preventDefault();
      console.log("this.pb", this.pb);
      const authData = await this.pb
        .collection("users")
        .authWithOAuth2({ provider: "google" });

      console.log(this.pb.authStore.isValid);
      console.log(this.pb.authStore.token);
      console.log(this.pb.authStore.model.id);
    },
    testClick() {
      console.log("testClick");
    },
  };
}
