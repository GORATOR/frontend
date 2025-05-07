<script setup lang="ts">

import {MenuItem} from "../../models/sidebarMenuItem.ts";
import Sidebar from "../../components/Sidebar.vue";
import {ref} from "vue";
import {Organization} from "../../models/organization.ts";
import {EntityName} from "../../models/count.ts";
import {getEntityId, readEntity} from "../../service/readEntity.ts";

const loaded = ref(false);
const org = ref<Organization | undefined>(undefined);

async function initLoad() {
  try {
    org.value = await readEntity(EntityName.Organization, getEntityId(EntityName.Organization))
    loaded.value = true;
  } catch (e) {
    console.log(e);
  }
}

initLoad();

</script>

<template>
  <Sidebar :active=MenuItem.Orgs>
    <template v-if="loaded">
      <h2>
        {{ org?.Name}}
      </h2>
    </template>

  </Sidebar>
</template>

<style scoped lang="scss">

</style>