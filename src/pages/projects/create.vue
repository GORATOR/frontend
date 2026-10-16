<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '../../components/Sidebar.vue'
import TextBox from '../../components/TextBox.vue'
import Button from '../../components/Button.vue'
import ImageUpload from '../../components/ImageUpload.vue'
import { MenuItem } from '../../models/sidebarMenuItem.ts'
import {createProject} from "../../service/createEntity.ts";
import {ProjectCreate} from "../../models/project.ts";
import {SelectBoxOption} from "../../models/SelectBoxOption.ts";
import {loadTeams} from "../../service/loadList.ts";
import SelectBox from "../../components/SelectBox.vue";

const name = ref<string>("")
const avatar = ref<string>("")
const loading = ref<boolean>(false)
const options = ref(Array<SelectBoxOption>())
const teamOffset = ref(0);
const loaded = ref(false);
const teamId = ref("");

async function create() {
    return await createProject(loading, <ProjectCreate>{
        Name: name.value,
        TeamId: parseInt(teamId.value),
        Avatar: avatar.value
    })
}

async function loadList() {
  const data = await loadTeams(loaded, teamOffset.value);
  if (data.length > 0) {
    //@ts-ignore
    options.value = data.map(el => (<SelectBoxOption>{value: el.ID.toString(), label: el.Name}))
  }
}

loadList();
</script>

<template>
    <Sidebar :active=MenuItem.Projects>
        <h2>Create new Project</h2>
        <div class="create-form">
            <TextBox label="Name" v-model="name" />
            <SelectBox
                :options="options"
                :label="'Select team'"
                v-model="teamId"
            ></SelectBox>
            <ImageUpload label="Project Avatar" v-model="avatar" />
            <div class="form-actions">
                <Button v-if="loading" disabled>SUBMIT</Button>
                <Button v-else @click="create">SUBMIT</Button>
            </div>
        </div>
    </Sidebar>
</template>

<style scoped lang="scss">
h2 {
    margin: 0 0 20px;
    font-size: 22px;
}

.create-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 600px;
}

.form-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
}
</style>