<script setup lang="ts">

import {MenuItem} from "../../models/sidebarMenuItem.ts";
import Sidebar from "../../components/Sidebar.vue";
import {ref} from "vue";
import {EntityName} from "../../models/count.ts";
import {User} from "../../models/user.ts";
import {getEntityId, readEntity} from "../../service/readEntity.ts";
import {updateUser} from "../../service/updateEntity.ts";
import Button from "../../components/Button.vue";

const loaded = ref(false);
const user = ref<User>({} as User);
let isEditing = ref<boolean>(false);
const loading = ref<boolean>(false);

function editSwitch() : void {
  isEditing.value = !isEditing.value;
}

function getButtonCaption(): string {
  return isEditing.value ? 'SAVE' : 'EDIT';
}

async function actionButtonClick(): Promise<void> {
  if (isEditing.value) {
    console.log('save action');
    await updateUser(loading, user.value);
    console.log('edit disabled');
  } else {
    console.log('edit enabled');
  }
  editSwitch();
}

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
  <Sidebar :active=MenuItem.Users>
    <template v-if="loaded">
      <h2>
        {{ user?.Username }}
      </h2>
      <div>
        <Button @click="actionButtonClick">{{getButtonCaption()}}</Button>
      </div>
      <div>
        <p v-if="!isEditing">{{user?.Username}}</p>
        <input type="text" v-if="isEditing" v-model="user.Username" />
      </div>
    </template>

  </Sidebar>
</template>

<style scoped lang="scss">

</style>