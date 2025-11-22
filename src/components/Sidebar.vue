<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../store/user.ts'
import {
    redirectHome,
    redirectTeamsList,
    redirectOrganizationsList,
    redirectUsersList,
    redirectProjectsList,
    redirectIssuesList,
    redirectUserProfile
} from '../utils/redirects.ts'
import MenuIcon from '../icons/MenuIcon.vue'
import MenuIconFold from '../icons/MenuIconFold.vue'
import { MenuItem } from '../models/sidebarMenuItem.ts'

const props = defineProps<{
    active?: MenuItem
}>()

const store = useUserStore()
const isMenuVisible = ref(false)

function showMenu() {
    isMenuVisible.value = !isMenuVisible.value
}

function handleLogout() {
    store.logout()
    window.location.href = '/login'
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
                <button
                    v-if="!store.isAdmin"
                    :class="{ 'menu-item': true, 'active': props.active == MenuItem.Profile }"
                    @click="redirectUserProfile">
                    My Profile
                </button>
                <button
                    :class="{ 'menu-item': true, 'active': props.active == MenuItem.Issues }"
                    @click="redirectIssuesList">
                    Issues
                </button>
                <button
                    v-if="store.isAdmin"
                    :class="{ 'menu-item': true, 'active': props.active == MenuItem.Users }"
                    @click="redirectUsersList">
                    Users
                </button>
                <button
                    :class="{ 'menu-item': true, 'active': props.active == MenuItem.Teams }"
                    @click="redirectTeamsList">
                    Teams
                </button>
                <button
                    :class="{ 'menu-item': true, 'active': props.active == MenuItem.Orgs }"
                    @click="redirectOrganizationsList">
                    Orgs
                </button>
                <button
                    :class="{ 'menu-item': true, 'active': props.active == MenuItem.Projects }"
                    @click="redirectProjectsList">
                    Projects
                </button>
                <button
                    class="menu-item logout-button"
                    @click="handleLogout">
                    Logout
                </button>
            </div>
        </div>
        <div class="sidebar-container">
            <div class="sidebar-container-menu">
                <MenuIcon class="menu-icon" @click="showMenu" />
            </div>
            <div class="inner-container">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@use '../assets/variables' as *;

.sidebar {
    min-height: 100vh;
    display: flex;
    flex-direction: column;

    @media (width < $sm) {
        display: block;
    }

    @media ($sm <=width) {
        display: flex;
        flex-direction: row;
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

                &.active {
                    box-shadow: -5px 0px 0px 0px $main_theme_active_color;
                    color: white;
                    background-color: $main_theme_background_lighter1;
                }
            }

            .menu-item:hover {
                color: white;
                background-color: $main_theme_background_lighter1;
            }

            .logout-button {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid $main_theme_background_lighter1;
            }
        }
    }

    .sidebar-container {
        flex-grow: 1;
        padding: 20px;

        @media (width > $lg) {
            .inner-container {
                margin: 0 auto;
                max-width: $md;
            }
        }

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