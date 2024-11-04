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

<style scoped lang="scss">
.sidebar {
    height: 100vh;
    display: flex;

    .sidebar-menu {
        width: 200px;
        padding: 20px 10px;
        background-color: #371e40;

        .account-login {
            color: rgb(248, 249, 250);
            cursor: pointer;
        }

        .menu-items {
            padding-top: 20px;
            display: flex;
            flex-direction: column;

            .menu-item {
                padding: 7px;
                border: 0;
                border-radius: 7px;
                color: #9586a5;
                background-color: #371e40;
                text-align: left;
                cursor: pointer;
            }

            .menu-item:hover {
                color: white;
                background-color: #543c5c;
            }
        }
    }

    .sidebar-container {
        flex-grow: 1;
        padding: 20px;
    }
}
</style>