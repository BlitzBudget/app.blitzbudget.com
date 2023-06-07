<template>
  <div>
    <notifications></notifications>
    <div class="row">
      <div class="col-md-8">
        <edit-profile-form @on-submit="updateName"> </edit-profile-form>
        <global-signout @on-submit="globallySignOut"></global-signout>
        <modify-user></modify-user>
      </div>
      <div class="col-md-4">
        <user-card> </user-card>
      </div>
    </div>
  </div>
</template>
<script>
import EditProfileForm from '@/components/UserProfile/EditProfileForm.vue';
import UserCard from '@/components/UserProfile/UserCard.vue';
import ModifyUser from '@/components/UserProfile/ModifyUser.vue';
import GlobalSignout from '@/components/UserProfile/GlobalSignout.vue';

export default {
  name: 'user',
  components: {
    EditProfileForm,
    UserCard,
    ModifyUser,
    GlobalSignout
  },
  methods: {
    async globallySignOut(isValid, accessToken) {
      if (!isValid) {
        return;
      }

      await this.$axios.$post(process.env.api.profile.globalSignout, {
        access_token: accessToken
      }).then(() => {
        this.$notify({ type: 'success', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: this.$t('user.global-signout.success') });
      }).catch(({ response }) => {
        let errorMessage = this.$lastElement(this.$splitElement(response.data.message, ':'));
        this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: errorMessage });
      });
    },
    async updateName(isValid, user) {
      if (!isValid) {
        return;
      }

      let { firstName, lastName } = this.extractNames(user.name)
      let accessToken = this.$authentication.fetchAccessToken();
      await this.$axios.$post(process.env.api.profile.userAttribute, {
        access_token: accessToken,
        user_attributes: {
          first_name: firstName,
          last_name: lastName
        }
      }).then(() => {
        this.$authentication.setUsername(user.name);
        this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', verticalAlign: 'bottom', horizontalAlign: 'center', message: $nuxt.$t('user.profile.update.success') });
      }).catch(({ response }) => {
        let errorMessage = this.$lastElement(this.$splitElement(response.data.message, ':'));
        this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: errorMessage });
      });
    },
    extractNames(fullName) {
      let nameArray = fullName.split(" ");
      let firstName = nameArray.shift();
      let lastName = nameArray.join(" ");
      return { firstName, lastName };
    },
  }
};
</script>
<style></style>
