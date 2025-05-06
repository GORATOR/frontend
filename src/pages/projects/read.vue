<script setup lang="ts">

import {MenuItem} from "../../models/sidebarMenuItem.ts";
import Sidebar from "../../components/Sidebar.vue";
import {ref} from "vue";
import {EntityName} from "../../models/count.ts";
import {Project} from "../../models/project.ts";
import {getEntityId, readEntity} from "../../service/readEntity.ts";

const loaded = ref(false);
const project = ref<Project | undefined>(undefined);

async function initLoad() {
  try {
    project.value = await readEntity(EntityName.Project, getEntityId(EntityName.Project))
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
        {{ project?.Name }}
      </h2>
    </template>

  </Sidebar>
</template>

<style scoped lang="scss">

</style>