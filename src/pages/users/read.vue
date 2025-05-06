<script setup lang="ts">

import {MenuItem} from "../../models/sidebarMenuItem.ts";
import Sidebar from "../../components/Sidebar.vue";
import {ref} from "vue";
import {EntityName} from "../../models/count.ts";
import {User} from "../../models/user.ts";
import {getEntityId, readEntity} from "../../service/readEntity.ts";

const loaded = ref(false);
const user = ref<User | undefined>(undefined);

async function initLoad() {
  try {
    user.value = await readEntity(EntityName.User, getEntityId(EntityName.User))
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
        {{ user?.Username }}
      </h2>
    </template>

  </Sidebar>
</template>

<style scoped lang="scss">

</style>