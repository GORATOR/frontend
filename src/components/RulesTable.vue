<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { Rule, RuleAction, RuleTable } from '../models/role'
import { RULE_ACTIONS, RULE_TABLES } from '../models/role'

const props = withDefaults(defineProps<{
    modelValue: Rule[],
    readonly?: boolean
}>(), {
    readonly: false
})

const emit = defineEmits<{
    (e: 'update:modelValue', value: Rule[]): void
}>()

// Matrix state: rulesMatrix[table][action] = allowed
const rulesMatrix = ref<Record<RuleTable, Record<RuleAction, boolean>>>({} as Record<RuleTable, Record<RuleAction, boolean>>)

function initMatrix() {
    const matrix = {} as Record<RuleTable, Record<RuleAction, boolean>>
    for (const table of RULE_TABLES) {
        matrix[table] = {} as Record<RuleAction, boolean>
        for (const action of RULE_ACTIONS) {
            matrix[table][action] = false
        }
    }

    // Apply existing rules
    for (const rule of props.modelValue) {
        if (matrix[rule.Table] && matrix[rule.Table][rule.Action] !== undefined) {
            matrix[rule.Table][rule.Action] = rule.Allowed
        }
    }

    rulesMatrix.value = matrix
}

function updateRules() {
    const rules: Rule[] = []
    for (const table of RULE_TABLES) {
        for (const action of RULE_ACTIONS) {
            if (rulesMatrix.value[table][action]) {
                rules.push({
                    Table: table,
                    Action: action,
                    Allowed: true
                })
            }
        }
    }
    emit('update:modelValue', rules)
}

function toggleRule(table: RuleTable, action: RuleAction) {
    rulesMatrix.value[table][action] = !rulesMatrix.value[table][action]
    updateRules()
}

function formatTableName(table: string): string {
    return table.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function setReadOnly() {
    for (const table of RULE_TABLES) {
        rulesMatrix.value[table]['read'] = true
    }
    updateRules()
}

onMounted(() => {
    initMatrix()
})

watch(() => props.modelValue, () => {
    initMatrix()
}, { deep: true })
</script>

<template>
    <div class="rules-table-container">
        <div v-if="!readonly" class="quick-actions">
            <button class="quick-btn" @click="setReadOnly">Read only</button>
        </div>
        <div class="rules-table">
            <div class="row header">
                <div class="cell entity-header">Entity</div>
                <div class="cell" v-for="action in RULE_ACTIONS" :key="action">
                    {{ action }}
                </div>
            </div>
            <div v-for="table in RULE_TABLES" :key="table" class="row data">
                <div class="cell entity-name">{{ formatTableName(table) }}</div>
                <div class="cell checkbox-cell" v-for="action in RULE_ACTIONS" :key="action">
                    <input
                        type="checkbox"
                        :checked="rulesMatrix[table]?.[action] ?? false"
                        :disabled="readonly"
                        @change="toggleRule(table, action)"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@use '../assets/variables' as *;

.rules-table-container {
    margin-top: 14px;
}

.quick-actions {
    margin-bottom: 10px;

    .quick-btn {
        padding: 5px 10px;
        border: 1px solid $main_theme_border_color;
        border-radius: 5px;
        background-color: $main_theme_border_color_lighter1;
        color: $main_theme_border_color_darker1;
        cursor: pointer;
        font-size: 13px;

        &:hover {
            background-color: $main_theme_border_color;
        }
    }
}

.rules-table {
    display: table;
    width: 100%;
    border: 1px solid $main_theme_border_color;
    border-radius: 5px;
    overflow: hidden;

    .row {
        display: table-row;

        &.header {
            color: $main_theme_border_color_darker1;
            background-color: $main_theme_border_color_lighter1;
            text-transform: capitalize;

            .cell {
                display: table-cell;
                border-top: none;
                padding: 15px 10px;
                text-align: center;

                &.entity-header {
                    text-align: left;
                }
            }
        }

        &.data .cell {
            display: table-cell;
            border-top: 1px solid $main_theme_border_color;
            padding: 10px;
            font-weight: normal;
            text-align: center;

            &.entity-name {
                text-align: left;
            }

            &.checkbox-cell {
                input[type="checkbox"] {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                    accent-color: $main_theme_active_color;
                }
            }
        }
    }
}
</style>
