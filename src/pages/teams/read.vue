<script setup lang="ts">

import {MenuItem} from "../../models/sidebarMenuItem.ts";
import Sidebar from "../../components/Sidebar.vue";
import {ref} from "vue";
import {EntityName} from "../../models/count.ts";
import {Team} from "../../models/team.ts";
import {getEntityId, readEntity} from "../../service/readEntity.ts";

const loaded = ref(false);
const team = ref<Team | undefined>(undefined);

async function initLoad() {
  try {
    team.value = await readEntity(EntityName.Team, getEntityId(EntityName.Team))
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
        {{ team?.Name }}
      </h2>
    </template>

  </Sidebar>
</template>

<style scoped lang="scss">

</style>