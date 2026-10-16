<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserStore } from '../store/user.ts'
import {
    redirectHome,
    redirectTeamsList,
    redirectOrganizationsList,
    redirectUsersList,
    redirectProjectsList,
    redirectIssuesList,
    redirectTracesList,
    redirectUserProfile,
    redirectRolesList
} from '../utils/redirects.ts'
import MenuIcon from '../icons/MenuIcon.vue'
import MenuIconFold from '../icons/MenuIconFold.vue'
import NavIcon from '../icons/NavIcon.vue'
import { MenuItem } from '../models/sidebarMenuItem.ts'

const props = defineProps<{
    active?: MenuItem
}>()

const store = useUserStore()
const isMenuVisible = ref(false)

const userInitial = computed(() => store.username?.charAt(0)?.toUpperCase() ?? '?')

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
                <div class="brand" @click="redirectHome">
                    <span class="brand-mark">G</span>
                    <span class="brand-name">GORATOR</span>
                </div>
                <div class="close-menu">
                    <MenuIconFold class="menu-icon-fold" @click="showMenu" />
                </div>
            </div>

            <div class="account" @click="redirectHome">
                <span class="account-avatar">{{ userInitial }}</span>
                <span class="account-login">{{ store.username }}</span>
            </div>

            <nav class="menu-items">
                <button
                    v-if="!store.isAdmin"
                    :class="{ 'menu-item': true, 'active': props.active == MenuItem.Profile }"
                    @click="redirectUserProfile">
                    <NavIcon name="profile" />
                    <span>My Profile</span>
                </button>
                <button
                    :class="{ 'menu-item': true, 'active': props.active == MenuItem.Issues }"
                    @click="redirectIssuesList">
                    <NavIcon name="issues" />
                    <span>Issues</span>
                </button>
                <button
                    :class="{ 'menu-item': true, 'active': props.active == MenuItem.Traces }"
                    @click="redirectTracesList">
                    <NavIcon name="traces" />
                    <span>Traces</span>
                </button>
                <button
                    v-if="store.isAdmin"
                    :class="{ 'menu-item': true, 'active': props.active == MenuItem.Users }"
                    @click="redirectUsersList">
                    <NavIcon name="users" />
                    <span>Users</span>
                </button>
                <button
                    v-if="store.isAdmin"
                    :class="{ 'menu-item': true, 'active': props.active == MenuItem.Roles }"
                    @click="redirectRolesList">
                    <NavIcon name="roles" />
                    <span>Roles</span>
                </button>
                <button
                    :class="{ 'menu-item': true, 'active': props.active == MenuItem.Teams }"
                    @click="redirectTeamsList">
                    <NavIcon name="teams" />
                    <span>Teams</span>
                </button>
                <button
                    :class="{ 'menu-item': true, 'active': props.active == MenuItem.Orgs }"
                    @click="redirectOrganizationsList">
                    <NavIcon name="orgs" />
                    <span>Orgs</span>
                </button>
                <button
                    :class="{ 'menu-item': true, 'active': props.active == MenuItem.Projects }"
                    @click="redirectProjectsList">
                    <NavIcon name="projects" />
                    <span>Projects</span>
                </button>
            </nav>

            <div class="menu-footer">
                <button
                    class="menu-item logout-button"
                    @click="handleLogout">
                    <NavIcon name="logout" />
                    <span>Logout</span>
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
        padding: 20px 14px;
        background: linear-gradient(180deg, $sidebar_gradient_start 0%, $sidebar_gradient_end 100%);
        flex-shrink: 0;
        display: flex;
        flex-direction: column;

        @media (width < $sm) {
            display: none;

            &.show {
                display: flex;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 2000;
            }
        }

        @media ($sm <=width) {
            position: sticky;
            top: 0;
            height: 100vh;
            width: 240px;

            .close-menu {
                display: none;
            }
        }

        @media ($lg <=width) {
            width: 260px;
        }

        .sidebar-menu-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 6px;

            .brand {
                display: flex;
                align-items: center;
                gap: 10px;
                cursor: pointer;
                user-select: none;

                .brand-mark {
                    display: grid;
                    place-content: center;
                    width: 30px;
                    height: 30px;
                    border-radius: 8px;
                    background: linear-gradient(135deg, $main_theme_active_color 0%, #3f59e5 100%);
                    color: white;
                    font-family: $font_heading;
                    font-weight: 700;
                    font-size: 16px;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
                }

                .brand-name {
                    color: white;
                    font-family: $font_heading;
                    font-weight: 700;
                    font-size: 15px;
                    letter-spacing: 0.12em;
                }
            }
        }

        .account {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 22px 0 6px;
            padding: 8px 10px;
            border-radius: $radius_md;
            background: rgba(255, 255, 255, 0.06);
            cursor: pointer;
            transition: background-color 0.15s ease;

            &:hover {
                background: rgba(255, 255, 255, 0.11);
            }

            .account-avatar {
                display: grid;
                place-content: center;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: $main_theme_active_color;
                color: white;
                font-size: 13px;
                font-weight: 600;
                flex-shrink: 0;
            }

            .account-login {
                color: rgba(255, 255, 255, 0.92);
                font-weight: 500;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        .menu-items {
            padding-top: 14px;
            display: flex;
            flex-direction: column;
            gap: 2px;

            .menu-item {
                position: relative;
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 9px 12px;
                border: 0;
                border-radius: $radius_md;
                color: $sidebar_text;
                background-color: transparent;
                text-align: left;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: background-color 0.15s ease, color 0.15s ease;

                &.active {
                    color: $sidebar_text_hover;
                    background-color: $sidebar_item_active;

                    &::before {
                        content: '';
                        position: absolute;
                        left: -14px;
                        top: 8px;
                        bottom: 8px;
                        width: 3px;
                        border-radius: 0 3px 3px 0;
                        background: $main_theme_active_color;
                    }
                }
            }

            .menu-item:hover {
                color: $sidebar_text_hover;
                background-color: $sidebar_item_hover;
            }
        }

        .menu-footer {
            margin-top: auto;
            padding-top: 14px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);

            .logout-button {
                width: 100%;
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 9px 12px;
                border: 0;
                border-radius: $radius_md;
                color: $sidebar_text;
                background-color: transparent;
                text-align: left;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: background-color 0.15s ease, color 0.15s ease;

                &:hover {
                    color: $sidebar_text_hover;
                    background-color: $sidebar_item_hover;
                }
            }
        }
    }

    .sidebar-container {
        flex-grow: 1;
        min-width: 0;
        padding: 28px 32px;

        @media (width < $sm) {
            padding: 16px;
        }

        @media (width > $lg) {
            .inner-container {
                margin: 0 auto;
                max-width: 1080px;
            }
        }

        .sidebar-container-menu {
            display: none;
            border-bottom: 1px solid $border_color;
            margin-bottom: 16px;

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
        fill: $sidebar_text;
        color: $sidebar_text;
        &:hover {
            fill: $sidebar_text_hover;
            color: $sidebar_text_hover;
        }
    }
}
</style>
