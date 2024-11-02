<script setup lang="ts">
import { useUserStore } from '../store/user.ts'
import { gotoHome, gotoTeamsList } from '../utils/redirects.ts'

const store = useUserStore()
</script>

<template>
    <div class="sidebar">
        <div class="sidebar-menu">
            <div class="account-login" @click="gotoHome">
                {{ store.username }}
            </div>
            <div class="menu-items">
                <button class="menu-item">Users</button>
                <button class="menu-item" @click="gotoTeamsList">Teams</button>
                <button class="menu-item">Orgs</button>
            </div>
        </div>
        <div class="sidebar-container">
            <slot></slot>
        </div>
    </div>
</template>

<style scoped>
.account-login {
    color: rgb(248, 249, 250);
}

.sidebar {
    height: 100vh;
    display: flex;
}

.sidebar-menu {
    width: 200px;
    padding: 1rem;
    background-color: #371e40;
}

.sidebar-container {
    flex-grow: 1;
    padding: 1rem;
}

.menu-items {
    padding-top: 1rem;
    display: flex;
    flex-direction: column;
}

.menu-item {
    padding: 0.3rem;
    border: 0;
    border-radius: 0.3rem;
    color: #9586a5;
    background-color: #371e40;
    text-align: left;
}

.menu-item:hover {
    color: white;
    background-color: #543c5c;
}
</style>