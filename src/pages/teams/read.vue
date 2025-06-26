<script setup lang="ts">

import {MenuItem} from "../../models/sidebarMenuItem.ts";
import Sidebar from "../../components/Sidebar.vue";
import {ref} from "vue";
import {EntityName} from "../../models/count.ts";
import {Team} from "../../models/team.ts";
import {getEntityId, readEntity} from "../../service/readEntity.ts";
import Button from "../../components/Button.vue";
import {updateTeam} from "../../service/updateEntity.ts";

const loaded = ref(false);
const team = ref<Team>({} as Team );
let isEditing = ref<boolean>(false);
const loading = ref<boolean>(false);


async function initLoad() {
  try {
    team.value = await readEntity(EntityName.Team, getEntityId(EntityName.Team))
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
    await updateTeam(loading, team.value);
    console.log('edit disabled');
  } else {
    console.log('edit enabled');
  }
  editSwitch();
}

initLoad();

</script>

<template>
  <Sidebar :active=MenuItem.Teams>
    <template v-if="loaded">
      <h2>
        {{ team?.Name }}
      </h2>
      <div>
        <div>
          <Button @click="actionButtonClick">{{getButtonCaption()}}</Button>
        </div>
        <div>
          <p v-if="!isEditing">{{team?.Name}}</p>
          <input type="text" v-if="isEditing" v-model="team.Name" />
        </div>
      </div>
    </template>

  </Sidebar>
</template>

<style scoped lang="scss">

</style>