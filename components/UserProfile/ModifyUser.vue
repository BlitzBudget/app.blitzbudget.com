<template>
    <card>
        <h5 slot="header" class="title">Danger Zone</h5>
        <div class="row mb-3 px-5">
            <div class="col-6">
                <h4 class="mb-0">Change Password</h4>
                <p class="small">You can change your password to enhance security.</p>
            </div>
            <div class="col-6">
                <nuxt-link to="/user/change-password" class="btn btn-primary float-right">Change Password</nuxt-link>
            </div>
        </div>
        <div class="row mb-3 px-5">
            <div class="col-6">
                <h4 class="mb-0">Reset Account</h4>
                <p class="small">This will delete all the data but preseve the user account.</p>
            </div>
            <div class="col-6">
                <nuxt-link to="/user/reset-account" class="btn btn-link float-right">Reset Account</nuxt-link>
            </div>
        </div>
        <div class="row mb-3 px-5">
            <div class="col-6">
                <h4 class="mb-0">Delete Account</h4>
                <p class="small">This will delete all the data and the user account.</p>
            </div>
            <div class="col-6">
                <nuxt-link to="/user/delete-account" class="btn btn-link float-right">Delete Account</nuxt-link>
            </div>
        </div>
    </card>
</template>
<script>
export default {
    data() {
        return {
            user: {
                company: 'Creative Code Inc.',
                username: 'michael23',
                email: '',
                firstName: 'Mike',
                lastName: 'Andrew',
                address: 'Bld Mihail Kogalniceanu, nr. 8 Bl 1, Sc 1, Ap 09',
                city: 'New York',
                country: 'USA',
                postalCode: '',
                aboutMe: `Lamborghini Mercy, Your chick she so thirsty, I'm in that two seat Lambo.`
            }
        };
    },
    methods: {
        updateProfile() {
            alert('Your data: ' + JSON.stringify(this.user));
        }
    }
};
</script>
<style>
</style>
