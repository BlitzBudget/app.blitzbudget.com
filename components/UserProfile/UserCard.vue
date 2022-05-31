<template>
  <card class="card-user">
    <p class="card-text"></p>
    <div class="author">
      <div class="block block-one"></div>
      <div class="block block-two"></div>
      <div class="block block-three"></div>
      <div class="block block-four"></div>
      <a href="javascript:void(0)">
        <img class="avatar" src="img/emilyz.jpg" alt="..." />
        <h5 class="title">{{ user.name }}</h5>
      </a>
      <p class="description">{{ user.email }}</p>
    </div>
    <p></p>
    <div class="card-description">
    </div>

    <div slot="footer" class="button-container">
    </div>
  </card>
</template>
<script>
export default {
  data() {
    return {
      user: {
        email: '',
        name: 'Mike'
      }
    };
  },
  methods: {
    populateUserAttributes() {
      let userAttribute = this.$authentication.fetchCurrentUser(this);
      this.user.email = userAttribute.email;
      this.user.name = userAttribute.name;
    }
  },
  async mounted() {
    await this.populateUserAttributes();
  }
};
</script>
<style>
</style>
