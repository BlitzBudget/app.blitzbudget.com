<template>
  <div>
    <notifications></notifications>
    <div class="row">
      <div class="col-md-8">
        <edit-profile-form @on-submit="updateName"> </edit-profile-form>
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

export default {
  name: 'user',
  components: {
    EditProfileForm,
    UserCard,
    ModifyUser
  },
  methods: {
    async updateName(isValid, user) {
      if (!isValid) {
        return;
      }

      await this.$axios.$post(process.env.api.profile.userAttribute, {
        name: user.name,
        username: user.email
      }).then(() => {
        this.$authentication.setUsername(user.name);
        this.$notify({ type: 'success', icon: 'tim-icons icon-check-2', verticalAlign: 'bottom', horizontalAlign: 'center', message: $nuxt.$t('user.profile.update.success') });
      }).catch(({ response }) => {
        let errorMessage = this.$lastElement(this.$splitElement(response.data.errorMessage, ':'));
        this.$notify({ type: 'danger', icon: 'tim-icons icon-simple-remove', verticalAlign: 'bottom', horizontalAlign: 'center', message: errorMessage });
      });
    }
  }
};
</script>
<style>
</style>
