<script setup lang="ts">

import {MenuItem} from "../../models/sidebarMenuItem.ts";
import Sidebar from "../../components/Sidebar.vue";
import {ref} from "vue";
import {Organization} from "../../models/organization.ts";
import {EntityName} from "../../models/count.ts";
import {getEntityId, readEntity} from "../../service/readEntity.ts";
import {updateOrganization} from "../../service/updateEntity.ts";
import Button from "../../components/Button.vue";

const loaded = ref(false);
const org = ref<Organization>({} as Organization);
let isEditing = ref<boolean>(false);
const loading = ref<boolean>(false);

async function initLoad() {
  try {
    org.value = await readEntity(EntityName.Organization, getEntityId(EntityName.Organization))
    loaded.value = true;
  } catch (e) {
    console.log(e);
  }
}

function editSwitch() : void {
  isEditing.value = !isEditing.value;
}

function getButtonCaption(): string {
  return isEditing.value ? 'SAVE' : 'EDIT';
}

async function actionButtonClick(): Promise<void> {
  if (isEditing.value) {
    console.log('save action');
    await updateOrganization(loading, org.value);
    console.log('edit disabled');
  } else {
    console.log('edit enabled');
  }
  editSwitch();
}

initLoad();

</script>

<template>
  <Sidebar :active=MenuItem.Orgs>
    <template v-if="loaded">
      <h2>
        {{ org?.Name}}
      </h2>
      <div>
        <Button @click="actionButtonClick">{{getButtonCaption()}}</Button>
      </div>
      <div>
        <p v-if="!isEditing">{{org?.Name}}</p>
        <input type="text" v-if="isEditing" v-model="org.Name" />
      </div>
    </template>

  </Sidebar>
</template>

<style scoped lang="scss">

</style>