<script setup lang="ts">
import {ref} from 'vue'
import Sidebar from '../../components/Sidebar.vue'
import {Organization} from '../../models/organization'
import {redirectOrganizationsNew} from '../../utils/redirects.ts'
import Button from '../../components/Button.vue'
import Table from '../../components/Table.vue'
import Paging from '../../components/paging/Paging.vue'
import {EntityCount, EntityName} from '../../models/count.ts'
import {PageSelectEvent} from '../../models/pagingPageSelect.ts'
import {MenuItem} from '../../models/sidebarMenuItem.ts'
import {loadOrganizations} from "../../service/loadList.ts";
import loadCount from "../../service/loadCount.ts";

const list = ref<Organization[]>([])
const loaded = ref(false)

const count = ref<EntityCount>({ count: 0, entity: EntityName.Organization })
const page = ref(1)
const offset = ref(0)

async function pageSelect(e: PageSelectEvent)
{
    page.value = e.page
    offset.value = e.offset
    list.value = await loadOrganizations(loaded, offset.value);
}

async function initLoad() {
    count.value = await loadCount(count.value.entity);
    list.value = await loadOrganizations(loaded, offset.value);
}

function orgUrl(id: string) : string {
  return `${location.origin}/organization/${id}`;
}

initLoad()
</script>

<template>
    <Sidebar :active=MenuItem.Orgs>
        <template v-if="loaded">
            <h2>Organizations</h2>

            <Table
                :headers="['Name']"
                :rows="list.map(x => ({ Name: x.Name, url: orgUrl(x.ID.toString()) }))" />

            <Paging :page="page" :limit="10" :count="count.count" v-on:page-select="pageSelect" />

            <div class="padding-small">
                <Button @click="redirectOrganizationsNew">CREATE</Button>
            </div>
        </template>
    </Sidebar>
</template>

<style scoped lang="scss">
.padding-small {
    padding-top: 14px;
}
</style>