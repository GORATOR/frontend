<script setup lang="ts">
import { Envelope } from '../../models/envelope'
import { computed } from 'vue'
import IssueMiniChart from './IssueMiniChart.vue'
import {router} from "../../router.ts";

const props = defineProps<{
    envelope: Envelope
    count?: number
    eventType?: 'exception' | 'message'
}>()

const isMessage = computed(() => props.eventType === 'message')

const displayTitle = computed(() => {
    if (isMessage.value) {
        return props.envelope.level || 'message'
    }
    if (props.envelope.exception_type) {
        return props.envelope.exception_type
    }
    try {
        if (props.envelope.EnvelopeEventExtras && props.envelope.EnvelopeEventExtras.length > 1) {
            const parsed = JSON.parse(props.envelope.EnvelopeEventExtras[1].Data)
            if (Array.isArray(parsed.exception)) return parsed.exception[0]?.type ?? null
            if (parsed.exception?.values?.[0]) return parsed.exception.values[0].type ?? null
        }
    } catch (e) {
        console.error('Error parsing envelope exception:', e)
    }
    return null
})

const displayValue = computed(() => {
    if (isMessage.value) {
        return props.envelope.message || ''
    }
    if (props.envelope.exception_value) {
        return props.envelope.exception_value
    }
    try {
        if (props.envelope.EnvelopeEventExtras && props.envelope.EnvelopeEventExtras.length > 1) {
            const parsed = JSON.parse(props.envelope.EnvelopeEventExtras[1].Data)
            if (Array.isArray(parsed.exception)) return parsed.exception[0]?.value ?? ''
            if (parsed.exception?.values?.[0]) return parsed.exception.values[0].value ?? ''
        }
    } catch (e) {
        console.error('Error parsing envelope exception:', e)
    }
    return ''
})

const issueUrl = computed(() => `/issue/${props.envelope.ID}`)

function onIssueUrlClick(url: string) {
    router.push({ path: url })
}
</script>

<template>
    <div class="envelope-container" v-if="displayTitle">
        <div class="issue-content">
            <div class="event-type-badge" :class="eventType">
                {{ eventType ?? 'exception' }}
            </div>
            <div class="issue-info">
                <div>
                    <a @click.prevent="onIssueUrlClick(issueUrl)" :href="issueUrl">{{ displayTitle }}</a>
                </div>
                <div class="description">
                    <i>{{ displayValue }}</i>
                </div>
            </div>
            <div class="issue-count" v-if="count">
                <IssueMiniChart
                    v-if="!isMessage"
                    :exceptionType="envelope.exception_type ?? ''"
                    :exceptionValue="envelope.exception_value ?? ''"
                    :days="7"
                />
                <span class="count-badge">{{ count }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@use '../../assets/variables' as *;

.envelope-container {
    padding: 12px 16px;
    transition: background-color 0.12s ease;

    &:hover {
        background-color: $surface_subtle;
    }
}

.issue-content {
    display: flex;
    align-items: center;
    gap: 12px;
}

.event-type-badge {
    flex: 0 0 90px;
    text-align: center;
    padding: 3px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    &.exception {
        background-color: $color_danger_soft;
        color: $color_danger;
    }

    &.message {
        background-color: rgba(13, 148, 136, 0.1);
        color: rgb(15, 118, 110);
    }
}

.issue-info {
    flex: 1;
    min-width: 0;

    .description {
        color: $text_secondary;
        font-size: 13px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}

.issue-count {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.count-badge {
    background-color: rgba($main_theme_active_color, 0.08);
    color: $main_theme_active_color;
    padding: 3px 10px;
    border-radius: 999px;
    font-weight: 600;
    font-size: 13px;
    min-width: 32px;
    text-align: center;
}

a {
    color: $main_theme_active_color;
    font-weight: 600;
    text-decoration: none;

    &:visited {
        color: $main_theme_active_color;
    }
}
</style>
