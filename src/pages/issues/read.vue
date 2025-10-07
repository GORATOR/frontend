<script setup lang="ts">
import {MenuItem} from "../../models/sidebarMenuItem.ts";
import Sidebar from "../../components/Sidebar.vue";
import CollapsibleSection from "../../components/CollapsibleSection.vue";
import {ref, computed} from "vue";
import {EntityName} from "../../models/count.ts";
import {Envelope} from "../../models/envelope.ts";
import {getEntityId, readEntity, generateEntityRecordUrl} from "../../service/readEntity.ts";
import {EnvelopeException} from "../../models/envelopeException.ts";

const loaded = ref(false);
const envelope = ref<Envelope>({} as Envelope);
const envelopeException = ref<EnvelopeException | null>(null);

const projectUrl = computed(() => {
  return envelope.value.project ? generateEntityRecordUrl(EntityName.Project, envelope.value.project.ID) : '#';
});

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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
};

async function initLoad() {
  try {
    envelope.value = await readEntity(EntityName.Envelope, getEntityId(EntityName.Envelope));

    if (envelope.value.EnvelopeEventExtras && envelope.value.EnvelopeEventExtras.length > 1) {
      envelopeException.value = JSON.parse(envelope.value.EnvelopeEventExtras[1].Data);
    }

    loaded.value = true;
  } catch (e) {
    console.log(e);
  }
}

initLoad();
</script>

<template>
  <Sidebar :active=MenuItem.Issues>
    <template v-if="loaded">
      <h2>Issue Details</h2>

      <div class="issue-details">
        <!-- General Information -->
        <CollapsibleSection title="General Information" :defaultExpanded="true">
          <div class="detail-field">
            <label class="field-label">Event ID:</label>
            <div class="field-value">
              <p class="monospace">{{ envelope.event_id }}</p>
            </div>
          </div>

          <div class="detail-field">
            <label class="field-label">Level:</label>
            <div class="field-value">
              <p class="level-badge" :class="`level-${envelopeException?.level || 'unknown'}`">
                {{ envelopeException?.level || 'unknown' }}
              </p>
            </div>
          </div>

          <div class="detail-field">
            <label class="field-label">Timestamp:</label>
            <div class="field-value">
              <p>{{ envelopeException?.timestamp ? formatDate(envelopeException.timestamp) : 'N/A' }}</p>
            </div>
          </div>

          <div class="detail-field">
            <label class="field-label">Created At:</label>
            <div class="field-value">
              <p>{{ formatDate(envelope.CreatedAt) }}</p>
            </div>
          </div>

          <div class="detail-field" v-if="envelope.project">
            <label class="field-label">Project:</label>
            <div class="field-value">
              <p><a :href="projectUrl" class="link">{{ envelope.project.Name }}</a></p>
            </div>
          </div>

          <div class="detail-field" v-if="envelopeException?.environment">
            <label class="field-label">Environment:</label>
            <div class="field-value">
              <p>{{ envelopeException.environment }}</p>
            </div>
          </div>

          <div class="detail-field" v-if="envelopeException?.server_name">
            <label class="field-label">Server Name:</label>
            <div class="field-value">
              <p>{{ envelopeException.server_name }}</p>
            </div>
          </div>

          <div class="detail-field" v-if="envelopeException?.platform">
            <label class="field-label">Platform:</label>
            <div class="field-value">
              <p>{{ envelopeException.platform }}</p>
            </div>
          </div>
        </CollapsibleSection>

        <!-- Exception Information -->
        <CollapsibleSection title="Exception Information" :defaultExpanded="true" v-if="exceptionValue">
          <div class="detail-field">
            <label class="field-label">Exception Type:</label>
            <div class="field-value">
              <p class="exception-type">{{ exceptionValue.type }}</p>
            </div>
          </div>

          <div class="detail-field">
            <label class="field-label">Exception Message:</label>
            <div class="field-value">
              <p class="exception-message">{{ exceptionValue.value }}</p>
            </div>
          </div>

          <div class="detail-field" v-if="exceptionValue.mechanism">
            <label class="field-label">Mechanism:</label>
            <div class="field-value">
              <p>{{ exceptionValue.mechanism.type }}
                <span class="badge" :class="exceptionValue.mechanism.handled ? 'handled' : 'unhandled'">
                  {{ exceptionValue.mechanism.handled ? 'handled' : 'unhandled' }}
                </span>
              </p>
            </div>
          </div>
        </CollapsibleSection>

        <!-- Stack Trace -->
        <CollapsibleSection title="Stack Trace" :defaultExpanded="true" v-if="exceptionValue?.stacktrace?.frames">
          <div class="stacktrace-container">
            <div v-for="(frame, index) in exceptionValue.stacktrace.frames"
                 :key="index"
                 class="stack-frame"
                 :class="{ 'in-app': frame.in_app }">
              <div class="frame-header">
                <span class="frame-function">{{ frame.function }}</span>
                <span class="frame-location">{{ frame.filename }}:{{ frame.lineno }}</span>
              </div>
              <div class="frame-path">{{ frame.abs_path }}</div>

              <div class="frame-code" v-if="frame.context_line">
                <div v-if="frame.pre_context" class="pre-context">
                  <div v-for="(line, i) in frame.pre_context" :key="i" class="code-line">
                    <span class="line-number">{{ frame.lineno - frame.pre_context.length + i }}</span>
                    <span class="line-code">{{ line }}</span>
                  </div>
                </div>
                <div class="context-line">
                  <span class="line-number">{{ frame.lineno }}</span>
                  <span class="line-code">{{ frame.context_line }}</span>
                </div>
                <div v-if="frame.post_context" class="post-context">
                  <div v-for="(line, i) in frame.post_context" :key="i" class="code-line">
                    <span class="line-number">{{ frame.lineno + i + 1 }}</span>
                    <span class="line-code">{{ line }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        <!-- SDK Information -->
        <CollapsibleSection title="SDK Information" :defaultExpanded="false" v-if="envelope.sdk || envelopeException?.sdk">
          <div class="detail-field" v-if="envelope.sdk">
            <label class="field-label">SDK:</label>
            <div class="field-value">
              <p>{{ envelope.sdk.name }} ({{ envelope.sdk.version }})</p>
            </div>
          </div>

          <div class="detail-field" v-if="envelopeException?.sdk?.integrations">
            <label class="field-label">Integrations:</label>
            <div class="field-value">
              <p>{{ envelopeException.sdk.integrations.join(', ') }}</p>
            </div>
          </div>
        </CollapsibleSection>

        <!-- Context Information -->
        <CollapsibleSection title="Context Information" :defaultExpanded="false" v-if="envelopeException?.contexts">
          <div class="detail-field" v-if="envelopeException.contexts.trace">
            <label class="field-label">Trace ID:</label>
            <div class="field-value">
              <p class="monospace">{{ envelopeException.contexts.trace.trace_id }}</p>
            </div>
          </div>

          <div class="detail-field" v-if="envelopeException.contexts.trace">
            <label class="field-label">Span ID:</label>
            <div class="field-value">
              <p class="monospace">{{ envelopeException.contexts.trace.span_id }}</p>
            </div>
          </div>

          <div class="detail-field" v-if="envelopeException.contexts.runtime">
            <label class="field-label">Runtime:</label>
            <div class="field-value">
              <p>{{ envelopeException.contexts.runtime.name }} {{ envelopeException.contexts.runtime.version }}</p>
            </div>
          </div>
        </CollapsibleSection>

        <!-- Extra Information -->
        <CollapsibleSection title="Extra Information" :defaultExpanded="false" v-if="envelopeException?.extra && Object.keys(envelopeException.extra).length > 0">
          <div class="detail-field" v-for="(value, key) in envelopeException.extra" :key="key">
            <label class="field-label">{{ key }}:</label>
            <div class="field-value">
              <pre class="extra-value">{{ JSON.stringify(value, null, 2) }}</pre>
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </template>
  </Sidebar>
</template>

<style scoped lang="scss">
@use '../../assets/variables' as *;

.issue-details {
  margin-top: 20px;

  .detail-field {
    display: flex;
    margin-bottom: 15px;
    align-items: flex-start;

    &:last-child {
      margin-bottom: 0;
    }

    .field-label {
      font-weight: 600;
      min-width: 180px;
      padding-top: 8px;
      color: #333;
    }

    .field-value {
      flex: 1;

      p {
        margin: 0;
        padding: 8px 0;
        color: #666;
      }

      .monospace {
        font-family: 'Courier New', monospace;
        font-size: 13px;
      }

      .link {
        color: $main_theme_active_color;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }

      .level-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 4px;
        font-weight: 600;
        text-transform: uppercase;
        font-size: 12px;

        &.level-error {
          background: #ffebee;
          color: #c62828;
        }

        &.level-warning {
          background: #fff3e0;
          color: #ef6c00;
        }

        &.level-info {
          background: #e3f2fd;
          color: #1565c0;
        }

        &.level-unknown {
          background: #f5f5f5;
          color: #666;
        }
      }

      .exception-type {
        font-weight: 600;
        color: #c62828;
      }

      .exception-message {
        font-style: italic;
        color: #d32f2f;
        font-weight: 500;
      }

      .badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 3px;
        font-size: 11px;
        font-weight: 600;
        margin-left: 8px;

        &.handled {
          background: #e8f5e9;
          color: #2e7d32;
        }

        &.unhandled {
          background: #ffebee;
          color: #c62828;
        }
      }

      .extra-value {
        background: #f5f5f5;
        border: 1px solid $main_theme_background_lighter1;
        border-radius: 6px;
        padding: 12px;
        overflow-x: auto;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        color: #333;
        margin: 0;
      }
    }
  }

  .stacktrace-container {
    .stack-frame {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 12px;

      &.in-app {
        background: #fff8e1;
        border-color: #ffb74d;
      }

      &:last-child {
        margin-bottom: 0;
      }

      .frame-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;

        .frame-function {
          font-weight: 600;
          color: #1976d2;
          font-family: 'Courier New', monospace;
        }

        .frame-location {
          color: #666;
          font-size: 12px;
          font-family: 'Courier New', monospace;
        }
      }

      .frame-path {
        color: #888;
        font-size: 11px;
        margin-bottom: 8px;
        font-family: 'Courier New', monospace;
      }

      .frame-code {
        background: #fff;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        overflow-x: auto;
        margin-top: 8px;

        .code-line {
          display: flex;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.5;

          .line-number {
            display: inline-block;
            min-width: 40px;
            padding: 2px 8px;
            background: #f5f5f5;
            color: #999;
            text-align: right;
            user-select: none;
            border-right: 1px solid #e0e0e0;
          }

          .line-code {
            padding: 2px 8px;
            flex: 1;
            white-space: pre;
          }
        }

        .context-line {
          display: flex;
          background: #fff9c4;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.5;

          .line-number {
            display: inline-block;
            min-width: 40px;
            padding: 2px 8px;
            background: #fff59d;
            color: #666;
            text-align: right;
            user-select: none;
            border-right: 1px solid #fdd835;
            font-weight: 600;
          }

          .line-code {
            padding: 2px 8px;
            flex: 1;
            white-space: pre;
            font-weight: 500;
          }
        }
      }
    }
  }
}
</style>
