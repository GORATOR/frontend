<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../store/user.ts'
import {
    redirectHome,
    redirectTeamsList,
    redirectOrganizationsList,
    redirectUsersList
} from '../utils/redirects.ts'

const store = useUserStore()
const isMenuVisible = ref(false)

function showMenu() {
    isMenuVisible.value = !isMenuVisible.value
}
</script>

<template>
    <div class="sidebar">
        <div class="sidebar-menu" :class="{ show: isMenuVisible }">
            <div class="account-login" @click="redirectHome">
                {{ store.username }}
            </div>
            <div class="menu-items">
                <button class="menu-item" @click="redirectUsersList">Users</button>
                <button class="menu-item" @click="redirectTeamsList">Teams</button>
                <button class="menu-item" @click="redirectOrganizationsList">Orgs</button>
            </div>
        </div>
        <div class="sidebar-container">
            <div class="sidebar-container-menu">
                <button @click="showMenu">SHOW MENU</button>
            </div>
            <slot></slot>
        </div>
    </div>
</template>

<style scoped lang="scss">
@use '../assets/variables' as *;

.sidebar {
    height: 100vh;

    @media (width < $sm) {
        display: block;
    }

    @media ($sm <=width) {
        display: flex;
    }

    .sidebar-menu {
        padding: 20px 10px;
        background-color: #371e40;
        flex-shrink: 0;

        @media (width < $sm) {
            display: none;

            &.show {
                display: block;
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }
        }

        @media ($sm <=width < $lg) {
            display: block;
            width: 200px;
        }

        @media ($lg <=width) {
            display: block;
            width: 250px;
        }

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

        .sidebar-container-menu {
            display: none;

            @media (width < $sm) {
                display: block;
            }
        }
    }
}
</style>