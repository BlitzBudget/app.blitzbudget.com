<template>
  <card>
    <h5 slot="header" class="title">Edit Profile</h5>
    <div class="row">
      <div class="col-md-3">
        <base-input type="text" label="Username" placeholder="Username" v-model="user.name"
          v-validate="'required|min:5'" name="name" :error="getError('name')">
        </base-input>
      </div>
      <div class="col-md-4">
        <base-input type="email" label="Email address" placeholder="mike@email.com" v-model="user.email" disabled>
        </base-input>
      </div>
    </div>

    <base-button native-type="submit" type="primary" class="btn-fill" @click.native.prevent="validate">
      Save
    </base-button>
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
    getError(fieldName) {
      return this.errors.first(fieldName);
    },
    validate() {
      return this.$validator.validateAll().then(res => {
        this.$emit('on-submit', res, this.user);
        return res;
      });
    },
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
