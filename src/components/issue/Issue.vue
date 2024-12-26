<script setup lang="ts">
import { Envelope } from '../../models/envelope'
import { EnvelopeException } from '../../models/envelopeException'

const props = defineProps<{
    envelope: Envelope
}>()

const envelopeException: EnvelopeException = JSON.parse(
    props.envelope.EnvelopeEventExtras[1].Data)
</script>

<template>
    <div class="envelope-container">
        <div>
            <b>{{ envelopeException.exception.values[0].type }}</b>
        </div>
        <div class="description">
            <i>{{ envelopeException.exception.values[0].value }}</i>
        </div>
    </div>
</template>

<style scoped lang="scss">
.envelope-container {
    border: 1px solid black;
    border-radius: 5px;
    padding: 10px;
    margin-bottom: 10px;

    .description i {
        font-weight: normal;
    }
}
</style>