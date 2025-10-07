<script setup lang="ts">
import { Envelope } from '../../models/envelope'
import { computed } from 'vue'
import IssueMiniChart from './IssueMiniChart.vue'

const props = defineProps<{
    envelope: Envelope
    count?: number
}>()

const exceptionValue = computed(() => {
    // First, try to use the new exception_type and exception_value fields
    if (props.envelope.exception_type && props.envelope.exception_value) {
        return {
            type: props.envelope.exception_type,
            value: props.envelope.exception_value
        }
    }

    // Fallback to parsing from EnvelopeEventExtras for old data
    try {
        if (props.envelope.EnvelopeEventExtras && props.envelope.EnvelopeEventExtras.length > 1) {
            const envelopeException = JSON.parse(props.envelope.EnvelopeEventExtras[1].Data)

            // Handle both formats: { values: [...] } and [...]
            if (Array.isArray(envelopeException.exception)) {
                return envelopeException.exception[0]
            } else if (envelopeException.exception?.values?.[0]) {
                return envelopeException.exception.values[0]
            }
        }
    } catch (e) {
        console.error('Error parsing envelope exception:', e)
    }

    return null
})

const issueUrl = computed(() => {
    return `/issue/${props.envelope.ID}`
})
</script>

<template>
    <div class="envelope-container" v-if="exceptionValue">
        <div class="issue-content">
            <div class="issue-info">
                <div>
                    <a :href="issueUrl">{{ exceptionValue.type }}</a>
                </div>
                <div class="description">
                    <i>{{ exceptionValue.value }}</i>
                </div>
            </div>
            <div class="issue-count" v-if="count">
                <IssueMiniChart
                    v-if="exceptionValue"
                    :exceptionType="exceptionValue.type"
                    :exceptionValue="exceptionValue.value"
                    :days="7"
                />
                <span class="count-badge">{{ count }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.envelope-container {
    padding: 10px;
}

.issue-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
}

.issue-info {
    flex: 1;
    min-width: 0;
}

.issue-count {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
}

.count-badge {
    background-color: rgba(0, 106, 255, 0.1);
    color: rgb(0, 106, 255);
    padding: 4px 12px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 14px;
}

a {
    color: rgb(0, 106, 255);
    font-weight: bold;
    text-decoration: none;

    &:visited {
        color: rgb(0, 106, 255);
    }
}
</style>