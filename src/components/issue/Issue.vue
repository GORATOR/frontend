<script setup lang="ts">
import { Envelope } from '../../models/envelope'
import { EnvelopeException } from '../../models/envelopeException'
import { computed } from 'vue'

const props = defineProps<{
    envelope: Envelope
}>()

const envelopeException = computed<EnvelopeException | null>(() => {
    try {
        if (props.envelope.EnvelopeEventExtras && props.envelope.EnvelopeEventExtras.length > 1) {
            return JSON.parse(props.envelope.EnvelopeEventExtras[1].Data)
        }
    } catch (e) {
        console.error('Error parsing envelope exception:', e)
    }
    return null
})

const exceptionValue = computed(() => {
    if (!envelopeException.value) return null

    // Handle both formats: { values: [...] } and [...]
    if (Array.isArray(envelopeException.value.exception)) {
        return envelopeException.value.exception[0]
    } else if (envelopeException.value.exception?.values?.[0]) {
        return envelopeException.value.exception.values[0]
    }
    return null
})

const issueUrl = computed(() => {
    return `/issue/${props.envelope.ID}`
})
</script>

<template>
    <div class="envelope-container" v-if="exceptionValue">
        <div>
            <a :href="issueUrl">{{ exceptionValue.type }}</a>
        </div>
        <div class="description">
            <i>{{ exceptionValue.value }}</i>
        </div>
    </div>
</template>

<style scoped lang="scss">
.envelope-container {
    padding: 10px;
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