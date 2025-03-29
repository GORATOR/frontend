<script setup lang="ts">

import {MenuItem} from "../../models/sidebarMenuItem.ts";
import Sidebar from "../../components/Sidebar.vue";
import {ref} from "vue";
import {Organization} from "../../models/organization.ts";
import {sendGet} from "../../utils/requests.ts";
import {EntityName} from "../../models/count.ts";

const loaded = ref(false);
const org = ref<Organization | undefined>(undefined);

async function initLoad() {
  try {
    const response = await sendGet(`/${EntityName.Organization}/${getId().toString()}`);
    if (response.status == 200) {
      org.value = await response.json();
      loaded.value = true;
    }
  } catch (e) {
    console.log(e);
  }
}

function getId() : number {
  return Number.parseInt(location.pathname.replace(`/${EntityName.Organization}/`, ''));
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