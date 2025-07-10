<script setup lang="ts">

import {MenuItem} from "../../models/sidebarMenuItem.ts";
import Sidebar from "../../components/Sidebar.vue";
import {ref} from "vue";
import {EntityName} from "../../models/count.ts";
import {Project, ProjectUpdate} from "../../models/project.ts";
import {getEntityId, readEntity} from "../../service/readEntity.ts";
import {updateProject} from "../../service/updateEntity.ts";
import Button from "../../components/Button.vue";

const loaded = ref(false);
const project = ref<Project>({} as Project);
let isEditing = ref<boolean>(false);
const loading = ref<boolean>(false);

async function initLoad() {
  try {
    project.value = await readEntity(EntityName.Project, getEntityId(EntityName.Project))
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
    await updateProject(loading, project.value as ProjectUpdate);
    console.log('edit disabled');
  } else {
    console.log('edit enabled');
  }
  editSwitch();
}

initLoad();

</script>

<template>
  <Sidebar :active=MenuItem.Projects>
    <template v-if="loaded">
      <h2>
        {{ project?.Name }}
      </h2>
      <div>
        <Button @click="actionButtonClick">{{getButtonCaption()}}</Button>
      </div>
      <div>
        <p v-if="!isEditing">{{project?.Name}}</p>
        <input type="text" v-if="isEditing" v-model="project.Name" />
      </div>
    </template>

  </Sidebar>
</template>

<style scoped lang="scss">

</style>