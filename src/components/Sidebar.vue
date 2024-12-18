<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../store/user.ts'
import {
    redirectHome,
    redirectTeamsList,
    redirectOrganizationsList,
    redirectUsersList
} from '../utils/redirects.ts'
import MenuIcon from '../icons/MenuIcon.vue'
import MenuIconFold from '../icons/MenuIconFold.vue'

const store = useUserStore()
const isMenuVisible = ref(false)

function showMenu() {
    isMenuVisible.value = !isMenuVisible.value
}
</script>

<template>
    <div class="sidebar">
        <div class="sidebar-menu" :class="{ show: isMenuVisible }">
            <div class="sidebar-menu-header">
                <div class="account-login" @click="redirectHome">
                    {{ store.username }}
                </div>
                <div class="close-menu">
                    <MenuIconFold class="menu-icon-fold" @click="showMenu" />
                </div>
            </div>
            <div class="menu-items">
                <button class="menu-item" @click="redirectUsersList">Users</button>
                <button class="menu-item" @click="redirectTeamsList">Teams</button>
                <button class="menu-item" @click="redirectOrganizationsList">Orgs</button>
            </div>
        </div>
        <div class="sidebar-container">
            <div class="sidebar-container-menu">
                <MenuIcon class="menu-icon" @click="showMenu" />
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
        background-color: $main_theme_background;
        flex-shrink: 0;

        .sidebar-menu-header {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .close-menu {
                display: none;
            }
        }

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

            .sidebar-menu-header .close-menu {
                display: block;
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
            color: rgba(255, 255, 255, 0.9);
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
                color: $main_theme_background_lighter2;
                background-color: transparent;
                text-align: left;
                cursor: pointer;
            }

            .menu-item:hover {
                color: white;
                background-color: $main_theme_background_lighter1;
            }
        }
    }

    .sidebar-container {
        flex-grow: 1;
        padding: 20px;

        .sidebar-container-menu {
            display: none;
            border-bottom: 3px solid $main_theme_background;
            margin-bottom: 20px;

            @media (width < $sm) {
                display: block;
            }
        }
    }

    .menu-icon {
        fill: $main_theme_background;
        color: $main_theme_background;
        &:hover {
            fill: $main_theme_background_lighter2;
            color: $main_theme_background_lighter2;
        }
    }

    .menu-icon-fold {
        fill: $main_theme_background_lighter1;
        color: $main_theme_background_lighter1;
        &:hover {
            fill: $main_theme_background_lighter2;
            color: $main_theme_background_lighter2;
        }
    }
}
</style>