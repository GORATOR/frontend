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
            <a href="#TODO">{{ envelopeException.exception.values[0].type }}</a>
        </div>
        <div class="description">
            <i>{{ envelopeException.exception.values[0].value }}</i>
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