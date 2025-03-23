<script setup lang="ts">
import {ref} from 'vue'
import Sidebar from '../../components/Sidebar.vue'
import {redirectUsersNew} from '../../utils/redirects.ts'
import {User} from '../../models/user.ts'
import Button from '../../components/Button.vue'
import Table from '../../components/Table.vue'
import Paging from '../../components/paging/Paging.vue'
import {EntityCount, EntityName} from '../../models/count.ts'
import {PageSelectEvent} from '../../models/pagingPageSelect.ts'
import {MenuItem} from '../../models/sidebarMenuItem.ts'
import {loadUsers} from "../../service/loadList.ts";
import loadCount from "../../service/loadCount.ts";

const list = ref<User[]>([])
const loaded = ref(false)

const count = ref<EntityCount>({ count: 0, entity: EntityName.User})
const page = ref(1)
const offset = ref(0)

async function pageSelect(e: PageSelectEvent) {
    page.value = e.page
    offset.value = e.offset
    list.value = await loadUsers(loaded, offset.value);
}

async function initLoad() {
    count.value = await loadCount(count.value.entity);
    list.value = await loadUsers(loaded, offset.value);
}

initLoad()
</script>

<template>
    <Sidebar :active=MenuItem.Users>
        <template v-if="loaded">
            <h2>Users</h2>

            <Table
                :headers="['Name', 'Email']"
                :rows="list.map(x => ({ Name: x.Username, Email: x.Email }))" />

            <Paging :page="page" :limit="10" :count="count.count" v-on:page-select="pageSelect" />

            <div class="padding-small">
                <Button @click="redirectUsersNew">CREATE</Button>
            </div>
        </template>
    </Sidebar>
</template>

<style scoped lang="scss">
.padding-small {
    padding-top: 14px;
}
</style>