<template>
  <div>
    <notifications></notifications>
    <div class="row">
      <div class="col-md-8">
        <edit-profile-form> </edit-profile-form>
      </div>
      <div class="col-md-4">
        <user-card> </user-card>
      </div>
    </div>
    <div class="row">
      <div class="col-md-8">
        <modify-user></modify-user>
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
  }
};
</script>
<style>
</style>
